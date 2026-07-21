import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { FrameShapePreview, type ShapeKey } from "@/components/storefront/frame-shape";

export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  shape: string;
  shapeStyle: string;
  basePrice: number;
  imageUrl: string | null;
}

export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block overflow-hidden rounded-2xl border border-line bg-paper-warm transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-stone-200 p-3">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={`${product.name} magnetic photo frame`}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full transition-transform duration-500 group-hover:scale-105">
            <FrameShapePreview shape={product.shapeStyle as ShapeKey} seed={product.id} />
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="font-medium text-ink">{product.name}</p>
        <p className="mt-0.5 text-xs uppercase tracking-wide text-graphite">{product.shape}</p>
        <p className="mt-2 font-data text-sm text-ink">from {formatPrice(product.basePrice)}</p>
      </div>
    </Link>
  );
}
