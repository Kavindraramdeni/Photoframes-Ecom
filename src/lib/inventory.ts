import { prisma } from "@/lib/prisma";
import { getStoreSettings } from "@/lib/store-settings";
import { sendLowStockAlertEmail } from "@/lib/email";
import { sendCriticalAlert } from "@/lib/alert";

/**
 * Decrements stock for every tracked size in a paid order, atomically
 * (each decrement is conditioned on stockQuantity >= quantity so it can
 * never go negative even under concurrent requests). If a decrement
 * can't be satisfied — extremely rare given the checks earlier in the
 * flow, but possible under a tight race — we log it as an order event
 * for manual admin review rather than silently overselling further or
 * failing the whole (already-paid) order.
 */
/**
 * Restores stock for a cancelled/refunded order's tracked sizes.
 * Used when an admin cancels an order after payment — the reverse of
 * decrementStockForOrder.
 */
export async function restoreStockForOrder(orderId: string) {
  const items = await prisma.orderItem.findMany({
    where: { orderId },
    include: { frameSize: true },
  });

  for (const item of items) {
    if (!item.frameSize.trackInventory) continue;
    await prisma.frameSize.update({
      where: { id: item.frameSizeId },
      data: { stockQuantity: { increment: item.quantity } },
    });
  }
}

export async function decrementStockForOrder(orderId: string) {
  const items = await prisma.orderItem.findMany({
    where: { orderId },
    include: { frameSize: true },
  });

  const settings = await getStoreSettings();

  for (const item of items) {
    if (!item.frameSize.trackInventory) continue;

    const stockBefore = item.frameSize.stockQuantity;

    const result = await prisma.frameSize.updateMany({
      where: { id: item.frameSizeId, stockQuantity: { gte: item.quantity } },
      data: { stockQuantity: { decrement: item.quantity } },
    });

    if (result.count === 0) {
      await prisma.orderEvent.create({
        data: {
          orderId,
          status: "PROCESSING",
          note: `Stock mismatch: could not deduct ${item.quantity} × ${item.frameStyleName} (${item.frameSizeLabel}) — verify stock manually.`,
        },
      });
      await sendCriticalAlert("Stock oversold after payment", {
        orderId,
        item: `${item.frameStyleName} (${item.frameSizeLabel})`,
        quantityOrdered: item.quantity,
      });
      continue;
    }

    // Alert only on the crossing itself (was above threshold, now at/below
    // it) so a slow-moving low-stock item doesn't re-alert on every sale.
    const stockAfter = stockBefore - item.quantity;
    if (stockBefore > settings.lowStockThreshold && stockAfter <= settings.lowStockThreshold) {
      await sendLowStockAlertEmail({
        frameStyleName: item.frameStyleName,
        frameSizeLabel: item.frameSizeLabel,
        remaining: stockAfter,
      });
    }
  }
}
