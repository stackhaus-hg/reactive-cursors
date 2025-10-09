import { CSSProperties, useEffect, useRef, useState, useCallback } from "react";
import type { EffectConfig } from "../effects/types";
import { CursorLayer } from "../types";
import { resolveSvg, svgStylesMap } from "../utils";
import {
  shouldDisableCursor,
  announceToScreenReader,
  AccessibilityWatcher,
} from "../utils/accessibility";
import effectHandlers from "../effects/index";

// Default Cursor Layer Options
const defaultSvgOptions: Required<CursorLayer> = {
  SVG: svgStylesMap.default,
  fill: "black",
  stroke: "white",
  strokeSize: 10,
  opacity: 1,
  size: {
    height: 100,
    width: 100,
  },
  delay: 0,
};

// Component Props
export type Props = {
  enable?: boolean; // enable/disable the entire component
  showSystemCursor?: boolean; // show/hide the system cursor
  layers?: CursorLayer[]; // defines each cursor draw layer
  clickEffect?: EffectConfig | EffectConfig[]; // clickEffect can be a single effect or an array of effects. Effects are triggered on pointerdown. // Example: { type: 'onclick_scale', amount: 1.5, durationMs: 200 }
  mixBlendMode?: CSSProperties["mixBlendMode"]; // CSS mix-blend-mode property to apply to the entire component
  zIndex?: number; // custom-define the z-index of the cursor (default is max z-index value)
  allowTouch?: boolean; // allow cursor on touch devices
  ignoreAccessibility?: boolean; // ignore accessibility settings (reduced motion, forced colors) and always show cursor
  announceEffects?: boolean; // announce effects to screen readers (default: false)
  respectSystemPreferences?: boolean; // automatically adjust to system accessibility preferences (default: true)
};

