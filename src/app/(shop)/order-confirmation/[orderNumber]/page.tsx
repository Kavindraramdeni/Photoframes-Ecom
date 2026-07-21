import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });

  if (!order || order.paymentStatus !== "CAPTURED") {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
      <CheckCircle2 className="mx-auto h-12 w-12 text-success" aria-hidden="true" />
      <h1 className="mt-4 font-display text-3xl text-ink">Order confirmed</h1>
      <p className="mt-2 text-graphite">
        We&apos;ve emailed the receipt to <strong>{order.customerEmail}</strong>. Your order number is{" "}
        <span className="font-data text-ink">{order.orderNumber}</span>.
      </p>

      <div className="mt-8 rounded-2xl border border-line bg-paper-warm p-6 text-left">
        <ul className="divide-y divide-line">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between py-3 text-sm">
              <span className="text-ink-soft">
                {item.frameStyleName} ({item.frameSizeLabel}, {item.frameFinishName}) × {item.quantity}
              </span>
              <span className="font-data text-ink">{formatPrice(item.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t border-line pt-3 font-medium">
          <span>Total paid</span>
          <span className="font-data">{formatPrice(order.total)}</span>
        </div>
      </div>

      <p className="mt-6 text-sm text-graphite">
        Shipping to {order.addressLine1}, {order.city}, {order.state} {order.pincode}
      </p>

      <Button asChild size="lg" className="mt-8">
        <Link href="/products">Continue Shopping</Link>
      </Button>
    </div>
  );
}
