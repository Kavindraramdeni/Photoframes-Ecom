import { prisma } from "@/lib/prisma";
import { FaqAccordion } from "@/components/storefront/faq-accordion";

export async function Faq() {
  const items = await prisma.faqItem.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  if (items.length === 0) return null;

  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-medium text-ink sm:text-4xl">Frequently asked</h2>
      <div className="mt-8">
        <FaqAccordion items={items.map((i) => ({ id: i.id, question: i.question, answer: i.answer }))} />
      </div>
    </section>
  );
}
