"use client";

import { ChevronDown } from "lucide-react";

export function FaqAccordion({
  items,
}: {
  items: { id: string; question: string; answer: string }[];
}) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item) => (
        <details key={item.id} className="group py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-ink marker:content-none">
            {item.question}
            <ChevronDown
              className="h-4 w-4 shrink-0 text-graphite transition-transform group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>
          <p className="mt-3 text-sm text-ink-soft">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
