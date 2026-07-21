import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const [totalOrders, pendingOrders, revenueAgg, recentOrders] = await Promise.all([
    prisma.order.count({ where: { paymentStatus: "CAPTURED" } }),
    prisma.order.count({ where: { status: { in: ["PAID", "PROCESSING", "MANUFACTURING"] } } }),
    prisma.order.aggregate({ where: { paymentStatus: "CAPTURED" }, _sum: { total: true } }),
    prisma.order.findMany({
      where: { paymentStatus: "CAPTURED" },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const stats = [
    { label: "Total Orders", value: totalOrders.toString() },
    { label: "In Production", value: pendingOrders.toString() },
    { label: "Revenue", value: formatPrice(revenueAgg._sum.total ?? 0) },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <p className="text-xs uppercase tracking-wide text-graphite">{s.label}</p>
              <p className="mt-2 font-data text-2xl text-ink">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent orders</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-graphite">No orders yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-graphite">
                  <th className="pb-2 font-medium">Order</th>
                  <th className="pb-2 font-medium">Customer</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-b border-line last:border-0">
                    <td className="py-2 font-data">{o.orderNumber}</td>
                    <td className="py-2">{o.customerName}</td>
                    <td className="py-2">{o.status}</td>
                    <td className="py-2 text-right font-data">{formatPrice(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
