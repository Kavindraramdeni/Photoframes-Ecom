import type { Metadata } from "next";
import { ContactForm } from "@/app/contact/contact-form";

export const metadata: Metadata = { title: "Contact Us" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl text-ink">Contact Us</h1>
      <p className="mt-2 text-graphite">
        Order questions, damaged items, or anything else — we typically reply within one
        business day.
      </p>
      <ContactForm />
    </div>
  );
}
