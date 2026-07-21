import Link from "next/link";
import { FrameShapePreview, type ShapeKey } from "@/components/storefront/frame-shape";

const CATEGORIES: { param: string; label: string; blurb: string; shape: ShapeKey }[] = [
  { param: "rectangle", label: "Rectangle", blurb: "The everyday favourite", shape: "rounded-rect" },
  { param: "square", label: "Square", blurb: "For a single close-up", shape: "rounded-square" },
  { param: "circle", label: "Circle", blurb: "A softer, modern look", shape: "circle" },
  { param: "heart", label: "Heart", blurb: "For the sentimental gift", shape: "heart" },
  { param: "strip", label: "Photo Strip", blurb: "Three photos, one frame", shape: "strip-3" },
];

export function CategoryGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="flex items-end justify-between">
        <h2 className="text-3xl font-medium text-ink sm:text-4xl">Shop by shape</h2>
        <Link href="/products" className="hidden text-sm font-medium text-indigo hover:underline sm:block">
          View all frames →
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.param}
            href={`/products?shape=${cat.param}`}
            className="group relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-2xl border border-line bg-paper-warm p-5 transition-colors hover:border-ink"
          >
            <div className="absolute inset-6 bottom-20">
              <FrameShapePreview shape={cat.shape} seed={cat.param} />
            </div>
            <p className="relative font-display text-xl text-ink">{cat.label}</p>
            <p className="relative mt-1 text-sm text-graphite">{cat.blurb}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
