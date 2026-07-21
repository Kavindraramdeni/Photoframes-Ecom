import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateCart } from "@/lib/cart-session";
import { cartItemSchema } from "@/lib/validations";

export async function GET() {
  const cart = await getOrCreateCart();

  const items = await prisma.cartItem.findMany({
    where: { cartId: cart.id },
    include: { frameStyle: true, frameSize: true, frameFinish: true },
    orderBy: { createdAt: "asc" },
  });

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return NextResponse.json({ cartId: cart.id, items, subtotal, itemCount: items.length });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = cartItemSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const cart = await getOrCreateCart();

  // Price the item server-side from the live catalog — never trust a
  // client-supplied price.
  const [style, size, finish] = await Promise.all([
    prisma.frameStyle.findUnique({ where: { id: data.frameStyleId } }),
    prisma.frameSize.findUnique({ where: { id: data.frameSizeId } }),
    prisma.frameFinish.findUnique({ where: { id: data.frameFinishId } }),
  ]);

  if (!style || !style.isActive) {
    return NextResponse.json({ error: "Frame style is unavailable" }, { status: 404 });
  }
  if (data.images.length !== style.photoSlots) {
    return NextResponse.json(
      {
        error: `This frame needs exactly ${style.photoSlots} photo${style.photoSlots === 1 ? "" : "s"} (got ${data.images.length}).`,
      },
      { status: 400 }
    );
  }
  if (!size || !size.isActive || size.frameStyleId !== style.id) {
    return NextResponse.json({ error: "Frame size is unavailable" }, { status: 404 });
  }
  if (size.trackInventory && size.stockQuantity < data.quantity) {
    return NextResponse.json(
      {
        error:
          size.stockQuantity <= 0
            ? "That size is out of stock"
            : `Only ${size.stockQuantity} left in stock for that size`,
      },
      { status: 409 }
    );
  }
  if (!finish || !finish.isActive || finish.frameStyleId !== style.id) {
    return NextResponse.json({ error: "Frame finish is unavailable" }, { status: 404 });
  }

  const unitPrice = style.basePrice + size.priceDelta + finish.priceDelta;

  const item = await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      frameStyleId: style.id,
      frameSizeId: size.id,
      frameFinishId: finish.id,
      quantity: data.quantity,
      unitPrice,
      images: data.images,
    },
    include: { frameStyle: true, frameSize: true, frameFinish: true },
  });

  return NextResponse.json({ item }, { status: 201 });
}
