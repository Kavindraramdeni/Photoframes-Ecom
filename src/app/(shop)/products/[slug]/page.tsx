import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Customizer } from "@/components/customizer/customizer";

async function getFrameStyle(slug: string) {
  return prisma.frameStyle.findUnique({
    where: { slug, isActive: true },
    include: {
      sizes: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
      finishes: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const style = await getFrameStyle(slug);
  if (!style) return {};
  return {
    title: style.name,
    description:
      style.description ?? `Custom ${style.name} magnetic photo frame, made from your own photo.`,
    openGraph: style.imageUrl ? { images: [style.imageUrl] } : undefined,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const style = await getFrameStyle(slug);

  if (!style || style.sizes.length === 0 || style.finishes.length === 0) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: style.name,
    description: style.description ?? undefined,
    image: style.imageUrl ?? undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: (style.basePrice / 100).toFixed(2),
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Customizer
        frameStyleId={style.id}
        frameStyleName={style.name}
        basePrice={style.basePrice}
        photoSlots={style.photoSlots}
        sizes={style.sizes}
        finishes={style.finishes}
      />
    </div>
  );
}
