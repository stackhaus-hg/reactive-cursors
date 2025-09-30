import * as React from "react";
import { resolveSvg } from "../types"; // UNCHANGED: provided by package/src/types.tsx
import type { CursorLayer, HoverEffect, LayersProp, ReactiveCursorProps } from "../types"; // UNCHANGED

/** Utility (UNCHANGED helpers) */
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** UNCHANGED: default visual layers (you can override via props.layers)
 *  CHANGE: Added a SECOND ring layer that trails with a strong smoothing factor (~feels like ~1s).
 *  Notes:
 *    - The smoothing `delay` here is NOT seconds; it's a factor (0..0.95).
 *      Using 0.95 makes the ring “lag behind” enough to feel close to ~1s at 60fps.
 *    - Made the trailing ring slightly larger so it’s clearly visible around the dot.
 */
const DEFAULT_LAYERS: LayersProp = [
  { SVG: "default", color: "#111", opacity: 1, delay: 0.15 },                         // UNCHANGED: small dot
  { SVG: "ring",    color: "#111", opacity: 0.9, delay: 0.30,                          // UNCHANGED: close ring
    size: { width: 28, height: 28 } },                                                 // CHANGE: make sure it’s a bit larger than the dot
  { SVG: "ring",    color: "#111", opacity: 0.75,                                      // CHANGE: new trailing ring layer
    delay: 0.95,                                                                        // CHANGE: strong smoothing ≈ ~1s “feel”
    size: { width: 40, height: 40 },                                                    // CHANGE: bigger, clearly visible around the dot
    hoverEffect: { type: "scale", amount: 1.1 } },                                      // CHANGE: subtle scale on hover (optional)
];

/** CHANGE: selector used *in addition* to CSS cursor:pointer to detect interactivity */
const DEFAULT_HOVER_SELECTOR = '[data-cursor="interactive"]';

/** CHANGE: treat an element as "interactive" if (a) it or an ancestor has cursor:pointer OR (b) matches selector */
function isInteractive(target: Element | null, selector: string): boolean {
  if (!target) return false;
  let el: Element | null = target;
  while (el) {
    const cs = window.getComputedStyle(el);
    if (cs.cursor === "pointer") return true;                 // CHANGE: Trello task trigger
    if ((el as Element).matches?.(selector)) return true;      // CHANGE: attribute-based trigger
    el = el.parentElement;
  }
  return false;
}

/** CHANGE: track "are we hovering something interactive" */
function useIsHovering(selector: string) {
  const [hovering, setHovering] = React.useState(false);
  React.useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      setHovering(isInteractive(el, selector));
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [selector]);
  return hovering;
}

type LayerViewProps = {
  layer: CursorLayer;
  baseHover?: HoverEffect; // CHANGE: global (whole-cursor) effect passed down
  /** target position is updated by parent RAF (in CSS pixels) */
  target: React.MutableRefObject<{ x: number; y: number }>;
  hovering: boolean;       // CHANGE: whether current target is interactive
  z: number;
};

/** CHANGE: apply per-layer OR global hover effect by scaling while preserving your translate3d */
function LayerView({ layer, baseHover, target, hovering, z }: LayerViewProps) {
  const SVG = resolveSvg(layer.SVG);
  const ref = React.useRef<HTMLDivElement | null>(null);
  const pos = React.useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  // UNCHANGED sizing / delay defaults
  const width = layer.size?.width ?? 20;
  const height = layer.size?.height ?? 20;
  const delay = clamp(layer.delay ?? 0.2, 0, 0.95);

  // CHANGE: prefer the layer's effect; fall back to the global effect
  const eff = layer.hoverEffect ?? baseHover;
  const scaleAmount = hovering && eff?.type === "scale" ? (eff.amount ?? 1.6) : 1;

  React.useEffect(() => {
    let raf: number;
    const tick = () => {
      // UNCHANGED: smooth follow
      pos.current.x = lerp(pos.current.x, target.current.x, 1 - delay);
      pos.current.y = lerp(pos.current.y, target.current.y, 1 - delay);

      const el = ref.current;
      if (el) {
        // CHANGE: add scale() to existing translate3d() for the hover effect
        el.style.transform = `translate3d(${pos.current.x - width / 2}px, ${pos.current.y - height / 2}px, 0) scale(${scaleAmount})`;
        el.style.opacity = String(layer.opacity ?? 1);
        el.style.color = layer.color ?? "currentColor";
        el.style.zIndex = String(z);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [delay, width, height, scaleAmount, layer.opacity, layer.color, z]);

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width,
        height,
        pointerEvents: "none",
        willChange: "transform",
        transform: `translate3d(${pos.current.x - width / 2}px, ${pos.current.y - height / 2}px, 0)`, // UNCHANGED base transform
      }}
      aria-hidden
    >
      <SVG width={width} height={height} />
    </div>
  );
}

export function ReactiveCursor({
  enabled = true,
  hideNativeCursor = true,
  hoverEffect,                          // CHANGE: global hover effect (optional)
  layers,
  hoverSelector = DEFAULT_HOVER_SELECTOR, // CHANGE: attribute selector (optional)
  zIndex = 9999,
}: ReactiveCursorProps) {
  // UNCHANGED: SSR guard
  if (typeof window === "undefined" || typeof document === "undefined") return null;

  // UNCHANGED: shared target position
  const target = React.useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  // UNCHANGED: track pointer position
  React.useEffect(() => {
    const onMove = (e: MouseEvent) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // UNCHANGED: hide native cursor when enabled
  React.useEffect(() => {
    if (!enabled || !hideNativeCursor) return;
    const prev = document.body.style.cursor;
    document.body.style.cursor = "none";
    return () => { document.body.style.cursor = prev; };
  }, [enabled, hideNativeCursor]);

  if (!enabled) return null;

  // CHANGE: detect when we're over an interactive element
  const hovering = useIsHovering(hoverSelector);

  // UNCHANGED: allow string shorthands in layers; default to our 3-layer stack
  const layersToRender: LayersProp = (layers?.length ? layers : DEFAULT_LAYERS).map((l) =>
    typeof l === "string" ? ({ SVG: l } as CursorLayer) : l
  );

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex,
      }}
      aria-hidden
    >
      {layersToRender.map((layer, i) => (
        <LayerView
          key={i}
          layer={layer}
          baseHover={hoverEffect}   // CHANGE: pass global effect to layers
          target={target}
          hovering={hovering}
          z={zIndex + i}
        />
      ))}
    </div>
  );
}

export default ReactiveCursor;
