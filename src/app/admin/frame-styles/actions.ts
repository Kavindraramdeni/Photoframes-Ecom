"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { frameStyleSchema } from "@/lib/validations";
import { z } from "zod";

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const profile = await prisma.profile.findUnique({ where: { id: user.id } });
  if (!profile || profile.role !== "ADMIN") throw new Error("Not authorized");
}

export async function createFrameStyle(formData: FormData) {
  await assertAdmin();

  const parsed = frameStyleSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    shape: formData.get("shape"),
    material: formData.get("material"),
    basePrice: formData.get("basePrice"),
    imageUrl: formData.get("imageUrl"),
    isActive: formData.get("isActive") === "on",
    sortOrder: formData.get("sortOrder") || 0,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }

  const style = await prisma.frameStyle.create({
    data: {
      ...parsed.data,
      description: parsed.data.description || null,
      material: parsed.data.material || null,
      imageUrl: parsed.data.imageUrl || null,
    },
  });

  revalidatePath("/admin/frame-styles");
  revalidatePath("/products");
  return style.id;
}

export async function toggleFrameStyleActive(id: string, isActive: boolean) {
  await assertAdmin();
  await prisma.frameStyle.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/frame-styles");
  revalidatePath("/products");
}

const stockSchema = z.object({
  stockQuantity: z.coerce.number().int().min(0),
  trackInventory: z.boolean(),
});

export async function updateSizeStock(sizeId: string, formData: FormData) {
  await assertAdmin();

  const parsed = stockSchema.safeParse({
    stockQuantity: formData.get("stockQuantity"),
    trackInventory: formData.get("trackInventory") === "on",
  });
  if (!parsed.success) throw new Error(parsed.error.issues.map((i) => i.message).join(", "));

  const size = await prisma.frameSize.update({ where: { id: sizeId }, data: parsed.data });
  revalidatePath(`/admin/frame-styles/${size.frameStyleId}`);
  revalidatePath("/products");
}
const sizeSchema = z.object({
  label: z.string().min(1),
  widthMm: z.coerce.number().int().min(1),
  heightMm: z.coerce.number().int().min(1),
  thicknessMm: z.coerce.number().int().min(1),
  priceDelta: z.coerce.number().int().default(0),
});

export async function addFrameSize(frameStyleId: string, formData: FormData) {
  await assertAdmin();
  const parsed = sizeSchema.safeParse({
    label: formData.get("label"),
    widthMm: formData.get("widthMm"),
    heightMm: formData.get("heightMm"),
    thicknessMm: formData.get("thicknessMm"),
    priceDelta: formData.get("priceDelta"),
  });
  if (!parsed.success) throw new Error(parsed.error.issues.map((i) => i.message).join(", "));

  await prisma.frameSize.create({ data: { frameStyleId, ...parsed.data } });
  revalidatePath(`/admin/frame-styles/${frameStyleId}`);
}

const finishSchema = z.object({
  name: z.string().min(1),
  hexSwatch: z.string().optional(),
  priceDelta: z.coerce.number().int().default(0),
});

export async function addFrameFinish(frameStyleId: string, formData: FormData) {
  await assertAdmin();
  const parsed = finishSchema.safeParse({
    name: formData.get("name"),
    hexSwatch: formData.get("hexSwatch"),
    priceDelta: formData.get("priceDelta"),
  });
  if (!parsed.success) throw new Error(parsed.error.issues.map((i) => i.message).join(", "));

  await prisma.frameFinish.create({
    data: { frameStyleId, ...parsed.data, hexSwatch: parsed.data.hexSwatch || null },
  });
  revalidatePath(`/admin/frame-styles/${frameStyleId}`);
}
