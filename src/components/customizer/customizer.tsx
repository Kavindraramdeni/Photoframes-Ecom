"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Minus, Plus, Check } from "lucide-react";
import { PhotoSlot, type SlotState } from "@/components/customizer/photo-slot";
import { Button } from "@/components/ui/button";
import { useCart, type CartPhoto } from "@/components/cart/cart-provider";
import { formatPrice, cn } from "@/lib/utils";

export interface CustomizerFrameSize {
  id: string;
  label: string;
  widthMm: number;
  heightMm: number;
  priceDelta: number;
  trackInventory: boolean;
  stockQuantity: number;
}

export interface CustomizerFrameFinish {
  id: string;
  name: string;
  hexSwatch: string | null;
  priceDelta: number;
}

export function Customizer({
  frameStyleId,
  frameStyleName,
  basePrice,
  photoSlots,
  sizes,
  finishes,
}: {
  frameStyleId: string;
  frameStyleName: string;
  basePrice: number;
  photoSlots: number;
  sizes: CustomizerFrameSize[];
  finishes: CustomizerFrameFinish[];
}) {
  const { addItem } = useCart();

  const [slots, setSlots] = useState<(SlotState | null)[]>(() => Array(photoSlots).fill(null));
  const [sizeId, setSizeId] = useState(
    sizes.find((s) => !s.trackInventory || s.stockQuantity > 0)?.id ?? sizes[0]?.id ?? ""
  );
  const [finishId, setFinishId] = useState(finishes[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const selectedSize = sizes.find((s) => s.id === sizeId);
  const selectedFinish = finishes.find((f) => f.id === finishId);

  const unitPrice = basePrice + (selectedSize?.priceDelta ?? 0) + (selectedFinish?.priceDelta ?? 0);
  const total = unitPrice * quantity;

  const aspectRatio = useMemo(() => {
    if (!selectedSize) return 1;
    // Strip products divide one tall frame into N stacked photo slots —
    // approximate each slot as roughly square-ish within that division.
    if (photoSlots > 1) return selectedSize.widthMm / (selectedSize.heightMm / photoSlots);
    return selectedSize.widthMm / selectedSize.heightMm;
  }, [selectedSize, photoSlots]);

  const isOutOfStock = !!selectedSize?.trackInventory && selectedSize.stockQuantity <= 0;
  const maxQuantity = selectedSize?.trackInventory ? Math.max(0, selectedSize.stockQuantity) : 20;

  useEffect(() => {
    if (maxQuantity > 0 && quantity > maxQuantity) setQuantity(maxQuantity);
  }, [maxQuantity, quantity]);

  const allSlotsFilled = slots.every((s) => s !== null);
  const canAddToCart =
    allSlotsFilled && selectedSize && selectedFinish && quantity >= 1 && !isOutOfStock;

  async function handleAddToCart() {
    if (!canAddToCart || !selectedSize || !selectedFinish) return;
    setIsAdding(true);

    const images: CartPhoto[] = slots.map((slot) => ({
      imageUrl: slot!.publicUrl,
      thumbnailUrl: slot!.publicUrl,
      cropX: slot!.transform.x,
      cropY: slot!.transform.y,
      zoom: slot!.transform.zoom,
      rotation: slot!.transform.rotation,
    }));

    const success = await addItem({
      frameStyleId,
      frameSizeId: selectedSize.id,
      frameFinishId: selectedFinish.id,
      quantity,
      images,
    });
    setIsAdding(false);
    if (success) {
      setJustAdded(true);
      setSlots(Array(photoSlots).fill(null));
      setQuantity(1);
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div className={cn("flex flex-col gap-6", photoSlots > 1 && "sm:flex-row sm:flex-wrap sm:justify-center")}>
        {slots.map((slot, i) => (
          <PhotoSlot
            key={i}
            label={photoSlots > 1 ? `Photo ${i + 1} of ${photoSlots}` : undefined}
            aspectRatio={aspectRatio}
            value={slot}
            onChange={(value) =>
              setSlots((cur) => cur.map((s, idx) => (idx === i ? value : s)))
            }
          />
        ))}
      </div>

      <div>
        <h1 className="font-display text-3xl text-ink">{frameStyleName}</h1>
        <p className="mt-1 font-data text-lg text-ink">{formatPrice(unitPrice)}</p>

        <fieldset className="mt-8">
          <legend className="text-sm font-medium text-ink">
            Size {selectedSize && <span className="text-graphite">— {selectedSize.label}</span>}
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {sizes.map((size) => {
              const outOfStock = size.trackInventory && size.stockQuantity <= 0;
              const lowStock = size.trackInventory && size.stockQuantity > 0 && size.stockQuantity <= 5;
              return (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => !outOfStock && setSizeId(size.id)}
                  disabled={outOfStock}
                  aria-pressed={sizeId === size.id}
                  aria-disabled={outOfStock}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm transition-colors",
                    outOfStock
                      ? "cursor-not-allowed border-line text-graphite/50 line-through"
                      : sizeId === size.id
                        ? "border-ink bg-ink text-white"
                        : "border-line text-ink-soft hover:border-ink"
                  )}
                >
                  {size.label}
                  {outOfStock && " (out of stock)"}
                  {!outOfStock && lowStock && ` (${size.stockQuantity} left)`}
                </button>
              );
            })}
          </div>
          {isOutOfStock && (
            <p className="mt-2 text-xs font-medium text-error">
              This size is currently out of stock — pick another size, or check back soon.
            </p>
          )}
        </fieldset>

        <fieldset className="mt-6">
          <legend className="text-sm font-medium text-ink">
            Finish {selectedFinish && <span className="text-graphite">— {selectedFinish.name}</span>}
          </legend>
          <div className="mt-3 flex flex-wrap gap-3">
            {finishes.map((finish) => (
              <button
                key={finish.id}
                type="button"
                onClick={() => setFinishId(finish.id)}
                aria-pressed={finishId === finish.id}
                aria-label={finish.name}
                title={finish.name}
                className={cn(
                  "h-9 w-9 rounded-full border-2 transition-transform",
                  finishId === finish.id ? "border-indigo scale-110" : "border-line"
                )}
                style={{ backgroundColor: finish.hexSwatch ?? "#e5e5e5" }}
              />
            ))}
          </div>
        </fieldset>

        <div className="mt-6">
          <p className="text-sm font-medium text-ink">Quantity</p>
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line hover:bg-stone-100"
            >
              <Minus className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="w-8 text-center font-data" aria-live="polite">
              {quantity}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => setQuantity((q) => Math.min(maxQuantity || 1, q + 1))}
              disabled={quantity >= maxQuantity}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          {selectedSize?.trackInventory && selectedSize.stockQuantity > 0 && (
            <p className="mt-1 text-xs text-graphite">{selectedSize.stockQuantity} available</p>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between rounded-xl border border-line bg-paper-warm px-5 py-4">
          <span className="text-sm text-graphite">Total</span>
          <span className="font-data text-xl text-ink">{formatPrice(total)}</span>
        </div>

        <Button
          size="lg"
          className="mt-4 w-full"
          disabled={!canAddToCart || isAdding}
          onClick={handleAddToCart}
        >
          {isAdding
            ? "Adding…"
            : isOutOfStock
              ? "Out of stock"
              : !allSlotsFilled
                ? photoSlots > 1
                  ? `Upload ${photoSlots} photos to continue`
                  : "Upload a photo to continue"
                : "Add to Cart"}
        </Button>

        {justAdded && (
          <div className="mt-4 flex flex-col gap-3 rounded-xl border border-success/30 bg-success/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-sm text-success">
              <Check className="h-4 w-4" aria-hidden="true" /> Added to your cart
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setJustAdded(false)}
                className="text-sm font-medium text-ink underline-offset-4 hover:underline"
              >
                Customize another
              </button>
              <Link href="/cart" className="text-sm font-medium text-indigo underline-offset-4 hover:underline">
                Go to cart →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
