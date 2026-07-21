"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, subtotal, isLoading, updateQuantity, removeItem } = useCart();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center text-graphite">
        Loading your cart…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl text-ink">Your cart is empty</h1>
        <p className="mt-2 text-graphite">Design a frame and it&apos;ll show up here.</p>
        <Button asChild size="lg" className="mt-6">
          <Link href="/products">Shop Frames</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl text-ink">Your Cart</h1>

      <div className="mt-8 divide-y divide-line border-y border-line">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4 py-6">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-line bg-stone-200">
              <Image
                src={item.images[0].thumbnailUrl ?? item.images[0].imageUrl}
                alt="Your uploaded photo, cropped for this frame"
                fill
                sizes="96px"
                className="object-cover"
                style={{
                  transform: `translate(${item.images[0].cropX}%, ${item.images[0].cropY}%) scale(${item.images[0].zoom}) rotate(${item.images[0].rotation}deg)`,
                }}
              />
              {item.images.length > 1 && (
                <span className="absolute bottom-1 right-1 rounded-full bg-ink/80 px-1.5 py-0.5 font-data text-[10px] text-white">
                  +{item.images.length - 1}
                </span>
              )}
            </div>

            <div className="flex flex-1 flex-col justify-between">
              <div>
                <p className="font-medium text-ink">{item.frameStyle.name}</p>
                <p className="text-sm text-graphite">
                  {item.frameSize.label} · {item.frameFinish.name}
                </p>
                <p className="mt-1 font-data text-sm text-ink">{formatPrice(item.unitPrice)} each</p>
              </div>

              <div className="mt-2 flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-line hover:bg-stone-100"
                >
                  <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <span className="w-6 text-center font-data text-sm">{item.quantity}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => updateQuantity(item.id, Math.min(20, item.quantity + 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-line hover:bg-stone-100"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="ml-4 flex items-center gap-1 text-xs font-medium text-error hover:underline"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Remove
                </button>
              </div>
            </div>

            <p className="font-data text-sm text-ink">
              {formatPrice(item.unitPrice * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-end gap-4">
        <div className="flex w-full max-w-xs justify-between text-lg">
          <span className="text-graphite">Subtotal</span>
          <span className="font-data text-ink">{formatPrice(subtotal)}</span>
        </div>
        <p className="text-xs text-graphite">Shipping and any coupon are applied at checkout.</p>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
          <Button size="lg" asChild>
            <Link href="/checkout">Proceed to Checkout</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
