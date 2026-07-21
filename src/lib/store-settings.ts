import { prisma } from "@/lib/prisma";

export async function getStoreSettings() {
  let settings = await prisma.storeSettings.findUnique({ where: { id: "singleton" } });
  if (!settings) {
    settings = await prisma.storeSettings.create({ data: { id: "singleton" } });
  }
  return settings;
}
