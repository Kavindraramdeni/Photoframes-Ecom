"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { sendShippingUpdateEmail, sendDeliveredEmail, sendRefundConfirmationEmail } from "@/lib/email";
import { sendShippedWhatsApp, sendDeliveredWhatsApp } from "@/lib/notifications";
import { createShiprocketOrder, assignCourier } from "@/lib/shiprocket";
import { restoreStockForOrder } from "@/lib/inventory";
import { razorpay } from "@/lib/razorpay";
import { sendCriticalAlert } from "@/lib/alert";
import type { OrderStatus } from "@prisma/client";

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const profile = await prisma.profile.findUnique({ where: { id: user.id } });
  if (!profile || profile.role !== "ADMIN") throw new Error("Not authorized");
}

/**
 * Books the order with Shiprocket (creates the order, then assigns a
 * courier + AWB) and saves the tracking details. Best-effort: if
 * Shiprocket isn't configured or the API call fails, we log it and let
 * the admin fall back to booking manually from the Shiprocket dashboard
 * — this never blocks the status update itself.
 */
async function tryBookShiprocket(orderId: string) {
  if (!process.env.SHIPROCKET_EMAIL || !process.env.SHIPROCKET_PASSWORD) {
    return null;
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { frameSize: true, frameStyle: true } } },
  });
  if (!order || order.trackingId) return null; // already booked

  try {
    const totalWeightGrams = order.items.reduce(
      (sum, item) => sum + item.frameSize.weightGrams * item.quantity,
      0
    );

    const created = await createShiprocketOrder({
      orderNumber: order.orderNumber,
      orderDate: order.createdAt,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail,
      addressLine1: order.addressLine1,
      addressLine2: order.addressLine2,
      city: order.city,
      state: order.state,
      pincode: order.pincode,
      items: order.items.map((item) => ({
        name: `${item.frameStyleName} (${item.frameSizeLabel})`,
        quantity: item.quantity,
        unitPricePaise: item.unitPrice,
      })),
      subtotalPaise: order.subtotal,
      totalWeightGrams,
      // A single small padded box comfortably fits most acrylic/wood
      // fridge-frame orders; adjust if you ship larger items.
      dimensionsCm: { length: 20, breadth: 15, height: 5 },
    });

    const assigned = await assignCourier(created.shipmentId);

    await prisma.order.update({
      where: { id: order.id },
      data: {
        shiprocketOrderId: created.shiprocketOrderId,
        shiprocketShipmentId: created.shipmentId,
        courierName: assigned.courierName,
        trackingId: assigned.awb,
        trackingUrl: assigned.trackingUrl,
      },
    });

    return assigned;
  } catch (err) {
    console.error(`Shiprocket booking failed for order ${order.orderNumber}:`, err);
    await prisma.orderEvent.create({
      data: {
        orderId: order.id,
        status: order.status,
        note: "Automatic Shiprocket booking failed — book manually from the Shiprocket dashboard.",
      },
    });
    await sendCriticalAlert("Shiprocket auto-booking failed", {
      orderNumber: order.orderNumber,
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus, note?: string) {
  await assertAdmin();

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });

  await prisma.orderEvent.create({
    data: { orderId, status, note: note || `Status changed to ${status}` },
  });

  if (status === "SHIPPED") {
    const booking = await tryBookShiprocket(orderId);
    const trackingUrl = booking?.trackingUrl ?? undefined;
    const courierName = booking?.courierName ?? undefined;

    await Promise.allSettled([
      sendShippingUpdateEmail({
        customerEmail: order.customerEmail,
        customerName: order.customerName,
        orderNumber: order.orderNumber,
        trackingNote: trackingUrl ? `Track your order: ${trackingUrl}` : note,
      }),
      sendShippedWhatsApp({
        phone: order.customerPhone,
        customerName: order.customerName,
        orderNumber: order.orderNumber,
        trackingUrl,
        courierName,
      }),
    ]);
  }

  if (status === "DELIVERED") {
    await Promise.allSettled([
      sendDeliveredEmail({
        customerEmail: order.customerEmail,
        customerName: order.customerName,
        orderNumber: order.orderNumber,
      }),
      sendDeliveredWhatsApp({
        phone: order.customerPhone,
        customerName: order.customerName,
        orderNumber: order.orderNumber,
      }),
    ]);
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}

/**
 * Cancels a paid order and issues a full refund via Razorpay, restores
 * stock for any tracked sizes, and notifies the customer. Only valid for
 * orders that have actually been captured — for orders still pending
 * payment, there's nothing to refund; just leave them to expire.
 */
export async function cancelAndRefundOrder(orderId: string, reason?: string) {
  await assertAdmin();

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order not found");
  if (order.paymentStatus !== "CAPTURED") {
    throw new Error("Only captured payments can be refunded");
  }
  if (!order.razorpayPaymentId) {
    throw new Error("No Razorpay payment recorded on this order");
  }

  await razorpay.payments.refund(order.razorpayPaymentId, {
    amount: order.total,
    speed: "normal",
    notes: reason ? { reason } : undefined,
  });

  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED", paymentStatus: "REFUNDED" },
    }),
    prisma.orderEvent.create({
      data: {
        orderId,
        status: "CANCELLED",
        note: reason ? `Cancelled and refunded: ${reason}` : "Cancelled and refunded",
      },
    }),
  ]);

  await restoreStockForOrder(orderId);

  await sendRefundConfirmationEmail({
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    amount: order.total,
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}

