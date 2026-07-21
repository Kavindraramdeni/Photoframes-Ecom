import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { sendOrderConfirmationEmail, sendAdminNewOrderEmail } from "@/lib/email";
import { sendOrderConfirmationWhatsApp } from "@/lib/notifications";
import { formatPrice } from "@/lib/utils";
import { getOrCreateCart } from "@/lib/cart-session";
import { decrementStockForOrder } from "@/lib/inventory";

/**
 * Razorpay Dashboard → Settings → Webhooks → add this route's public URL,
 * subscribe to: payment.captured, payment.failed, refund.processed.
 * Set the same secret as RAZORPAY_WEBHOOK_SECRET.
 *
 * This is a safety net alongside /api/checkout/verify, not a replacement:
 * the synchronous verify call handles the common case fast; this handles
 * async/delayed captures (UPI, netbanking) and cases where the customer
 * closed the tab before the client-side handler fired.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature || !verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody);

  switch (event.event) {
    case "payment.captured": {
      const payment = event.payload.payment.entity;
      const order = await prisma.order.findUnique({
        where: { razorpayOrderId: payment.order_id },
        include: { items: true },
      });
      if (!order || order.paymentStatus === "CAPTURED") break;

      await prisma.$transaction([
        prisma.order.update({
          where: { id: order.id },
          data: {
            status: "PROCESSING",
            paymentStatus: "CAPTURED",
            razorpayPaymentId: payment.id,
          },
        }),
        prisma.orderEvent.create({
          data: { orderId: order.id, status: "PROCESSING", note: "Payment captured (webhook)" },
        }),
      ]);

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
      break;
    }

    case "payment.failed": {
      const payment = event.payload.payment.entity;
      const order = await prisma.order.findUnique({ where: { razorpayOrderId: payment.order_id } });
      if (!order) break;

      await prisma.$transaction([
        prisma.order.update({
          where: { id: order.id },
          data: { paymentStatus: "FAILED" },
        }),
        prisma.orderEvent.create({
          data: {
            orderId: order.id,
            status: order.status,
            note: `Payment failed: ${payment.error_description ?? "unknown reason"}`,
          },
        }),
      ]);
      break;
    }

    case "refund.processed": {
      const refund = event.payload.refund.entity;
      const order = await prisma.order.findFirst({ where: { razorpayPaymentId: refund.payment_id } });
      if (!order) break;

      await prisma.$transaction([
        prisma.order.update({
          where: { id: order.id },
          data: { status: "REFUNDED", paymentStatus: "REFUNDED" },
        }),
        prisma.orderEvent.create({
          data: { orderId: order.id, status: "REFUNDED", note: "Refund processed via Razorpay" },
        }),
      ]);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
