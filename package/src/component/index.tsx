import { CSSProperties, useEffect, useRef, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { CursorLayer } from "../types";
import { resolveSvg, svgStylesMap } from "../utils";

// Default layer options
const defaultSvgOptions: Required<CursorLayer> = {
  SVG: svgStylesMap.default,
  fill: "black",
  stroke: "white",
  strokeSize: 10,
  opacity: 1,
  size: { height: 100, width: 100 },
  delay: 0,
};

// Props
export type Props = {
  enable?: boolean;
  showSystemCursor?: boolean;
  layers?: CursorLayer[];
  clickEffect?:
    | {
        type:
          | "onclick_scale"
          | "onclick_ripple"
          | "onclick_rotate"
          | "onclick_colorShift"
          | "onclick_burst";
        amount?: number;
        durationMs?: number;
        color?: string;
      }
    | Array<{
        type:
          | "onclick_scale"
          | "onclick_ripple"
          | "onclick_rotate"
          | "onclick_colorShift"
          | "onclick_burst";
        amount?: number;
        durationMs?: number;
        color?: string;
      }>;
  mixBlendMode?: CSSProperties["mixBlendMode"];
  zIndex?: number;
  allowTouch?: boolean;
  ignoreAccessibility?: boolean;
  className?: string;
  style?: CSSProperties;
};

const ReactiveCursor = ({
  enable = true,
  layers = [
    {
      fill: "black",
      stroke: "white",
      strokeSize: 10,
      size: { height: 20, width: 20 },
    },
  ],
  showSystemCursor = true,
  mixBlendMode = "normal",
  zIndex = 2147483647,
  allowTouch = false,
  ignoreAccessibility = false,
  clickEffect,
  className,
  style,
}: Props) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const targetPosition = useRef({ x: 0, y: 0 });
  const layerPositions = useRef(layers.map(() => ({ x: 0, y: 0 })));
  const prevTime = useRef(performance.now());
  const animationFrame = useRef<number | null>(null);

  const [env, setEnv] = useState({
    isTouch: false,
    reducedMotion: false,
    forcedColors: false,
  });

  // Detect environment (SSR-safe)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isTouch =
      "ontouchstart" in window || (navigator.maxTouchPoints ?? 0) > 0;
    const reducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    const forcedColors =
      window.matchMedia?.("(forced-colors: active)")?.matches ?? false;
    setEnv({ isTouch, reducedMotion, forcedColors });
  }, []);

  const hasA11yNeeds = env.reducedMotion || env.forcedColors;
  const clickEffects = Array.isArray(clickEffect)
    ? clickEffect
    : clickEffect
    ? [clickEffect]
    : [];

  // If disabled/touch (and not allowed)/a11y preference: skip the cursor render
  if (
    !enable ||
    (env.isTouch && !allowTouch) ||
    (hasA11yNeeds && !ignoreAccessibility)
  )
    return null;

  // Hide system cursor
  useEffect(() => {
    if (!enable || showSystemCursor) return;
    const rootCursor = document.documentElement.style.cursor;
    const bodyCursor = document.body.style.cursor;
    document.body.style.setProperty("cursor", "none", "important");
    document.documentElement.style.setProperty("cursor", "none", "important");
    return () => {
      document.documentElement.style.cursor = rootCursor;
      document.body.style.cursor = bodyCursor;
    };
  }, [enable, showSystemCursor]);

  const layerSizes = useMemo(
    () => layers.map((l) => l.size ?? defaultSvgOptions.size),
    [layers]
  );

  // Sync positions when layers change
  useEffect(() => {
    const current = layerPositions.current;
    if (current.length !== layers.length) {
      const { x, y } = targetPosition.current;
      layerPositions.current = layers.map((_, i) => current[i] ?? { x, y });
    }
  }, [layers.length]);

  // Pointer tracking
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const events = e.getCoalescedEvents?.() ?? [e];
      const last = events[events.length - 1];
      targetPosition.current.x = last.clientX;
      targetPosition.current.y = last.clientY;
    };
    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  // Animation loop for cursor layers (with smoothing)
  useEffect(() => {
    if (!enable) return;
    const animate = () => {
      const now = performance.now();
      const delta = now - prevTime.current;
      prevTime.current = now;
      const container = cursorRef.current;
      if (!container) return;
      const children = Array.from(container.children) as HTMLElement[];

      layers.forEach((layer, i) => {
        const pos = layerPositions.current[i];
        const delayMs = layer.delay ?? defaultSvgOptions.delay;
        const size = layerSizes[i];
        const smoothing = delayMs > 0 ? Math.exp(-delta / delayMs) : 0; // 0 means snap
        pos.x = pos.x * smoothing + targetPosition.current.x * (1 - smoothing);
        pos.y = pos.y * smoothing + targetPosition.current.y * (1 - smoothing);
        const layerEl = children[i];
        if (!layerEl) return;
        layerEl.style.setProperty("--rc-x", `${pos.x - size.width / 2}px`);
        layerEl.style.setProperty("--rc-y", `${pos.y - size.height / 2}px`);
      });

      animationFrame.current = requestAnimationFrame(animate);
    };
    animationFrame.current = requestAnimationFrame(animate);

    // Pause on tab hide
    const onVis = () => {
      if (document.hidden && animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
        animationFrame.current = null;
      } else if (!document.hidden && !animationFrame.current) {
        prevTime.current = performance.now();
        animationFrame.current = requestAnimationFrame(animate);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [enable, layers, layerSizes]);

  // Click effects
  useEffect(() => {
    if (!clickEffects.length || (hasA11yNeeds && !ignoreAccessibility)) return;

    // load the effects registry (dynamically scans folder when available)
    let effects: Record<string, any> | null = null;
    const loadEffects = async () => {
      if (!effects) {
        // optional runtime-only module; provide a safe fallback so builds without the effects folder still succeed
        // @ts-ignore - dynamic optional import of a module that may not exist in some builds
        const mod = await import("../effects/loader").catch(() => ({
          loadEffectsRegistry: async () => ({} as Record<string, any>),
        }));
        effects = await (mod.loadEffectsRegistry
          ? mod.loadEffectsRegistry()
          : ({} as Record<string, any>));
      }
      return effects;
    };

    const onPointerDown = (e: PointerEvent) => {
      loadEffects().then((map) => {
        if (!map) {
          // No effects registry available; silently ignore clicks or log if desired.
          return;
        }

        const svgs = cursorRef.current
          ? (Array.from(cursorRef.current.children) as HTMLElement[])
          : [];
        const ctx = {
          event: e,
          cursorRef: cursorRef.current,
          layerElements: svgs,
          zIndex,
        };

        clickEffects.forEach((cfg) => {
          const handler = map[cfg.type];
          if (typeof handler === "function") {
            try {
              handler(cfg as any, ctx);
            } catch (err) {
              // don't throw from event handler

              console.warn("Effect handler error", err);
            }
          } else {
            console.warn("Unknown click effect", cfg.type);
          }
        });
      });
    };

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [clickEffects, hasA11yNeeds, ignoreAccessibility, zIndex]);

  const cursorEl = (
    <div
      ref={cursorRef}
      className={className}
      role="presentation"
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex,
        mixBlendMode,
        ...style,
      }}
    >
      {layers.map((layer, i) => {
        const Svg = resolveSvg(layer.SVG);
        return (
          <Svg
            key={`reactive-cursor-layer-${i}`}
            color={layer.fill ?? defaultSvgOptions.fill}
            stroke={layer.stroke ?? defaultSvgOptions.stroke}
            strokeWidth={layer.strokeSize ?? defaultSvgOptions.strokeSize}
            height={layer.size?.height ?? defaultSvgOptions.size.height}
            width={layer.size?.width ?? defaultSvgOptions.size.width}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              opacity: layer.opacity ?? defaultSvgOptions.opacity,
              zIndex: zIndex - i,
              willChange: "transform",
              transformOrigin: "center",
              transform:
                "translate3d(var(--rc-x,0px), var(--rc-y,0px), 0) rotate(var(--rc-rot,0deg)) scale(var(--rc-scale,1))",
            }}
          />
        );
      })}
    </div>
  );

  return createPortal(cursorEl, document.body);
};

export default ReactiveCursor;
