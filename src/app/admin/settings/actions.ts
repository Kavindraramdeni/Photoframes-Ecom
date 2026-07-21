"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const profile = await prisma.profile.findUnique({ where: { id: user.id } });
  if (!profile || profile.role !== "ADMIN") throw new Error("Not authorized");
}

const settingsSchema = z.object({
  storeName: z.string().trim().min(1, "Store name is required"),
  supportEmail: z.string().trim().email("Enter a valid email"),
  supportPhone: z.string().trim().optional().or(z.literal("")),
  shippingFee: z.coerce.number().int().min(0),
  freeShippingThreshold: z.coerce.number().int().min(0).optional(),
  lowStockThreshold: z.coerce.number().int().min(0),
  instagramUrl: z.string().trim().url("Enter a full URL").optional().or(z.literal("")),
  facebookUrl: z.string().trim().url("Enter a full URL").optional().or(z.literal("")),
});

export async function updateStoreSettings(formData: FormData) {
  await assertAdmin();

  const parsed = settingsSchema.safeParse({
    storeName: formData.get("storeName"),
    supportEmail: formData.get("supportEmail"),
    supportPhone: formData.get("supportPhone"),
    shippingFee: formData.get("shippingFee"),
    freeShippingThreshold: formData.get("freeShippingThreshold") || undefined,
    lowStockThreshold: formData.get("lowStockThreshold"),
    instagramUrl: formData.get("instagramUrl"),
    facebookUrl: formData.get("facebookUrl"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }

  await prisma.storeSettings.upsert({
    where: { id: "singleton" },
    update: {
      ...parsed.data,
      supportPhone: parsed.data.supportPhone || null,
      instagramUrl: parsed.data.instagramUrl || null,
      facebookUrl: parsed.data.facebookUrl || null,
      freeShippingThreshold: parsed.data.freeShippingThreshold ?? null,
    },
    create: {
      id: "singleton",
      ...parsed.data,
      supportPhone: parsed.data.supportPhone || null,
      instagramUrl: parsed.data.instagramUrl || null,
      facebookUrl: parsed.data.facebookUrl || null,
      freeShippingThreshold: parsed.data.freeShippingThreshold ?? null,
    },
  });

  revalidatePath("/admin/settings");
}

const adminInviteSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
});

/**
 * Promotes an existing registered user (they must have signed up once
 * already, since Supabase Auth owns account creation) to the ADMIN role.
 */
export async function promoteToAdmin(formData: FormData) {
  await assertAdmin();

  const parsed = adminInviteSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }

  const profile = await prisma.profile.findUnique({ where: { email: parsed.data.email } });
  if (!profile) {
    throw new Error("No account found with that email yet — they need to sign up once first.");
  }

  await prisma.profile.update({ where: { id: profile.id }, data: { role: "ADMIN" } });
  revalidatePath("/admin/settings");
}

export async function demoteAdmin(profileId: string) {
  await assertAdmin();
  await prisma.profile.update({ where: { id: profileId }, data: { role: "CUSTOMER" } });
  revalidatePath("/admin/settings");
}
