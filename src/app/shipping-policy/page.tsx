import type { Metadata } from "next";
import { PolicyLayout } from "@/components/legal/policy-layout";

export const metadata: Metadata = { title: "Shipping Policy" };

export default function ShippingPolicyPage() {
  return (
    <PolicyLayout title="Shipping Policy" updatedAt="[DATE — fill in before launch]">
      <p>
        Every frame is manufactured to order after payment is confirmed. Production takes
        2–3 business days, followed by delivery — typically 5–7 business days across India,
        depending on your location.
      </p>
      <h2>Shipping charges</h2>
      <p>
        [Fill in from your live Settings page — e.g. &ldquo;Free shipping on all orders&rdquo; or &ldquo;₹X flat
        rate, free above ₹Y.&rdquo;] This is configurable by an admin at /admin/settings and should
        match what&apos;s stated here.
      </p>
      <h2>Order tracking</h2>
      <p>
        You&apos;ll receive an email with tracking details once your order ships. You can also check
        order status by replying to your confirmation email.
      </p>
      <h2>Delivery issues</h2>
      <p>
        If your order hasn&apos;t arrived within 12 business days, or arrives damaged, contact us at
        [support email] with your order number and we&apos;ll resolve it — including a free reprint
        and reship if the item was damaged in transit.
      </p>
      <h2>Serviceable areas</h2>
      <p>
        We currently ship across India via our courier partners. International shipping is not
        yet available.
      </p>
    </PolicyLayout>
  );
}
