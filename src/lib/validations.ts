import { z } from "zod";

export const checkoutSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Enter your full name")
    .max(100, "Name is too long"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  addressLine1: z.string().trim().min(5, "Enter your address"),
  addressLine2: z.string().trim().optional().or(z.literal("")),
  city: z.string().trim().min(2, "Enter your city"),
  state: z.string().trim().min(2, "Enter your state"),
  pincode: z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit PIN code"),
  couponCode: z.string().trim().optional().or(z.literal("")),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const photoSchema = z.object({
  imageUrl: z.string().min(1, "Please upload a photo"),
  thumbnailUrl: z.string().optional(),
  cropX: z.coerce.number().default(0),
  cropY: z.coerce.number().default(0),
  zoom: z.coerce.number().min(1).max(4).default(1),
  rotation: z.coerce.number().default(0),
});

export const cartItemSchema = z.object({
  frameStyleId: z.string().uuid(),
  frameSizeId: z.string().uuid(),
  frameFinishId: z.string().uuid(),
  quantity: z.coerce.number().int().min(1).max(20),
  images: z.array(photoSchema).min(1, "Please upload at least one photo"),
});

export type CartItemInput = z.infer<typeof cartItemSchema>;

export const frameStyleSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z
    .string()
    .trim()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens"),
  description: z.string().trim().optional().or(z.literal("")),
  shape: z.string().trim().min(2),
  material: z.string().trim().optional().or(z.literal("")),
  basePrice: z.coerce.number().int().min(0),
  imageUrl: z.string().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

export const couponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3)
    .max(30)
    .regex(/^[A-Z0-9]+$/, "Use uppercase letters and numbers only"),
  type: z.enum(["PERCENTAGE", "FLAT"]),
  value: z.coerce.number().int().min(1),
  minOrderValue: z.coerce.number().int().min(0).default(0),
  maxDiscount: z.coerce.number().int().min(0).optional(),
  usageLimit: z.coerce.number().int().min(1).optional(),
  isActive: z.boolean().default(true),
  startsAt: z.string().optional(),
  expiresAt: z.string().optional(),
});
