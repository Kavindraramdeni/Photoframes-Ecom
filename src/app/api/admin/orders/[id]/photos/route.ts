import { NextResponse } from "next/server";
import JSZip from "jszip";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const profile = await prisma.profile.findUnique({ where: { id: user.id } });
  if (!profile || profile.role !== "ADMIN") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { images: true } } },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const zip = new JSZip();
  let fileIndex = 1;

  for (const item of order.items) {
    for (const image of item.images) {
      try {
        const res = await fetch(image.originalPath);
        if (!res.ok) continue;
        const buffer = await res.arrayBuffer();
        const ext = image.originalPath.split(".").pop()?.split("?")[0] || "jpg";
        zip.file(
          `${String(fileIndex).padStart(2, "0")}-${item.frameStyleName.replace(/\s+/g, "-")}.${ext}`,
          buffer
        );
        fileIndex++;
      } catch {
        // Skip any single failed fetch rather than aborting the whole zip
        continue;
      }
    }
  }

  const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

  await prisma.uploadedImage.updateMany({
    where: { orderItem: { orderId: order.id } },
    data: { downloadedAt: new Date() },
  });

  return new NextResponse(zipBuffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${order.orderNumber}-photos.zip"`,
    },
  });
}
