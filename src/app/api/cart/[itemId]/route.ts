import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateCart } from "@/lib/cart-session";

const updateSchema = z.object({
  quantity: z.coerce.number().int().min(1).max(20),
});

async function assertOwnership(itemId: string) {
  const cart = await getOrCreateCart();
  const item = await prisma.cartItem.findUnique({ where: { id: itemId } });
  if (!item || item.cartId !== cart.id) return null;
  return item;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const { itemId } = await params;
  const owned = await assertOwnership(itemId);
  if (!owned) {
    return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
  }

  const size = await prisma.frameSize.findUnique({ where: { id: owned.frameSizeId } });
  if (size?.trackInventory && size.stockQuantity < parsed.data.quantity) {
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

  const item = await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity: parsed.data.quantity },
    include: { frameStyle: true, frameSize: true, frameFinish: true },
  });

  return NextResponse.json({ item });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const { itemId } = await params;
  const owned = await assertOwnership(itemId);
  if (!owned) {
    return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
  }

  await prisma.cartItem.delete({ where: { id: itemId } });
  return NextResponse.json({ success: true });
}
