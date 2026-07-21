"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { cancelAndRefundOrder } from "@/app/admin/orders/actions";
import { Button } from "@/components/ui/button";

export function RefundButton({ orderId }: { orderId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <Button variant="destructive" size="sm" onClick={() => setConfirming(true)}>
        Cancel & Refund
      </Button>
    );
  }

  function handleConfirm() {
    startTransition(async () => {
      try {
        await cancelAndRefundOrder(orderId, reason || undefined);
        toast.success("Order cancelled and refunded");
        setConfirming(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Refund failed");
      }
    });
  }

  return (
    <div className="rounded-lg border border-error/30 bg-error/5 p-3">
      <p className="text-xs font-medium text-error">
        This issues a full refund via Razorpay and cannot be undone. Are you sure?
      </p>
      <input
        type="text"
        placeholder="Reason (optional)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="mt-2 w-full rounded-lg border border-line px-3 py-1.5 text-sm"
      />
      <div className="mt-2 flex gap-2">
        <Button variant="destructive" size="sm" onClick={handleConfirm} disabled={isPending}>
          {isPending ? "Processing…" : "Yes, refund"}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setConfirming(false)} disabled={isPending}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
