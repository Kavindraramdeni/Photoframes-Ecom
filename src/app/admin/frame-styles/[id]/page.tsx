import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { addFrameSize, addFrameFinish, updateSizeStock } from "@/app/admin/frame-styles/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function AdminFrameStyleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const style = await prisma.frameStyle.findUnique({
    where: { id },
    include: { sizes: true, finishes: true },
  });

  if (!style) notFound();

  async function handleAddSize(formData: FormData) {
    "use server";
    await addFrameSize(id, formData);
  }

  async function handleAddFinish(formData: FormData) {
    "use server";
    await addFrameFinish(id, formData);
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">{style.name}</h1>
      <p className="text-sm text-graphite">Base price: {formatPrice(style.basePrice)}</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section className="rounded-xl border border-line p-5">
          <h2 className="font-medium text-ink">Sizes & Stock</h2>
          <ul className="mt-3 space-y-4 text-sm">
            {style.sizes.map((s) => {
              async function handleUpdateStock(formData: FormData) {
                "use server";
                await updateSizeStock(s.id, formData);
              }
              return (
                <li key={s.id} className="border-b border-line pb-4 last:border-0">
                  <div className="flex justify-between">
                    <span>{s.label} ({s.widthMm}×{s.heightMm}mm)</span>
                    <span className="font-data">+{formatPrice(s.priceDelta)}</span>
                  </div>
                  <form action={handleUpdateStock} className="mt-2 flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs">
                      <input
                        type="checkbox"
                        name="trackInventory"
                        defaultChecked={s.trackInventory}
                        className="h-4 w-4 rounded border-line"
                      />
                      Track stock
                    </label>
                    <Input
                      name="stockQuantity"
                      type="number"
                      min={0}
                      defaultValue={s.stockQuantity}
                      className="h-8 w-24"
                    />
                    <Button type="submit" size="sm" variant="outline">Save</Button>
                    {s.trackInventory && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${s.stockQuantity > 0 ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}
                      >
                        {s.stockQuantity > 0 ? `${s.stockQuantity} in stock` : "Out of stock"}
                      </span>
                    )}
                  </form>
                </li>
              );
            })}
            {style.sizes.length === 0 && <p className="text-graphite">No sizes yet.</p>}
          </ul>

          <form action={handleAddSize} className="mt-4 space-y-3 border-t border-line pt-4">
            <Input name="label" placeholder="Label, e.g. 8x10 inch" required />
            <div className="grid grid-cols-3 gap-2">
              <Input name="widthMm" type="number" placeholder="Width mm" required />
              <Input name="heightMm" type="number" placeholder="Height mm" required />
              <Input name="thicknessMm" type="number" placeholder="Thickness mm" required />
            </div>
            <Input name="priceDelta" type="number" placeholder="Price delta (paise)" defaultValue={0} />
            <Button type="submit" size="sm">Add size</Button>
          </form>
        </section>

        <section className="rounded-xl border border-line p-5">
          <h2 className="font-medium text-ink">Finishes</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {style.finishes.map((f) => (
              <li key={f.id} className="flex items-center justify-between border-b border-line py-2 last:border-0">
                <span className="flex items-center gap-2">
                  <span
                    className="h-4 w-4 rounded-full border border-line"
                    style={{ backgroundColor: f.hexSwatch ?? "#e5e5e5" }}
                  />
                  {f.name}
                </span>
                <span className="font-data">+{formatPrice(f.priceDelta)}</span>
              </li>
            ))}
            {style.finishes.length === 0 && <p className="text-graphite">No finishes yet.</p>}
          </ul>

          <form action={handleAddFinish} className="mt-4 space-y-3 border-t border-line pt-4">
            <Input name="name" placeholder="Name, e.g. Matte Black" required />
            <div className="flex gap-2">
              <Label htmlFor="hexSwatch" className="sr-only">Swatch color</Label>
              <Input id="hexSwatch" name="hexSwatch" type="color" defaultValue="#1c1b19" className="w-16 p-1" />
              <Input name="priceDelta" type="number" placeholder="Price delta (paise)" defaultValue={0} />
            </div>
            <Button type="submit" size="sm">Add finish</Button>
          </form>
        </section>
      </div>
    </div>
  );
}
