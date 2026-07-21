import { createClient } from "@/lib/supabase/client";

const BUCKET = "customer-uploads";
const MAX_BYTES = 25 * 1024 * 1024; // 25MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];

export interface UploadResult {
  path: string;
  publicUrl: string;
}

/**
 * Uploads a customer's original photo to Supabase Storage.
 * Bucket "customer-uploads" must exist with a policy allowing inserts
 * (see /supabase/storage-setup.sql). Files are namespaced by a random
 * id so guests can't guess each other's paths.
 */
export async function uploadCustomerImage(file: File): Promise<UploadResult> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Please upload a JPG, PNG, WEBP, or HEIC photo.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("That photo is larger than 25MB. Please upload a smaller file.");
  }

  const supabase = createClient();
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return { path, publicUrl: publicUrlData.publicUrl };
}
