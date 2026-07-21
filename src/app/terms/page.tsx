import type { Metadata } from "next";
import { PolicyLayout } from "@/components/legal/policy-layout";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <PolicyLayout title="Terms of Service" updatedAt="[DATE — fill in before launch]">
      <p>
        These terms govern your use of ferro.store, operated by [legal business name],
        [business address], [GSTIN if registered]. By placing an order, you agree to them.
        Have a lawyer review this before publishing — this is a starting draft, not legal advice.
      </p>
      <h2>Orders and pricing</h2>
      <p>
        All prices are listed in INR and inclusive of applicable taxes unless stated otherwise.
        We reserve the right to correct pricing errors before an order is confirmed.
      </p>
      <h2>Your uploaded content</h2>
      <p>
        You confirm you own or have permission to use every photo you upload, and that it
        doesn&apos;t infringe anyone&apos;s rights or contain unlawful content. We may decline to print
        content that violates this.
      </p>
      <h2>Payment</h2>
      <p>
        Payments are processed securely by Razorpay. We do not store your card or bank details.
      </p>
      <h2>Shipping and returns</h2>
      <p>
        See our <a href="/shipping-policy">Shipping Policy</a> and{" "}
        <a href="/returns">Returns & Refunds</a> pages for details.
      </p>
      <h2>Limitation of liability</h2>
      <p>
        [Fill in with your business&apos;s actual liability terms — typically limits liability to
        the order value and excludes indirect/consequential damages. Get legal review.]
      </p>
      <h2>Governing law</h2>
      <p>These terms are governed by the laws of India, with courts in [your city] having jurisdiction.</p>
      <h2>Contact</h2>
      <p>[support email] · [business address]</p>
    </PolicyLayout>
  );
}
