import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateCart } from "@/lib/cart-session";
import { checkoutSchema } from "@/lib/validations";
import { razorpay } from "@/lib/razorpay";
import { generateOrderNumber } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { getStoreSettings } from "@/lib/store-settings";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const clientIp = getClientIp(request);
  const limit = rateLimit(`checkout:${clientIp}`, 10, 10 * 60 * 1000);
  if (!limit.success) {
    return NextResponse.json(
      { error: "Too many checkout attempts. Please wait a few minutes and try again." },
      { status: 429 }
    );
  }

  const body = await request.json();
  const parsed = checkoutSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the highlighted fields", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const cart = await getOrCreateCart();
  const cartItems = await prisma.cartItem.findMany({
    where: { cartId: cart.id },
    include: { frameStyle: true, frameSize: true, frameFinish: true },
  });

  if (cartItems.length === 0) {
    return NextResponse.json({ error: "Your cart is empty" }, { status: 400 });
  }

  // Final stock check — items may have sold out since being added to the
  // cart, so this is the last gate before money changes hands.
  for (const item of cartItems) {
    if (item.frameSize.trackInventory && item.frameSize.stockQuantity < item.quantity) {
      return NextResponse.json(
        {
          error:
            item.frameSize.stockQuantity <= 0
              ? `${item.frameStyle.name} (${item.frameSize.label}) just sold out — please remove it from your cart.`
              : `Only ${item.frameSize.stockQuantity} left of ${item.frameStyle.name} (${item.frameSize.label}) — please update the quantity in your cart.`,
        },
        { status: 409 }
      );
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const settings = await getStoreSettings();
  const shippingFee =
    settings.freeShippingThreshold && subtotal >= settings.freeShippingThreshold
      ? 0
      : settings.shippingFee;

  // Server-side coupon validation — never trust a client-computed discount.
  let discount = 0;
  let couponId: string | null = null;
  const { couponCode } = parsed.data;

  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
    const now = new Date();
    const valid =
      coupon &&
      coupon.isActive &&
      subtotal >= coupon.minOrderValue &&
      (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) &&
      (!coupon.startsAt || coupon.startsAt <= now) &&
      (!coupon.expiresAt || coupon.expiresAt >= now);

    if (!valid) {
      return NextResponse.json({ error: "This coupon isn't valid for your order" }, { status: 400 });
    }

    discount =
      coupon.type === "PERCENTAGE"
        ? Math.min(Math.round((subtotal * coupon.value) / 100), coupon.maxDiscount ?? Infinity)
        : Math.min(coupon.value, subtotal);
    couponId = coupon.id;
  }

  const total = Math.max(subtotal - discount + shippingFee, 0);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const orderCountThisYear = await prisma.order.count({
    where: { createdAt: { gte: new Date(new Date().getFullYear(), 0, 1) } },
  });
  const orderNumber = generateOrderNumber(orderCountThisYear + 1);

  const razorpayOrder = await razorpay.orders.create({
    amount: total,
    currency: "INR",
    receipt: orderNumber,
    notes: { orderNumber },
  });

  const order = await prisma.order.create({
    data: {
      orderNumber,
      profileId: user?.id,
      customerName: parsed.data.fullName,
      customerEmail: parsed.data.email,
      customerPhone: parsed.data.phone,
      addressLine1: parsed.data.addressLine1,
      addressLine2: parsed.data.addressLine2 || null,
      city: parsed.data.city,
      state: parsed.data.state,
      pincode: parsed.data.pincode,
      subtotal,
      discount,
      shippingFee,
      total,
      couponId,
      razorpayOrderId: razorpayOrder.id,
      items: {
        create: cartItems.map((item) => {
          const photos = item.images as unknown as {
            imageUrl: string;
            thumbnailUrl?: string;
            cropX: number;
            cropY: number;
            zoom: number;
            rotation: number;
          }[];

          return {
            frameStyleId: item.frameStyleId,
            frameSizeId: item.frameSizeId,
            frameFinishId: item.frameFinishId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.unitPrice * item.quantity,
            frameStyleName: item.frameStyle.name,
            frameSizeLabel: item.frameSize.label,
            frameFinishName: item.frameFinish.name,
            images: {
              create: photos.map((photo) => ({
                originalPath: photo.imageUrl,
                thumbnailPath: photo.thumbnailUrl,
                cropX: photo.cropX,
                cropY: photo.cropY,
                zoom: photo.zoom,
                rotation: photo.rotation,
              })),
            },
          };
        }),
      },
      timeline: { create: { status: "PENDING_PAYMENT", note: "Order created, awaiting payment" } },
    },
  });

  return NextResponse.json({
    orderNumber: order.orderNumber,
    razorpayOrderId: razorpayOrder.id,
    amount: total,
    currency: "INR",
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    customerName: parsed.data.fullName,
    customerEmail: parsed.data.email,
    customerPhone: parsed.data.phone,
  });
}
