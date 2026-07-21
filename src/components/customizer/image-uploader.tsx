"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud, Loader2 } from "lucide-react";
import { uploadCustomerImage } from "@/lib/upload-image";
import { toast } from "sonner";

export function ImageUploader({
  onUploaded,
}: {
  onUploaded: (result: { path: string; publicUrl: string }) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      setIsUploading(true);
      try {
        const result = await uploadCustomerImage(file);
        onUploaded(result);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed. Please try again.");
      } finally {
        setIsUploading(false);
      }
    },
    [onUploaded]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
      }}
      className={`flex aspect-[4/5] w-full max-w-sm flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
        isDragOver ? "border-indigo bg-indigo/5" : "border-line bg-paper-warm"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {isUploading ? (
        <>
          <Loader2 className="h-8 w-8 animate-spin text-indigo" aria-hidden="true" />
          <p className="text-sm text-graphite">Uploading your photo…</p>
        </>
      ) : (
        <>
          <UploadCloud className="h-8 w-8 text-graphite" aria-hidden="true" />
          <p className="text-sm font-medium text-ink">Drag & drop a photo here</p>
          <p className="text-xs text-graphite">JPG, PNG, WEBP, or HEIC — up to 25MB</p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-2 rounded-full bg-ink px-5 py-2 text-sm font-medium text-white hover:bg-stone-700"
          >
            Choose a photo
          </button>
        </>
      )}
    </div>
  );
}
