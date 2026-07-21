import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { getOrCreateCart } from "@/lib/cart-session";
import { decrementStockForOrder } from "@/lib/inventory";
import { sendOrderConfirmationEmail, sendAdminNewOrderEmail } from "@/lib/email";
import { sendOrderConfirmationWhatsApp } from "@/lib/notifications";
import { formatPrice } from "@/lib/utils";

const verifySchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = verifySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Malformed payment payload" }, { status: 400 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;

  const isValid = verifyRazorpaySignature({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });

  if (!isValid) {
    return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { razorpayOrderId: razorpay_order_id },
    include: { items: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Idempotent: if a retry lands here after the order is already marked
  // paid, just return success without double-processing.
  if (order.paymentStatus !== "CAPTURED") {
    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: {
          status: "PROCESSING",
          paymentStatus: "CAPTURED",
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
        },
      }),
      prisma.orderEvent.create({
        data: { orderId: order.id, status: "PROCESSING", note: "Payment captured and verified" },
      }),
      ...(order.couponId
        ? [prisma.coupon.update({ where: { id: order.couponId }, data: { usedCount: { increment: 1 } } })]
        : []),
    ]);

    // Clear the cart now that its contents have become a real order.
    const cart = await getOrCreateCart();
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    await decrementStockForOrder(order.id);

    const emailData = {
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      total: order.total,
      items: order.items.map((i) => ({
        frameStyleName: i.frameStyleName,
        frameSizeLabel: i.frameSizeLabel,
        quantity: i.quantity,
        lineTotal: i.lineTotal,
      })),
    };

    await Promise.allSettled([
      sendOrderConfirmationEmail(emailData),
      sendAdminNewOrderEmail(emailData),
      sendOrderConfirmationWhatsApp({
        phone: order.customerPhone,
        customerName: order.customerName,
        orderNumber: order.orderNumber,
        total: formatPrice(order.total),
      }),
    ]);
  }

  return NextResponse.json({ orderNumber: order.orderNumber });
}
