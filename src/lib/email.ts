import { Resend } from "resend";
import { formatPrice } from "@/lib/utils";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || "Ferro <orders@ferro.store>";
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "admin@ferro.store";

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  items: { frameStyleName: string; frameSizeLabel: string; quantity: number; lineTotal: number }[];
}

function itemsHtml(items: OrderEmailData["items"]) {
  return items
    .map(
      (i) =>
        `<tr><td style="padding:8px 0;">${i.frameStyleName} (${i.frameSizeLabel}) × ${i.quantity}</td><td style="padding:8px 0;text-align:right;">${formatPrice(i.lineTotal)}</td></tr>`
    )
    .join("");
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set — skipping order confirmation email send.");
    return;
  }
  await resend.emails.send({
    from: FROM,
    to: data.customerEmail,
    subject: `Order confirmed — ${data.orderNumber}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;">
        <h1 style="font-size:20px;">Thanks, ${data.customerName.split(" ")[0]}!</h1>
        <p>Your order <strong>${data.orderNumber}</strong> is confirmed and heading into production.</p>
        <table style="width:100%;border-collapse:collapse;margin-top:16px;">${itemsHtml(data.items)}</table>
        <p style="margin-top:16px;font-weight:bold;">Total: ${formatPrice(data.total)}</p>
        <p style="margin-top:24px;color:#5a5d63;font-size:13px;">We'll email you again once it ships.</p>
      </div>
    `,
  });
}

export async function sendAdminNewOrderEmail(data: OrderEmailData) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set — skipping admin new-order email send.");
    return;
  }
  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `New paid order — ${data.orderNumber}`,
    html: `
      <div style="font-family:sans-serif;">
        <p>New order from ${data.customerName} (${data.customerEmail}).</p>
        <table style="width:100%;border-collapse:collapse;">${itemsHtml(data.items)}</table>
        <p style="font-weight:bold;">Total: ${formatPrice(data.total)}</p>
      </div>
    `,
  });
}

export async function sendShippingUpdateEmail(params: {
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  trackingNote?: string;
}) {
  if (!process.env.RESEND_API_KEY) return;
  await resend.emails.send({
    from: FROM,
    to: params.customerEmail,
    subject: `Your order ${params.orderNumber} has shipped`,
    html: `<div style="font-family:sans-serif;"><p>Hi ${params.customerName.split(" ")[0]}, your order <strong>${params.orderNumber}</strong> is on its way.</p>${params.trackingNote ? `<p>${params.trackingNote}</p>` : ""}</div>`,
  });
}

export async function sendLowStockAlertEmail(params: {
  frameStyleName: string;
  frameSizeLabel: string;
  remaining: number;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set — skipping low-stock alert email.");
    return;
  }
  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `Low stock: ${params.frameStyleName} (${params.frameSizeLabel})`,
    html: `
      <div style="font-family:sans-serif;">
        <p><strong>${params.frameStyleName} — ${params.frameSizeLabel}</strong> is down to
        <strong>${params.remaining}</strong> unit${params.remaining === 1 ? "" : "s"} in stock.</p>
        <p>Update stock or restock soon at /admin/frame-styles once you've replenished it.</p>
      </div>
    `,
  });
}

export async function sendRefundConfirmationEmail(params: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  amount: number;
}) {
  if (!process.env.RESEND_API_KEY) return;
  await resend.emails.send({
    from: FROM,
    to: params.customerEmail,
    subject: `Refund processed — ${params.orderNumber}`,
    html: `<div style="font-family:sans-serif;"><p>Hi ${params.customerName.split(" ")[0]}, your refund of ${formatPrice(params.amount)} for order <strong>${params.orderNumber}</strong> has been processed. It should reflect in your original payment method within 5-7 business days.</p></div>`,
  });
}

export async function sendDeliveredEmail(params: {
  customerEmail: string;
  customerName: string;
  orderNumber: string;
}) {
  if (!process.env.RESEND_API_KEY) return;
  await resend.emails.send({
    from: FROM,
    to: params.customerEmail,
    subject: `Delivered — ${params.orderNumber}`,
    html: `<div style="font-family:sans-serif;"><p>Hi ${params.customerName.split(" ")[0]}, your Ferro frame has been delivered. We hope you love it!</p></div>`,
  });
}
