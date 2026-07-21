import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { createCoupon, toggleCouponActive, deleteCoupon } from "@/app/admin/coupons/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });

  async function handleCreate(formData: FormData) {
    "use server";
    await createCoupon(formData);
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Coupons</h1>

      <div className="mt-6 overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="bg-paper-warm text-left text-graphite">
            <tr>
              <th className="p-3 font-medium">Code</th>
              <th className="p-3 font-medium">Discount</th>
              <th className="p-3 font-medium">Min order</th>
              <th className="p-3 font-medium">Usage</th>
              <th className="p-3 font-medium">Expires</th>
              <th className="p-3 font-medium">Active</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-t border-line">
                <td className="p-3 font-data font-medium text-ink">{c.code}</td>
                <td className="p-3">
                  {c.type === "PERCENTAGE" ? `${c.value}%` : formatPrice(c.value)}
                  {c.maxDiscount ? ` (max ${formatPrice(c.maxDiscount)})` : ""}
                </td>
                <td className="p-3">{formatPrice(c.minOrderValue)}</td>
                <td className="p-3 font-data">
                  {c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ""}
                </td>
                <td className="p-3 text-graphite">
                  {c.expiresAt ? c.expiresAt.toLocaleDateString("en-IN") : "—"}
                </td>
                <td className="p-3">
                  <form
                    action={async () => {
                      "use server";
                      await toggleCouponActive(c.id, !c.isActive);
                    }}
                  >
                    <button
                      type="submit"
                      className={`rounded-full px-2.5 py-0.5 text-xs ${c.isActive ? "bg-success/10 text-success" : "bg-stone-200 text-graphite"}`}
                    >
                      {c.isActive ? "Active" : "Inactive"}
                    </button>
                  </form>
                </td>
                <td className="p-3">
                  <form
                    action={async () => {
                      "use server";
                      await deleteCoupon(c.id);
                    }}
                  >
                    <button type="submit" className="text-xs font-medium text-error hover:underline">
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-graphite">
                  No coupons yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <section className="mt-8 max-w-xl rounded-xl border border-line p-5">
        <h2 className="font-medium text-ink">Create a coupon</h2>
        <form action={handleCreate} className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="code">Code</Label>
              <Input id="code" name="code" required placeholder="WELCOME10" className="uppercase" />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <select id="type" name="type" className="h-11 w-full rounded-lg border border-stone-300 px-3 text-sm">
                <option value="PERCENTAGE">Percentage</option>
                <option value="FLAT">Flat (paise)</option>
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="value">Value</Label>
              <Input id="value" name="value" type="number" required placeholder="10" />
            </div>
            <div>
              <Label htmlFor="minOrderValue">Min order (paise)</Label>
              <Input id="minOrderValue" name="minOrderValue" type="number" defaultValue={0} />
            </div>
            <div>
              <Label htmlFor="maxDiscount">Max discount (paise)</Label>
              <Input id="maxDiscount" name="maxDiscount" type="number" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="usageLimit">Usage limit</Label>
              <Input id="usageLimit" name="usageLimit" type="number" placeholder="Unlimited if blank" />
            </div>
            <div>
              <Label htmlFor="expiresAt">Expires</Label>
              <Input id="expiresAt" name="expiresAt" type="date" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isActive" defaultChecked className="h-4 w-4 rounded border-line" />
            Active
          </label>
          <Button type="submit">Create coupon</Button>
        </form>
      </section>
    </div>
  );
}
