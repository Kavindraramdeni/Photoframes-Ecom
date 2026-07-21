"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateOrderStatus } from "@/app/admin/orders/actions";
import { Button } from "@/components/ui/button";
import type { OrderStatus } from "@prisma/client";

const STATUSES: OrderStatus[] = [
  "PAID",
  "PROCESSING",
  "MANUFACTURING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

export function OrderStatusForm({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: OrderStatus;
}) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await updateOrderStatus(orderId, status, note || undefined);
        toast.success("Order status updated");
        setNote("");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Couldn't update status");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as OrderStatus)}
        className="w-full rounded-lg border border-line px-3 py-2 text-sm"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s.replace("_", " ")}
          </option>
        ))}
      </select>
      <input
        type="text"
        placeholder="Note (optional, e.g. tracking number)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="w-full rounded-lg border border-line px-3 py-2 text-sm"
      />
      <Button type="submit" size="sm" className="w-full" disabled={isPending}>
        {isPending ? "Saving…" : "Update status"}
      </Button>
    </form>
  );
}
