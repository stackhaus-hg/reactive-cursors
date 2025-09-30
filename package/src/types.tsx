// package/src/types.tsx
import * as React from "react";

/** Built-in SVGs used by defaults; you can still pass a custom React SVG component via layer.SVG */
const builtins: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  default: (p) => (
    <svg viewBox="0 0 8 8" width="8" height="8" {...p}>
      <circle cx="4" cy="4" r="3" fill="currentColor" />
    </svg>
  ),
  ring: (p) => (
    <svg viewBox="0 0 28 28" width="28" height="28" {...p}>
      <circle cx="14" cy="14" r="12.5" fill="none" stroke="currentColor" strokeWidth="2.5" />
    </svg>
  ),

  // Optional extras—use by name in layers if you want them
  circle: (p) => (
    <svg viewBox="0 0 20 20" width="20" height="20" {...p}>
      <circle cx="10" cy="10" r="10" fill="currentColor" />
    </svg>
  ),
  cross: (p) => (
    <svg viewBox="0 0 20 20" width="20" height="20" {...p}>
      <path d="M3 10h14M10 3v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  arrow: (p) => (
    <svg viewBox="0 0 24 24" width="24" height="24" {...p}>
      <path d="M4 12h14M13 7l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

export type HoverEffect = { type: "scale"; amount?: number };

export type CursorLayer = {
  SVG?: string | React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color?: string;
  opacity?: number;
  size?: { width: number; height: number };
  delay?: number;
  hoverEffect?: HoverEffect; // per-layer override
};

export type LayersProp = Array<CursorLayer | string>;

export type ReactiveCursorProps = {
  enabled?: boolean;
  hideNativeCursor?: boolean;
  hoverEffect?: HoverEffect;  // global effect
  layers?: LayersProp;
  hoverSelector?: string;
  zIndex?: number;
};

/** NAMED export (required by your component): resolve a built-in name or a custom React component */
export function resolveSvg(
  SVG?: string | React.ComponentType<React.SVGProps<SVGSVGElement>>
): React.ComponentType<React.SVGProps<SVGSVGElement>> {
  if (!SVG) return builtins.default;
  if (typeof SVG === "string") return builtins[SVG] ?? builtins.default;
  return SVG;
}
