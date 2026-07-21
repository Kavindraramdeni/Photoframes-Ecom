import { Magnet, Truck, ShieldCheck, Sparkles } from "lucide-react";

const REASONS = [
  {
    icon: Magnet,
    title: "Actually magnetic",
    body: "Industrial-grade neodymium magnets embedded in every frame. Snaps to fridges, lockers, whiteboards — no wall damage, ever.",
  },
  {
    icon: Sparkles,
    title: "Made from your photo",
    body: "Our customizer previews the exact crop before you order, so what you see is what arrives.",
  },
  {
    icon: Truck,
    title: "7–9 day delivery",
    body: "Every frame is manufactured to order and shipped in protective packaging across India.",
  },
  {
    icon: ShieldCheck,
    title: "Reprint guarantee",
    body: "Arrived damaged or misprinted? We reprint and reship at no cost, no questions asked.",
  },
];

export function WhyChooseUs() {
  return (
    <section id="why-ferro" className="bg-ink py-20 text-paper">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="max-w-md text-3xl font-medium sm:text-4xl">
          Why people keep coming back to Ferro
        </h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map((reason) => (
            <div key={reason.title}>
              <reason.icon className="h-6 w-6 text-indigo" aria-hidden="true" />
              <p className="mt-4 font-display text-lg">{reason.title}</p>
              <p className="mt-2 text-sm text-stone-300">{reason.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
