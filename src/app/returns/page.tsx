import type { Metadata } from "next";
import { PolicyLayout } from "@/components/legal/policy-layout";

export const metadata: Metadata = { title: "Returns & Refunds" };

export default function ReturnsPage() {
  return (
    <PolicyLayout title="Returns & Refunds" updatedAt="[DATE — fill in before launch]">
      <p>
        Because every frame is custom-printed with your photo, we can&apos;t accept returns for
        change-of-mind. We do stand behind the quality of what we ship.
      </p>
      <h2>When we&apos;ll reprint or refund</h2>
      <ul>
        <li>Your frame arrived physically damaged in transit</li>
        <li>The print quality doesn&apos;t match the preview you approved at checkout</li>
        <li>You received the wrong size, shape, or finish</li>
        <li>Your order didn&apos;t arrive within [X] days of the estimated delivery window</li>
      </ul>
      <p>
        Email [support email] within 7 days of delivery with your order number and a photo of
        the issue. We&apos;ll reprint and reship at no cost, or refund to your original payment
        method if a reprint isn&apos;t possible.
      </p>
      <h2>Refund timelines</h2>
      <p>
        Approved refunds are processed via Razorpay back to your original payment method within
        5–7 business days of approval.
      </p>
      <h2>Cancellations</h2>
      <p>
        Orders can be cancelled for a full refund only before production begins — contact us
        immediately after placing an order if you need to cancel. Once manufacturing has
        started, the order can no longer be cancelled since the frame is made specifically for
        you.
      </p>
    </PolicyLayout>
  );
}
