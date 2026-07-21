import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/storefront/product-card";

export const metadata: Metadata = {
  title: "Shop Magnetic Photo Frames",
  description: "Browse every Ferro frame style, shape, and finish. Custom-made from your photos.",
};

const SHAPES = ["rectangle", "square", "circle", "heart", "strip"];

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ shape?: string }>;
}) {
  const { shape } = await searchParams;
  const normalizedShape = shape?.toLowerCase();

  const styles = await prisma.frameStyle.findMany({
    where: {
      isActive: true,
      ...(normalizedShape ? { shape: { equals: normalizedShape, mode: "insensitive" } } : {}),
    },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-medium text-ink">Shop Frames</h1>

      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter by shape">
        <Link
          href="/products"
          className={`rounded-full border px-4 py-1.5 text-sm ${!normalizedShape ? "border-ink bg-ink text-white" : "border-line text-ink-soft hover:border-ink"}`}
        >
          All
        </Link>
        {SHAPES.map((s) => (
          <Link
            key={s}
            href={`/products?shape=${s}`}
            className={`rounded-full border px-4 py-1.5 text-sm capitalize ${normalizedShape === s ? "border-ink bg-ink text-white" : "border-line text-ink-soft hover:border-ink"}`}
          >
            {s}
          </Link>
        ))}
      </div>

      {styles.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-line bg-paper-warm p-8 text-sm text-graphite">
          No frames match this filter yet. Try &ldquo;All&rdquo; or check back soon.
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {styles.map((style) => (
            <ProductCard key={style.id} product={style} />
          ))}
        </div>
      )}
    </div>
  );
}
