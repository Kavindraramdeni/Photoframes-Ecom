/**
 * WhatsApp + SMS via Twilio.
 *
 * Setup:
 * 1. Create a Twilio account, get a WhatsApp-enabled sender (Twilio Sandbox
 *    for testing, or a approved WhatsApp Business sender for production —
 *    that approval process takes 1-2 weeks, start it early).
 * 2. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM
 *    (format: "whatsapp:+14155238886"), TWILIO_SMS_FROM in your env.
 * 3. WhatsApp requires the recipient to have messaged your number first
 *    OR you use a pre-approved template message for the first contact —
 *    order confirmations typically qualify as a "session message" once
 *    the customer has interacted with your storefront/checkout, but
 *    confirm your approved templates in the Twilio console before relying
 *    on this for cold outreach.
 *
 * Falls back to SMS automatically if WhatsApp isn't configured, so this
 * works even before your WhatsApp Business approval comes through.
 */

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM;
const SMS_FROM = process.env.TWILIO_SMS_FROM;

function toIndianE164(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
  return phone.startsWith("+") ? phone : `+${digits}`;
}

async function sendTwilioMessage(to: string, body: string, useWhatsApp: boolean) {
  if (!ACCOUNT_SID || !AUTH_TOKEN) {
    console.warn("Twilio not configured — skipping WhatsApp/SMS send.");
    return;
  }

  const from = useWhatsApp && WHATSAPP_FROM ? WHATSAPP_FROM : SMS_FROM;
  if (!from) {
    console.warn("No Twilio sender configured for this channel — skipping send.");
    return;
  }

  const e164 = toIndianE164(to);
  const toAddress = useWhatsApp && WHATSAPP_FROM ? `whatsapp:${e164}` : e164;

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${ACCOUNT_SID}:${AUTH_TOKEN}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ From: from, To: toAddress, Body: body }),
    }
  );

  if (!res.ok) {
    console.error(`Twilio send failed (${useWhatsApp ? "WhatsApp" : "SMS"}):`, await res.text());
  }
}

/** Tries WhatsApp first (richer, usually preferred by customers in India), falls back to SMS. */
async function sendNotification(to: string, body: string) {
  if (WHATSAPP_FROM) {
    await sendTwilioMessage(to, body, true);
  } else {
    await sendTwilioMessage(to, body, false);
  }
}

export async function sendOrderConfirmationWhatsApp(params: {
  phone: string;
  customerName: string;
  orderNumber: string;
  total: string; // pre-formatted, e.g. "₹1,299"
}) {
  await sendNotification(
    params.phone,
    `Hi ${params.customerName.split(" ")[0]}, your Ferro order ${params.orderNumber} (${params.total}) is confirmed and going into production. We'll message you again when it ships!`
  );
}

export async function sendShippedWhatsApp(params: {
  phone: string;
  customerName: string;
  orderNumber: string;
  trackingUrl?: string;
  courierName?: string;
}) {
  const trackLine = params.trackingUrl
    ? ` Track it here: ${params.trackingUrl}`
    : "";
  await sendNotification(
    params.phone,
    `Your Ferro order ${params.orderNumber} has shipped${params.courierName ? ` via ${params.courierName}` : ""}.${trackLine}`
  );
}

export async function sendDeliveredWhatsApp(params: {
  phone: string;
  customerName: string;
  orderNumber: string;
}) {
  await sendNotification(
    params.phone,
    `Your Ferro order ${params.orderNumber} has been delivered. We hope you love it! Reply if anything's not right and we'll sort it out.`
  );
}
