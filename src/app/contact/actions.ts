"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(100),
  email: z.string().trim().email("Enter a valid email"),
  message: z.string().trim().min(10, "Tell us a bit more (10+ characters)").max(2000),
});

export interface ContactFormState {
  success: boolean;
  error?: string;
}

export async function submitContactForm(
  _prev: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const headersList = await headers();
  const clientIp = headersList.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const limit = rateLimit(`contact:${clientIp}`, 5, 10 * 60 * 1000);
  if (!limit.success) {
    return { success: false, error: "Too many messages sent. Please try again in a few minutes." };
  }

  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  await prisma.contactMessage.create({ data: parsed.data });

  // Best-effort email notification — the message is already safely
  // persisted above even if this fails or RESEND_API_KEY isn't set.
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.EMAIL_FROM || "Ferro <orders@ferro.store>",
        to: process.env.ADMIN_NOTIFICATION_EMAIL || "admin@ferro.store",
        replyTo: parsed.data.email,
        subject: `New contact form message from ${parsed.data.name}`,
        text: parsed.data.message,
      });
    } catch {
      // Message is saved; email is a convenience, not the source of truth.
    }
  }

  return { success: true };
}
