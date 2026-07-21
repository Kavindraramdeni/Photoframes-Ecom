import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { createFrameStyle, toggleFrameStyleActive } from "@/app/admin/frame-styles/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function AdminFrameStylesPage() {
  const styles = await prisma.frameStyle.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { sizes: true, finishes: true } } },
  });

  async function handleCreate(formData: FormData) {
    "use server";
    await createFrameStyle(formData);
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Frame Styles</h1>

      <div className="mt-6 overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-paper-warm text-left text-graphite">
            <tr>
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Shape</th>
              <th className="p-3 font-medium">Base price</th>
              <th className="p-3 font-medium">Sizes / Finishes</th>
              <th className="p-3 font-medium">Active</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {styles.map((s) => (
              <tr key={s.id} className="border-t border-line">
                <td className="p-3 font-medium text-ink">{s.name}</td>
                <td className="p-3 capitalize">{s.shape}</td>
                <td className="p-3 font-data">{formatPrice(s.basePrice)}</td>
                <td className="p-3">{s._count.sizes} / {s._count.finishes}</td>
                <td className="p-3">
                  <form
                    action={async () => {
                      "use server";
                      await toggleFrameStyleActive(s.id, !s.isActive);
                    }}
                  >
                    <button
                      type="submit"
                      className={`rounded-full px-2.5 py-0.5 text-xs ${s.isActive ? "bg-success/10 text-success" : "bg-stone-200 text-graphite"}`}
                    >
                      {s.isActive ? "Active" : "Inactive"}
                    </button>
                  </form>
                </td>
                <td className="p-3">
                  <Link href={`/admin/frame-styles/${s.id}`} className="text-indigo hover:underline">
                    Manage sizes/finishes
                  </Link>
                </td>
              </tr>
            ))}
            {styles.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-graphite">
                  No frame styles yet — add one below.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <section className="mt-8 max-w-xl rounded-xl border border-line p-5">
        <h2 className="font-medium text-ink">Add a frame style</h2>
        <form action={handleCreate} className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required placeholder="Classic Oak Rectangle" />
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" required placeholder="classic-oak-rectangle" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="shape">Shape</Label>
              <Input id="shape" name="shape" required placeholder="Rectangle" />
            </div>
            <div>
              <Label htmlFor="material">Material</Label>
              <Input id="material" name="material" placeholder="Premium Magnetic Wood" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="basePrice">Base price (in paise)</Label>
              <Input id="basePrice" name="basePrice" type="number" required placeholder="129900" />
            </div>
            <div>
              <Label htmlFor="sortOrder">Sort order</Label>
              <Input id="sortOrder" name="sortOrder" type="number" defaultValue={0} />
            </div>
          </div>
          <div>
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input id="imageUrl" name="imageUrl" placeholder="https://…" />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isActive" defaultChecked className="h-4 w-4 rounded border-line" />
            Active (visible on the storefront)
          </label>
          <Button type="submit">Create frame style</Button>
        </form>
      </section>
    </div>
  );
}
