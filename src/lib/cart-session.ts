import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

const CART_COOKIE = "ferro_cart_session";

/**
 * Returns the current user's Cart row, creating one if needed.
 * Logged-in users get a cart tied to their profile; guests get one
 * tied to an anonymous session id stored in an httpOnly cookie.
 */
export async function getOrCreateCart() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    let cart = await prisma.cart.findFirst({ where: { profileId: user.id } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { profileId: user.id } });
    }
    return cart;
  }

  const cookieStore = await cookies();
  let sessionId = cookieStore.get(CART_COOKIE)?.value;

  if (!sessionId) {
    sessionId = randomUUID();
    cookieStore.set(CART_COOKIE, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 60, // 60 days
      path: "/",
    });
  }

  let cart = await prisma.cart.findFirst({ where: { sessionId } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { sessionId } });
  }
  return cart;
}
