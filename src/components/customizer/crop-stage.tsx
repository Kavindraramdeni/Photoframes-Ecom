"use client";

import { useCallback, useRef, useState } from "react";
import { RotateCcw, RotateCw, ZoomIn, ZoomOut } from "lucide-react";

export interface CropTransform {
  x: number; // pan offset in % of stage width, -50..50
  y: number; // pan offset in % of stage height
  zoom: number; // 1..4
  rotation: number; // degrees
}

export function CropStage({
  imageUrl,
  aspectRatio,
  transform,
  onChange,
}: {
  imageUrl: string;
  aspectRatio: number; // width / height
  transform: CropTransform;
  onChange: (t: CropTransform) => void;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(
    null
  );
  const [isDragging, setIsDragging] = useState(false);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      (e.target as Element).setPointerCapture(e.pointerId);
      dragState.current = {
        startX: e.clientX,
        startY: e.clientY,
        origX: transform.x,
        origY: transform.y,
      };
      setIsDragging(true);
    },
    [transform.x, transform.y]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragState.current || !stageRef.current) return;
      const rect = stageRef.current.getBoundingClientRect();
      const dxPct = ((e.clientX - dragState.current.startX) / rect.width) * 100;
      const dyPct = ((e.clientY - dragState.current.startY) / rect.height) * 100;
      const maxOffset = (transform.zoom - 1) * 50;
      const nextX = clamp(dragState.current.origX + dxPct, -maxOffset, maxOffset);
      const nextY = clamp(dragState.current.origY + dyPct, -maxOffset, maxOffset);
      onChange({ ...transform, x: nextX, y: nextY });
    },
    [transform, onChange]
  );

  const onPointerUp = useCallback(() => {
    dragState.current = null;
    setIsDragging(false);
  }, []);

  return (
    <div>
      <div
        ref={stageRef}
        role="slider"
        aria-label="Drag to reposition your photo within the frame"
        aria-valuenow={Math.round(transform.zoom * 100)}
        aria-valuemin={100}
        aria-valuemax={400}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={(e) => {
          const step = 4;
          if (e.key === "ArrowLeft") onChange({ ...transform, x: transform.x - step });
          if (e.key === "ArrowRight") onChange({ ...transform, x: transform.x + step });
          if (e.key === "ArrowUp") onChange({ ...transform, y: transform.y - step });
          if (e.key === "ArrowDown") onChange({ ...transform, y: transform.y + step });
        }}
        className="relative mx-auto overflow-hidden rounded-xl border-4 border-ink bg-stone-900 shadow-inner touch-none select-none"
        style={{
          aspectRatio: String(aspectRatio),
          width: "100%",
          maxWidth: 420,
          cursor: isDragging ? "grabbing" : "grab",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt=""
          draggable={false}
          className="absolute top-1/2 left-1/2 max-w-none"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `translate(-50%, -50%) translate(${transform.x}%, ${transform.y}%) scale(${transform.zoom}) rotate(${transform.rotation}deg)`,
          }}
        />
      </div>

      <div className="mt-4 flex items-center justify-center gap-4">
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => onChange({ ...transform, zoom: clamp(transform.zoom - 0.2, 1, 4) })}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line hover:bg-stone-100"
        >
          <ZoomOut className="h-4 w-4" aria-hidden="true" />
        </button>

        <input
          type="range"
          min={1}
          max={4}
          step={0.05}
          value={transform.zoom}
          onChange={(e) => onChange({ ...transform, zoom: Number(e.target.value) })}
          aria-label="Zoom"
          className="w-32 accent-indigo"
        />

        <button
          type="button"
          aria-label="Zoom in"
          onClick={() => onChange({ ...transform, zoom: clamp(transform.zoom + 0.2, 1, 4) })}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line hover:bg-stone-100"
        >
          <ZoomIn className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="mx-1 h-6 w-px bg-line" aria-hidden="true" />

        <button
          type="button"
          aria-label="Rotate left 90 degrees"
          onClick={() => onChange({ ...transform, rotation: transform.rotation - 90 })}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line hover:bg-stone-100"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Rotate right 90 degrees"
          onClick={() => onChange({ ...transform, rotation: transform.rotation + 90 })}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line hover:bg-stone-100"
        >
          <RotateCw className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <p className="mt-2 text-center text-xs text-graphite">
        Drag the photo to reposition · use arrow keys when focused
      </p>
    </div>
  );
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}
