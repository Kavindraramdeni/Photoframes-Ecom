"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations";
import { useCart } from "@/components/cart/cart-provider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field-error";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, isLoading } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutInput>({ resolver: zodResolver(checkoutSchema) });

  useEffect(() => {
    if (!isLoading && items.length === 0) {
      router.replace("/cart");
    }
  }, [isLoading, items.length, router]);

  async function onSubmit(data: CheckoutInput) {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const payload = await res.json();

      if (!res.ok) {
        toast.error(payload.error ?? "Couldn't start checkout. Please try again.");
        setIsSubmitting(false);
        return;
      }

      if (!scriptReady || !window.Razorpay) {
        toast.error("Payment gateway is still loading — please try again in a moment.");
        setIsSubmitting(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: payload.keyId,
        amount: payload.amount,
        currency: payload.currency,
        name: "Ferro",
        description: `Order ${payload.orderNumber}`,
        order_id: payload.razorpayOrderId,
        prefill: {
          name: payload.customerName,
          email: payload.customerEmail,
          contact: payload.customerPhone,
        },
        theme: { color: "#2f3eff" },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verifyRes = await fetch("/api/checkout/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          if (!verifyRes.ok) {
            toast.error("We couldn't verify your payment. If money was deducted, contact support.");
            setIsSubmitting(false);
            return;
          }
          const verified = await verifyRes.json();
          router.push(`/order-confirmation/${verified.orderNumber}`);
        },
        modal: {
          ondismiss: () => setIsSubmitting(false),
        },
      });

      rzp.open();
    } catch {
      toast.error("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setScriptReady(true)}
      />
      <h1 className="font-display text-3xl text-ink">Checkout</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" autoComplete="name" {...register("fullName")} error={errors.fullName?.message} />
              <FieldError message={errors.fullName?.message} />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" autoComplete="tel" placeholder="98765 43210" {...register("phone")} error={errors.phone?.message} />
              <FieldError message={errors.phone?.message} />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...register("email")} error={errors.email?.message} />
            <FieldError message={errors.email?.message} />
          </div>

          <div>
            <Label htmlFor="addressLine1">Address</Label>
            <Input id="addressLine1" autoComplete="address-line1" {...register("addressLine1")} error={errors.addressLine1?.message} />
            <FieldError message={errors.addressLine1?.message} />
          </div>

          <div>
            <Label htmlFor="addressLine2">Apartment, suite, etc. (optional)</Label>
            <Input id="addressLine2" autoComplete="address-line2" {...register("addressLine2")} />
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" autoComplete="address-level2" {...register("city")} error={errors.city?.message} />
              <FieldError message={errors.city?.message} />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input id="state" autoComplete="address-level1" {...register("state")} error={errors.state?.message} />
              <FieldError message={errors.state?.message} />
            </div>
            <div>
              <Label htmlFor="pincode">PIN code</Label>
              <Input id="pincode" inputMode="numeric" autoComplete="postal-code" {...register("pincode")} error={errors.pincode?.message} />
              <FieldError message={errors.pincode?.message} />
            </div>
          </div>

          <div>
            <Label htmlFor="couponCode">Coupon code (optional)</Label>
            <Input id="couponCode" className="uppercase" {...register("couponCode")} />
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting || items.length === 0}>
            {isSubmitting ? "Processing…" : `Pay ${formatPrice(subtotal)}`}
          </Button>
          <p className="text-center text-xs text-graphite">
            Payments are processed securely by Razorpay. Card and bank details never touch our servers.
          </p>
        </form>

        <aside className="h-fit rounded-2xl border border-line bg-paper-warm p-6">
          <h2 className="font-medium text-ink">Order summary</h2>
          <ul className="mt-4 space-y-3">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between text-sm text-ink-soft">
                <span>
                  {item.frameStyle.name} ({item.frameSize.label}) × {item.quantity}
                </span>
                <span className="font-data">{formatPrice(item.unitPrice * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-line pt-4 font-medium text-ink">
            <span>Subtotal</span>
            <span className="font-data">{formatPrice(subtotal)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