// ReactiveCursor Component Definition
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
  announceEffects = false,
  respectSystemPreferences = true,
  clickEffect,
}: Props) => {
  const cursorRef = useRef<HTMLDivElement>(null); // cursor DOM element
  const targetPosition = useRef({ x: 0, y: 0 }); // current system cursor xy-position, at the current animation frame
  const layerPosisitions = useRef(layers.map(() => ({ x: 0, y: 0 }))); // current xy-position of the custom cursor layers, at the previous animation frame
  const prevTime = useRef(performance.now()); // last time the animation frame was updated
  const animationFrame = useRef<number | null>(null); // current animation frame
  const accessibilityWatcher = useRef<AccessibilityWatcher | null>(null);

  // State for dynamic accessibility changes
  const [isAccessibilityDisabled, setIsAccessibilityDisabled] = useState(() =>
    shouldDisableCursor(allowTouch, ignoreAccessibility)
  );

  // Precompute layer sizes (width/height) for centering
  const layerSizes = layers.map(
    (layer) => layer.size ?? defaultSvgOptions.size
  );

  // normalize clickEffect into an array for easy iteration
  const clickEffects: EffectConfig[] = Array.isArray(clickEffect)
    ? clickEffect
    : clickEffect
    ? [clickEffect]
    : [];

  // Dynamic accessibility monitoring
  const handleAccessibilityChange = useCallback(() => {
    if (respectSystemPreferences) {
      setIsAccessibilityDisabled(
        shouldDisableCursor(allowTouch, ignoreAccessibility)
      );
    }
  }, [allowTouch, ignoreAccessibility, respectSystemPreferences]);

  // Set up accessibility watcher
  useEffect(() => {
    if (respectSystemPreferences && typeof window !== "undefined") {
      accessibilityWatcher.current = new AccessibilityWatcher(
        handleAccessibilityChange
      );

      return () => {
        if (accessibilityWatcher.current) {
          accessibilityWatcher.current.destroy();
        }
      };
    }
  }, [handleAccessibilityChange, respectSystemPreferences]);

  // Hide system cursor
  useEffect(() => {
    if (!enable || showSystemCursor) return;

    // get the originally set values
    const originalRootCursor = document.documentElement.style.cursor;
    const originalBodyCursor = document.body.style.cursor;

    // override styles with no cursor
    document.body.style.setProperty("cursor", "none", "important");
    document.documentElement.style.setProperty("cursor", "none", "important");

    return () => {
      document.documentElement.style.setProperty("cursor", originalRootCursor);
      document.body.style.setProperty("cursor", originalBodyCursor);
    };
  }, [enable, showSystemCursor]);

  // Position and animation of cursor
  useEffect(() => {
    // Handler for calculating current system cursor position
    const handleMouseMove = (e: MouseEvent) => {
      targetPosition.current = { x: e.clientX, y: e.clientY };
    };

    // Recursive function for animating each cursor layer
    const animate = () => {
      if (!cursorRef.current) return;

      const children = cursorRef.current.children;
      const now = performance.now();
      const delta = now - prevTime.current;
      prevTime.current = now;

      layers.forEach((layer, i) => {
        const pos = layerPosisitions.current[i];
        const delayMs = layer.delay ?? defaultSvgOptions.delay;
        const size = layerSizes[i];

        // update position
        const smoothing = Math.exp(-delta / delayMs); // exponential smoothing based on ms delay
        pos.x = pos.x * smoothing + targetPosition.current.x * (1 - smoothing);
        pos.y = pos.y * smoothing + targetPosition.current.y * (1 - smoothing);

        // apply transform directly to layer
        const layerEl = children[i] as HTMLElement;
        layerEl.style.transform = `translate3d(${pos.x - size.width / 2}px, ${
          pos.y - size.height / 2
        }px, 0)`; // use translate3d as it may be more likely to force GPU computation for performance (?)
      });

      // call next animation frame
      animationFrame.current = requestAnimationFrame(animate);
    };

    // bind the mousemove handler
    window.addEventListener("mousemove", handleMouseMove);
    // trigger the first animation frame
    animationFrame.current = requestAnimationFrame(animate);

    // remove effects on unmount
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    };
  }, [enable, layers]);

  // Early return if accessibility requirements suggest disabling cursor
  if (!enable || isAccessibilityDisabled) {
    return null;
  }

  // Legacy accessibility checks (kept for backward compatibility)
  // Detect touch device
  const isTouchDevice =
    typeof window !== "undefined" &&
    ("ontouchstart" in window ||
      (navigator.maxTouchPoints && navigator.maxTouchPoints > 0));

  // Detect accessibility needs
  const prefersReducedMotionLegacy =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const forcedColors =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(forced-colors: active)").matches;
  const hasAccessibilityNeeds = prefersReducedMotionLegacy || forcedColors;

  // Disable cursor if touch device (unless allowTouch) or accessibility needs (unless ignoreAccessibility)
  if (
    (isTouchDevice && !allowTouch) ||
    (hasAccessibilityNeeds && !ignoreAccessibility)
  )
    return null;

  // Ensure system cursor is shown for elements that aren't cursor:default or cursor:pointer
  useEffect(() => {
    if (!enable) return;
    // Find all elements except those with cursor:default or cursor:pointer
    const allElements = document.querySelectorAll<HTMLElement>("*");
    allElements.forEach((el) => {
      const style = window.getComputedStyle(el);
      if (
        style.cursor !== "default" &&
        style.cursor !== "pointer" &&
        style.cursor !== "none"
      ) {
        el.style.cursor = "crosshair";
      }
    });
    return () => {
      allElements.forEach((el) => {
        el.style.cursor = "";
      });
    };
  }, [enable]);

  // Add pointer (click) effects handlers.
  useEffect(() => {
    if (!clickEffects.length) return;
    if (hasAccessibilityNeeds && !ignoreAccessibility) return; // don't animate if user prefers reduced motion

    const activeCleanups = new Set<() => void>();
    // We attach to window so clicks anywhere trigger them.
    const onPointerDown = (event: PointerEvent) => {
      const layerElements = cursorRef.current
        ? Array.from(cursorRef.current.children).map(
            (child) => child as HTMLElement
          )
        : [];
      // we pass the current cursor layers as context to the effect handlers, in case they want to use them
      clickEffects.forEach((effect) => {
        const handler = effectHandlers[effect.type];
        if (!handler) return;

        // Announce effect to screen readers if enabled
        if (announceEffects) {
          announceToScreenReader(`Cursor effect ${effect.type} activated`);
        }

        const cleanup = handler(effect, {
          event,
          cursorRef: cursorRef.current,
          layerElements,
          zIndex,
        });
        if (typeof cleanup === "function") {
          activeCleanups.add(cleanup);
        }
      });
    };

    window.addEventListener("pointerdown", onPointerDown); // attach to window to catch all clicks anywhere

    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      activeCleanups.forEach((cleanup) => cleanup());
      activeCleanups.clear();
    };
  }, [
    clickEffects,
    hasAccessibilityNeeds,
    ignoreAccessibility,
    zIndex,
    announceEffects,
  ]);

  return (
    <div
      ref={cursorRef}
      role="presentation" // Indicates this is decorative
      aria-hidden="true" // Hidden from screen readers since it's visual only
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: zIndex,
        mixBlendMode: mixBlendMode,
      }}
    >
      {/* Render each layer in order, reducing z-index per layer */}
      {layers.map((layer, i) => {
        // Resolve the SVG component
        const SvgComponent = resolveSvg(layer.SVG);
        // Render the SVG cursor layer
        return (
          <SvgComponent
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
            }}
          />
        );
      })}
    </div>
  );
};

export default ReactiveCursor;
