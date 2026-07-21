"use client";

import { ImageUploader } from "@/components/customizer/image-uploader";
import { CropStage, type CropTransform } from "@/components/customizer/crop-stage";

export interface SlotState {
  path: string;
  publicUrl: string;
  transform: CropTransform;
}

export function PhotoSlot({
  label,
  aspectRatio,
  value,
  onChange,
}: {
  label?: string;
  aspectRatio: number;
  value: SlotState | null;
  onChange: (value: SlotState | null) => void;
}) {
  return (
    <div className="flex flex-col items-center">
      {label && <p className="mb-2 text-xs font-medium uppercase tracking-wide text-graphite">{label}</p>}
      {!value ? (
        <ImageUploader
          onUploaded={(uploaded) =>
            onChange({ ...uploaded, transform: { x: 0, y: 0, zoom: 1, rotation: 0 } })
          }
        />
      ) : (
        <CropStage
          imageUrl={value.publicUrl}
          aspectRatio={aspectRatio}
          transform={value.transform}
          onChange={(transform) => onChange({ ...value, transform })}
        />
      )}
      {value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="mt-3 text-sm font-medium text-indigo hover:underline"
        >
          Use a different photo
        </button>
      )}
    </div>
  );
}
