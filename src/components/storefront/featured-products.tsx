import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/storefront/product-card";

export async function FeaturedProducts() {
  const styles = await prisma.frameStyle.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    take: 8,
  });

  if (styles.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-medium text-ink sm:text-4xl">Featured frames</h2>
        <p className="mt-4 rounded-xl border border-dashed border-line bg-paper-warm p-8 text-sm text-graphite">
          No frame styles yet. Add some from the admin dashboard under
          <span className="font-data"> /admin/frame-styles</span> and they&apos;ll appear here
          automatically.
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="flex items-end justify-between">
        <h2 className="text-3xl font-medium text-ink sm:text-4xl">Featured frames</h2>
        <Link href="/products" className="hidden text-sm font-medium text-indigo hover:underline sm:block">
          View all frames →
        </Link>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {styles.map((style) => (
          <ProductCard key={style.id} product={style} />
        ))}
      </div>
    </section>
  );
}
