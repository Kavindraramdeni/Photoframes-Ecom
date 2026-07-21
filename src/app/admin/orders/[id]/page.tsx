import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { OrderStatusForm } from "@/app/admin/orders/[id]/status-form";
import { RefundButton } from "@/app/admin/orders/[id]/refund-button";
import { Download } from "lucide-react";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { images: true } },
      timeline: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!order) notFound();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-data text-2xl text-ink">{order.orderNumber}</h1>
          <p className="text-sm text-graphite">
            Placed {order.createdAt.toLocaleString("en-IN")}
          </p>
        </div>
        <a
          href={`/api/admin/orders/${order.id}/photos`}
          className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-medium hover:bg-stone-100"
        >
          <Download className="h-4 w-4" aria-hidden="true" /> Download all photos (.zip)
        </a>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <section className="rounded-xl border border-line p-5">
            <h2 className="font-medium text-ink">Items</h2>
            <ul className="mt-4 divide-y divide-line">
              {order.items.map((item) => (
                <li key={item.id} className="flex gap-4 py-4">
                  {item.images.length > 0 && (
                    <div className="flex shrink-0 gap-1.5">
                      {item.images.map((img, i) => (
                        <a
                          key={img.id}
                          href={img.originalPath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative h-20 w-20 overflow-hidden rounded-lg border border-line bg-stone-200"
                          title={`Open photo ${i + 1} full size`}
                        >
                          <Image
                            src={img.originalPath}
                            alt={`Customer uploaded photo ${i + 1} of ${item.images.length}`}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-ink">{item.frameStyleName}</p>
                    <p className="text-sm text-graphite">
                      {item.frameSizeLabel} · {item.frameFinishName} · Qty {item.quantity}
                      {item.images.length > 1 && ` · ${item.images.length} photos`}
                    </p>
                  </div>
                  <p className="font-data text-sm text-ink">{formatPrice(item.lineTotal)}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6 rounded-xl border border-line p-5">
            <h2 className="font-medium text-ink">Timeline</h2>
            <ol className="mt-4 space-y-3">
              {order.timeline.map((event) => (
                <li key={event.id} className="flex gap-3 text-sm">
                  <span className="font-data text-xs text-graphite">
                    {event.createdAt.toLocaleString("en-IN")}
                  </span>
                  <span className="text-ink">{event.status.replace("_", " ")}</span>
                  {event.note && <span className="text-graphite">— {event.note}</span>}
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-xl border border-line p-5">
            <h2 className="font-medium text-ink">Update status</h2>
            <OrderStatusForm orderId={order.id} currentStatus={order.status} />
            {order.paymentStatus === "CAPTURED" && order.status !== "CANCELLED" && (
              <div className="mt-4 border-t border-line pt-4">
                <RefundButton orderId={order.id} />
              </div>
            )}
          </section>

          <section className="rounded-xl border border-line p-5 text-sm">
            <h2 className="font-medium text-ink">Shipping to</h2>
            <p className="mt-2 text-ink-soft">{order.customerName}</p>
            <p className="text-ink-soft">{order.customerPhone}</p>
            <p className="text-ink-soft">{order.customerEmail}</p>
            <p className="mt-2 text-ink-soft">
              {order.addressLine1}
              {order.addressLine2 ? `, ${order.addressLine2}` : ""}
              <br />
              {order.city}, {order.state} {order.pincode}
            </p>
          </section>

          <section className="rounded-xl border border-line p-5 text-sm">
            <h2 className="font-medium text-ink">Shipping</h2>
            {order.trackingId ? (
              <dl className="mt-2 space-y-1 text-ink-soft">
                <div className="flex justify-between"><dt>Courier</dt><dd>{order.courierName ?? "—"}</dd></div>
                <div className="flex justify-between"><dt>AWB</dt><dd className="font-data">{order.trackingId}</dd></div>
                {order.trackingUrl && (
                  <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="mt-1 block text-indigo hover:underline">
                    Track shipment →
                  </a>
                )}
              </dl>
            ) : (
              <p className="mt-2 text-graphite">
                Not booked yet — marking this order &ldquo;Shipped&rdquo; will attempt to
                auto-book with Shiprocket if configured, or book manually from the Shiprocket
                dashboard.
              </p>
            )}
          </section>

          <section className="rounded-xl border border-line p-5 text-sm">
            <h2 className="font-medium text-ink">Payment</h2>
            <dl className="mt-2 space-y-1 text-ink-soft">
              <div className="flex justify-between"><dt>Subtotal</dt><dd className="font-data">{formatPrice(order.subtotal)}</dd></div>
              <div className="flex justify-between"><dt>Discount</dt><dd className="font-data">-{formatPrice(order.discount)}</dd></div>
              <div className="flex justify-between"><dt>Shipping</dt><dd className="font-data">{formatPrice(order.shippingFee)}</dd></div>
              <div className="flex justify-between font-medium text-ink"><dt>Total</dt><dd className="font-data">{formatPrice(order.total)}</dd></div>
            </dl>
            <p className="mt-3 font-data text-xs text-graphite">
              Razorpay Payment: {order.razorpayPaymentId ?? "—"}
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
