import type { Metadata } from "next";
import { PolicyLayout } from "@/components/legal/policy-layout";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <PolicyLayout title="Privacy Policy" updatedAt="[DATE — fill in before launch]">
      <p>
        [Legal name of your business] (&ldquo;Ferro&rdquo;, &ldquo;we&rdquo;) operates ferro.store. This page explains
        what we collect and how it&apos;s used. Replace bracketed placeholders with your actual
        business details before publishing.
      </p>
      <h2>What we collect</h2>
      <ul>
        <li>Contact and shipping details you provide at checkout (name, email, phone, address)</li>
        <li>The photos you upload to customize a frame, stored to fulfil your order</li>
        <li>Order and payment records (payments are processed by Razorpay — we never see or store your card/UPI details)</li>
        <li>Basic usage data (pages visited, device type) for site analytics</li>
      </ul>
      <h2>How we use it</h2>
      <ul>
        <li>To manufacture and ship your order</li>
        <li>To send order confirmation, shipping, and delivery emails</li>
        <li>To respond to support requests</li>
        <li>To improve the site and prevent fraud</li>
      </ul>
      <h2>Your photos</h2>
      <p>
        Uploaded photos are used solely to print your order and are stored securely. We do not
        sell, share, or use your photos for marketing without your explicit consent.
      </p>
      <h2>Third parties we share data with</h2>
      <ul>
        <li>Razorpay — payment processing</li>
        <li>Supabase — database and file storage hosting</li>
        <li>Our courier partner — for delivery, limited to name/address/phone</li>
        <li>Resend — transactional email delivery</li>
      </ul>
      <h2>Your rights</h2>
      <p>
        You can request a copy of your data or ask us to delete your account and associated
        data (subject to legal record-keeping requirements for completed orders) by emailing
        [support email].
      </p>
      <h2>Contact</h2>
      <p>Questions about this policy: [support email].</p>
    </PolicyLayout>
  );
}
