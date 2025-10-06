import { CSSProperties, useEffect, useRef } from "react";
import type { CursorLayer } from "../types";
import { resolveSvg } from "../utils";

/**
 * Minimal global hover effect:
 * - Detects if element under the cursor has CSS `cursor: pointer`
 * - Smoothly scales ALL layers while hovering
 * - No movement/system cursor rewrites (keeps scope aligned with feedback)
 */

export type Props = {
  enable?: boolean;
  showSystemCursor?: boolean;
  layers?: CursorLayer[];
  mixBlendMode?: CSSProperties["mixBlendMode"];
  zIndex?: number;

  /** Scale applied to all layers while hovering over `cursor: pointer`. */
  hoverScale?: number;        // default 1.2
  /** Lerp factor [0..1). Lower=snappier; Higher=smoother. */
  hoverSmoothing?: number;    // default 0.15
};

const ReactiveCursor = ({
  enable = true,
  layers = [
    // small default so it never looks massive unless explicitly set
    {
      SVG: "circle",
      fill: "black",
      stroke: "white",
      strokeSize: 1,
      size: { height: 12, width: 12 },
    },
  ],
  showSystemCursor = true,
  mixBlendMode = "normal",
  zIndex = 2147483647,
  hoverScale = 1.2,
  hoverSmoothing = 0.15,
}: Props) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const prevTime = useRef(performance.now());
  const raf = useRef<number | null>(null);

  // per-layer smoothed positions
  const layerPos = useRef(layers.map(() => ({ x: 0, y: 0 })));

  // global hover scale state
  const isPointer = useRef(false);
  const scaleCurrent = useRef(1);
  const scaleTarget = useRef(1);

  // keep layerPos length in sync with layers
  if (layerPos.current.length !== layers.length) {
    layerPos.current = layers.map(() => ({ x: target.current.x, y: target.current.y }));
  }

  // show/hide system cursor (parity with existing behavior)
  useEffect(() => {
    const prev = document.body.style.cursor;
    document.body.style.cursor = showSystemCursor ? prev || "" : "none";
    return () => {
      document.body.style.cursor = prev;
    };
  }, [showSystemCursor]);

  // mousemove + pointer detection
  useEffect(() => {
    if (!enable) return;

    const onMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
      const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      if (el) {
        const c = getComputedStyle(el).cursor || "";
        isPointer.current = c.includes("pointer");
      } else {
        isPointer.current = false;
      }
      scaleTarget.current = isPointer.current ? Math.max(1, hoverScale) : 1;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [enable, hoverScale]);

  // RAF animation
  useEffect(() => {
    if (!enable) return;

    const tick = () => {
      if (!cursorRef.current) {
        raf.current = requestAnimationFrame(tick);
        return;
      }

      const now = performance.now();
      prevTime.current = now;

      const children = cursorRef.current.children;

      // approach target scale
      const hs = Math.min(Math.max(hoverSmoothing, 0), 0.999);
      scaleCurrent.current = scaleCurrent.current * hs + scaleTarget.current * (1 - hs);

      // precompute sizes
      const sizes = layers.map((l) => l.size ?? { width: 12, height: 12 });

      Array.from(children).forEach((child, i) => {
        const size = sizes[i];
        const l = layers[i];
        const s = Math.min(Math.max((l.delay ?? 0) / 100, 0), 0.999);

        const pos = layerPos.current[i];
        pos.x = pos.x * s + target.current.x * (1 - s);
        pos.y = pos.y * s + target.current.y * (1 - s);

        const el = child as HTMLElement;
        el.style.transform = `translate3d(${pos.x - size.width / 2}px, ${pos.y - size.height / 2}px, 0) scale(${scaleCurrent.current})`;
        el.style.transformOrigin = "center";
      });

      raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [enable, layers, hoverSmoothing]);

  if (!enable) return null;

  return (
    <div
      ref={cursorRef}
      style={{
        pointerEvents: "none", // so hit-testing reaches underlying elements
        position: "fixed",
        inset: 0,
        mixBlendMode,
        zIndex,
      }}
    >
      {layers.map((layer, i) => {
        const Svg = resolveSvg(layer.SVG ?? "circle");
        const size = layer.size ?? { width: 12, height: 12 };
        return (
          <Svg
            key={i}
            width={size.width}
            height={size.height}
            viewBox={`0 0 ${size.width} ${size.height}`}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              opacity: layer.opacity ?? 1,
              zIndex: (zIndex || 0) - i,
            }}
            fill={layer.fill ?? "black"}
            stroke={layer.stroke ?? "white"}
            strokeWidth={layer.strokeSize ?? 1}
          />
        );
      })}
    </div>
  );
};

export default ReactiveCursor;
