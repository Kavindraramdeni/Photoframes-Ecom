"use client";

import { Camera } from "lucide-react";

export type ShapeKey =
  | "rounded-square"
  | "rounded-rect"
  | "scalloped-rect"
  | "arch"
  | "strip-3"
  | "heart"
  | "circle"
  | "scalloped-circle";

const GRADIENTS = [
  ["#e7ddc8", "#c9a876"], // warm oak
  ["#e8e5df", "#c4bdae"], // stone
  ["#dfe3ea", "#a9b2c2"], // cool grey
  ["#ecdcd6", "#c99c8f"], // blush clay
  ["#dde6df", "#9fb3a5"], // sage
];

function gradientFor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return GRADIENTS[hash % GRADIENTS.length];
}

/** Generates a scalloped (wavy-edge) circle path with N bumps. */
function scallopedCirclePath(cx: number, cy: number, r: number, bumps: number, depth: number) {
  const points: string[] = [];
  const step = (Math.PI * 2) / bumps;
  for (let i = 0; i <= bumps; i++) {
    const angle = i * step;
    const midAngle = angle - step / 2;
    if (i > 0) {
      const midX = cx + (r + depth) * Math.cos(midAngle);
      const midY = cy + (r + depth) * Math.sin(midAngle);
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      points.push(`Q ${midX} ${midY} ${x} ${y}`);
    } else {
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      points.push(`M ${x} ${y}`);
    }
  }
  return points.join(" ") + " Z";
}

/** Generates a scalloped rectangle path — straight top/bottom, wavy left/right (matches K5). */
function scallopedRectPath(w: number, h: number, bumps: number, depth: number) {
  const step = h / bumps;
  let d = `M ${depth} 0 L ${w - depth} 0`;
  // right edge, waving outward
  for (let i = 0; i < bumps; i++) {
    const y1 = i * step;
    const y2 = y1 + step;
    const midY = (y1 + y2) / 2;
    const outward = i % 2 === 0 ? depth : -depth;
    d += ` Q ${w - depth + outward} ${midY} ${w - depth} ${y2}`;
  }
  d += ` L ${depth} ${h}`;
  for (let i = bumps - 1; i >= 0; i--) {
    const y1 = i * step;
    const y2 = y1 + step;
    const midY = (y1 + y2) / 2;
    const outward = i % 2 === 0 ? -depth : depth;
    d += ` Q ${depth + outward} ${midY} ${depth} ${y1}`;
  }
  return d + " Z";
}

export function FrameShapePreview({
  shape,
  seed,
  className,
}: {
  shape: ShapeKey;
  seed: string;
  className?: string;
}) {
  const [from, to] = gradientFor(seed);
  const gradientId = `fp-grad-${seed.replace(/[^a-zA-Z0-9]/g, "")}`;

  const iconOverlay = (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <Camera className="h-6 w-6 text-ink/25" strokeWidth={1.5} aria-hidden="true" />
    </div>
  );

  const gradientDef = (
    <defs>
      <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={from} />
        <stop offset="100%" stopColor={to} />
      </linearGradient>
    </defs>
  );

  if (shape === "strip-3") {
    return (
      <div className={`relative flex h-full w-full flex-col justify-center gap-2 p-4 ${className ?? ""}`} style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex-1 rounded-md border border-white/40 bg-white/25" />
        ))}
        {iconOverlay}
      </div>
    );
  }

  let pathD: string | null = null;
  let viewBox = "0 0 100 100";

  switch (shape) {
    case "rounded-square":
    case "rounded-rect":
      // Simple rounded rect — handled via CSS border-radius below for crisper edges.
      break;
    case "scalloped-rect":
      pathD = scallopedRectPath(100, 100, 4, 6);
      break;
    case "arch":
      pathD = "M 8 100 L 8 40 A 42 42 0 0 1 92 40 L 92 100 Z";
      break;
    case "heart":
      pathD =
        "M 50 88 C 15 65 2 42 2 25 C 2 8 16 -2 30 2 C 40 5 47 13 50 20 C 53 13 60 5 70 2 C 84 -2 98 8 98 25 C 98 42 85 65 50 88 Z";
      viewBox = "0 -5 100 100";
      break;
    case "circle":
      break; // rendered as a plain circle below
    case "scalloped-circle":
      pathD = scallopedCirclePath(50, 50, 42, 14, 6);
      break;
  }

  if (shape === "rounded-square" || shape === "rounded-rect") {
    return (
      <div
        className={`relative h-full w-full rounded-2xl ${className ?? ""}`}
        style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
      >
        {iconOverlay}
      </div>
    );
  }

  if (shape === "circle") {
    return (
      <div className={`relative h-full w-full ${className ?? ""}`}>
        <svg viewBox="0 0 100 100" className="h-full w-full">
          {gradientDef}
          <circle cx="50" cy="50" r="48" fill={`url(#${gradientId})`} />
        </svg>
        {iconOverlay}
      </div>
    );
  }

  return (
    <div className={`relative h-full w-full ${className ?? ""}`}>
      <svg viewBox={viewBox} className="h-full w-full" preserveAspectRatio="xMidYMid meet">
        {gradientDef}
        <path d={pathD!} fill={`url(#${gradientId})`} />
      </svg>
      {iconOverlay}
    </div>
  );
}
