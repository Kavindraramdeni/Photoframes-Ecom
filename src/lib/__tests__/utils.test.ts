import { describe, it, expect } from "vitest";
import { formatPrice, generateOrderNumber } from "@/lib/utils";
import { checkoutSchema, cartItemSchema } from "@/lib/validations";

describe("formatPrice", () => {
  it("formats paise as INR currency", () => {
    expect(formatPrice(129900)).toBe("₹1,299");
  });

  it("handles zero", () => {
    expect(formatPrice(0)).toBe("₹0");
  });
});

describe("generateOrderNumber", () => {
  it("pads the sequence to 6 digits", () => {
    const year = new Date().getFullYear();
    expect(generateOrderNumber(42)).toBe(`PF-${year}-000042`);
  });
});

describe("checkoutSchema", () => {
  const valid = {
    fullName: "Aarav Sharma",
    email: "aarav@example.com",
    phone: "9876543210",
    addressLine1: "221B Baker Street",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
  };

  it("accepts a fully valid payload", () => {
    expect(checkoutSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an invalid Indian phone number", () => {
    const result = checkoutSchema.safeParse({ ...valid, phone: "12345" });
    expect(result.success).toBe(false);
  });

  it("rejects a malformed PIN code", () => {
    const result = checkoutSchema.safeParse({ ...valid, pincode: "12AB" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = checkoutSchema.safeParse({ ...valid, email: "not-an-email" });
    expect(result.success).toBe(false);
  });
});

describe("cartItemSchema", () => {
  const validPhoto = {
    imageUrl: "https://example.com/photo.jpg",
    cropX: 0,
    cropY: 0,
    zoom: 1,
    rotation: 0,
  };

  it("accepts a valid single-photo payload", () => {
    const result = cartItemSchema.safeParse({
      frameStyleId: "123e4567-e89b-12d3-a456-426614174000",
      frameSizeId: "123e4567-e89b-12d3-a456-426614174001",
      frameFinishId: "123e4567-e89b-12d3-a456-426614174002",
      quantity: 1,
      images: [validPhoto],
    });
    expect(result.success).toBe(true);
  });

  it("accepts multiple photos for strip products", () => {
    const result = cartItemSchema.safeParse({
      frameStyleId: "123e4567-e89b-12d3-a456-426614174000",
      frameSizeId: "123e4567-e89b-12d3-a456-426614174001",
      frameFinishId: "123e4567-e89b-12d3-a456-426614174002",
      quantity: 1,
      images: [validPhoto, validPhoto, validPhoto],
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.images).toHaveLength(3);
  });

  it("rejects a quantity above the max", () => {
    const result = cartItemSchema.safeParse({
      frameStyleId: "123e4567-e89b-12d3-a456-426614174000",
      frameSizeId: "123e4567-e89b-12d3-a456-426614174001",
      frameFinishId: "123e4567-e89b-12d3-a456-426614174002",
      quantity: 999,
      images: [validPhoto],
    });
    expect(result.success).toBe(false);
  });

  it("requires at least one photo", () => {
    const result = cartItemSchema.safeParse({
      frameStyleId: "123e4567-e89b-12d3-a456-426614174000",
      frameSizeId: "123e4567-e89b-12d3-a456-426614174001",
      frameFinishId: "123e4567-e89b-12d3-a456-426614174002",
      quantity: 1,
      images: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a photo missing its imageUrl", () => {
    const result = cartItemSchema.safeParse({
      frameStyleId: "123e4567-e89b-12d3-a456-426614174000",
      frameSizeId: "123e4567-e89b-12d3-a456-426614174001",
      frameFinishId: "123e4567-e89b-12d3-a456-426614174002",
      quantity: 1,
      images: [{ ...validPhoto, imageUrl: "" }],
    });
    expect(result.success).toBe(false);
  });
});

