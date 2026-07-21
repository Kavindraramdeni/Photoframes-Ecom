import Image from "next/image";
import { Star } from "lucide-react";
import { prisma } from "@/lib/prisma";

export async function CustomerGallery() {
  const images = await prisma.galleryImage.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    take: 8,
  });

  return (
    <section id="gallery" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-medium text-ink sm:text-4xl">On real fridges, real shelves</h2>
      <p className="mt-2 max-w-lg text-graphite">
        Tag @ferro.frames on Instagram and we&apos;ll feature your frame here.
      </p>

      {images.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-line bg-paper-warm p-8 text-sm text-graphite">
          No gallery photos yet — add some from{" "}
          <span className="font-data">/admin/gallery</span> as customer photos come in.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((img) => (
            <div key={img.id} className="relative aspect-square overflow-hidden rounded-xl bg-stone-200">
              <Image
                src={img.imageUrl}
                alt={img.caption ?? "Customer's Ferro frame"}
                fill
                sizes="(min-width: 640px) 25vw, 50vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export async function Testimonials() {
  const testimonials = await prisma.testimonial.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    take: 6,
  });

  if (testimonials.length === 0) return null;

  return (
    <section className="bg-paper-warm py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-medium text-ink sm:text-4xl">What customers say</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.id} className="rounded-2xl border border-line bg-white p-6">
              <div className="flex gap-0.5" aria-label={`${t.rating} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < t.rating ? "fill-indigo text-indigo" : "text-line"}`}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <blockquote className="mt-4 text-sm text-ink-soft">&ldquo;{t.quote}&rdquo;</blockquote>
              <figcaption className="mt-4 font-data text-xs text-graphite">
                {t.customerName}
                {t.customerCity ? `, ${t.customerCity}` : ""}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
