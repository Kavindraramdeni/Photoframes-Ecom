/**
 * Sends an instant alert to Slack or Discord (both accept a compatible
 * incoming-webhook payload) for failures that need a human immediately —
 * a failed refund, a Shiprocket booking that silently didn't happen,
 * a payment signature mismatch outside the expected flow.
 *
 * This is deliberately lighter-weight than a full error-tracking SDK
 * (Sentry etc.) — it's an "someone should look at this now" channel,
 * not a replacement for proper error tracking. Add Sentry separately
 * once you want stack traces, deduping, and historical trends.
 *
 * Setup: create a Slack "Incoming Webhook" or a Discord channel webhook,
 * set ALERT_WEBHOOK_URL to its URL. Works with either with no code change.
 */
export async function sendCriticalAlert(context: string, details: Record<string, unknown>) {
  console.error(`[CRITICAL] ${context}`, details);

  const url = process.env.ALERT_WEBHOOK_URL;
  if (!url) return;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `🚨 *${context}*\n\`\`\`${JSON.stringify(details, null, 2)}\`\`\``,
        content: `🚨 **${context}**\n\`\`\`${JSON.stringify(details, null, 2)}\`\`\``,
      }),
    });
  } catch (err) {
    // Don't let a failed alert throw inside an already-failing code path.
    console.error("Failed to send critical alert webhook:", err);
  }
}
