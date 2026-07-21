"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

export interface CartPhoto {
  imageUrl: string;
  thumbnailUrl?: string;
  cropX: number;
  cropY: number;
  zoom: number;
  rotation: number;
}

export interface CartItemDTO {
  id: string;
  quantity: number;
  unitPrice: number;
  images: CartPhoto[];
  frameStyle: { id: string; name: string; shape: string; imageUrl: string | null };
  frameSize: { id: string; label: string };
  frameFinish: { id: string; name: string; hexSwatch: string | null };
}

interface CartContextValue {
  items: CartItemDTO[];
  itemCount: number;
  subtotal: number;
  isLoading: boolean;
  refresh: () => Promise<void>;
  addItem: (input: {
    frameStyleId: string;
    frameSizeId: string;
    frameFinishId: string;
    quantity: number;
    images: CartPhoto[];
  }) => Promise<boolean>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItemDTO[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/cart", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load cart");
      const data = await res.json();
      setItems(data.items);
      setSubtotal(data.subtotal);
    } catch {
      toast.error("Couldn't load your cart. Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem: CartContextValue["addItem"] = useCallback(
    async (input) => {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast.error(body.error ?? "Couldn't add that frame to your cart.");
        return false;
      }
      await refresh();
      toast.success("Added to cart");
      return true;
    },
    [refresh]
  );

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      const previous = items;
      setItems((cur) => cur.map((i) => (i.id === itemId ? { ...i, quantity } : i)));
      const res = await fetch(`/api/cart/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      if (!res.ok) {
        setItems(previous);
        toast.error("Couldn't update quantity.");
        return;
      }
      await refresh();
    },
    [items, refresh]
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      const previous = items;
      setItems((cur) => cur.filter((i) => i.id !== itemId));
      const res = await fetch(`/api/cart/${itemId}`, { method: "DELETE" });
      if (!res.ok) {
        setItems(previous);
        toast.error("Couldn't remove that item.");
        return;
      }
      toast("Removed from cart");
      await refresh();
    },
    [items, refresh]
  );

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, itemCount, subtotal, isLoading, refresh, addItem, updateQuantity, removeItem }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
