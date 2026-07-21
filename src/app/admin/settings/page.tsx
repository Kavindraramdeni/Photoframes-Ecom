import { prisma } from "@/lib/prisma";
import { getStoreSettings } from "@/lib/store-settings";
import { updateStoreSettings, promoteToAdmin, demoteAdmin } from "@/app/admin/settings/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function AdminSettingsPage() {
  const [settings, admins] = await Promise.all([
    getStoreSettings(),
    prisma.profile.findMany({ where: { role: "ADMIN" }, orderBy: { createdAt: "asc" } }),
  ]);

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl text-ink">Settings</h1>
      <p className="mt-1 text-sm text-graphite">
        These values are read live by the storefront and checkout — changes take effect
        immediately, no redeploy needed.
      </p>

      <section className="mt-8 rounded-xl border border-line p-5">
        <h2 className="font-medium text-ink">Store</h2>
        <form action={updateStoreSettings} className="mt-4 space-y-4">
          <div>
            <Label htmlFor="storeName">Store name</Label>
            <Input id="storeName" name="storeName" defaultValue={settings.storeName} required />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="supportEmail">Support email</Label>
              <Input
                id="supportEmail"
                name="supportEmail"
                type="email"
                defaultValue={settings.supportEmail}
                required
              />
            </div>
            <div>
              <Label htmlFor="supportPhone">Support phone</Label>
              <Input id="supportPhone" name="supportPhone" defaultValue={settings.supportPhone ?? ""} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="shippingFee">Shipping fee (paise)</Label>
              <Input
                id="shippingFee"
                name="shippingFee"
                type="number"
                min={0}
                defaultValue={settings.shippingFee}
                required
              />
              <p className="mt-1 text-xs text-graphite">Set to 0 for free shipping on every order.</p>
            </div>
            <div>
              <Label htmlFor="freeShippingThreshold">Free shipping above (paise)</Label>
              <Input
                id="freeShippingThreshold"
                name="freeShippingThreshold"
                type="number"
                min={0}
                defaultValue={settings.freeShippingThreshold ?? ""}
                placeholder="Leave blank to disable"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="lowStockThreshold">Low-stock alert threshold</Label>
            <Input
              id="lowStockThreshold"
              name="lowStockThreshold"
              type="number"
              min={0}
              defaultValue={settings.lowStockThreshold}
              required
            />
            <p className="mt-1 text-xs text-graphite">
              You&apos;ll get an email when a tracked size&apos;s stock drops to or below this number.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="instagramUrl">Instagram URL</Label>
              <Input id="instagramUrl" name="instagramUrl" defaultValue={settings.instagramUrl ?? ""} />
            </div>
            <div>
              <Label htmlFor="facebookUrl">Facebook URL</Label>
              <Input id="facebookUrl" name="facebookUrl" defaultValue={settings.facebookUrl ?? ""} />
            </div>
          </div>

          <Button type="submit">Save settings</Button>
        </form>
      </section>

      <section className="mt-8 rounded-xl border border-line p-5">
        <h2 className="font-medium text-ink">Admin users</h2>
        <p className="mt-1 text-xs text-graphite">
          People must sign up once through the storefront before you can promote them.
        </p>

        <ul className="mt-4 divide-y divide-line">
          {admins.map((a) => (
            <li key={a.id} className="flex items-center justify-between py-2 text-sm">
              <span>{a.email}</span>
              <form
                action={async () => {
                  "use server";
                  await demoteAdmin(a.id);
                }}
              >
                <button type="submit" className="text-xs font-medium text-error hover:underline">
                  Remove admin access
                </button>
              </form>
            </li>
          ))}
        </ul>

        <form action={promoteToAdmin} className="mt-4 flex gap-2 border-t border-line pt-4">
          <Input name="email" type="email" placeholder="teammate@example.com" required />
          <Button type="submit" variant="outline">Make admin</Button>
        </form>
      </section>
    </div>
  );
}
