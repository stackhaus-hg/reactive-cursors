// ReactiveCursor — Hover Effects + A11y Toggle (TypeScript React)
// Exports:
// - ReactiveCursorProvider: global enable/disable state (localStorage + respects prefers-reduced-motion)
// - ReactiveCursor: visual cursor (global hoverEffect + per-layer hoverEffect)
// - CursorEffectsToggle: accessibility toggle button (aria-pressed) + Alt+Shift+C
// - useCursorEffects: hook to build your own toggle UI

import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// ===================== Types =====================

type HoverEffectType = "scale"; // Extendable later: "opacity" | "blur" | etc.

export type HoverEffect = {
  type: HoverEffectType;
  amount?: number; // default 1
};

export type LayerConfig = {
  SVG?: "circle" | "ring" | "dot" | "square";
  render?: () => React.ReactNode; // custom render overrides SVG
  size?: number; // px
  className?: string;
  hoverEffect?: HoverEffect; // per-layer hover on targets only
};

export type HoverTargets = {
  cursorPointer?: boolean; // computed cursor === "pointer"
  selectors?: string[]; // e.g. ["a", "button", "[data-cursor-hover]"]
  excludeSelectors?: string[]; // e.g. ["[data-cursor-ignore]"]
  isTarget?: (el: Element) => boolean; // final say
};

export type ReactiveCursorProps = {
  enabled?: boolean; // defaults from context
  layers?: LayerConfig[]; // front-to-back
  hoverEffect?: HoverEffect; // global effect on whole stack
  hoverTargets?: HoverTargets; // where effects should trigger
  sticky?: boolean; // linger feel (cosmetic)
  zIndex?: number; // default 9999
  hideNativeCursor?: boolean; // default true
};

// ===================== Context =====================

type CursorEffectsState = {
  enabled: boolean;
  setEnabled: (v: boolean) => void;
  toggle: () => void;
};

const CursorEffectsContext = React.createContext<CursorEffectsState | null>(
  null
);

const STORAGE_KEY = "reactiveCursor:effectsEnabled";

function getPrefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export const ReactiveCursorProvider: React.FC<{
  children: React.ReactNode;
  defaultEnabled?: boolean;
}> = ({ children, defaultEnabled }) => {
  const [enabled, setEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return !!defaultEnabled;
    const reduce = getPrefersReducedMotion();
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "true") return true;
    if (stored === "false") return false;
    return defaultEnabled ?? !reduce;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, String(enabled));
  }, [enabled]);

  // Keyboard shortcut Alt+Shift+C to toggle
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && e.shiftKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
        setEnabled((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = useMemo<CursorEffectsState>(
    () => ({
      enabled,
      setEnabled,
      toggle: () => setEnabled((v) => !v),
    }),
    [enabled]
  );

  return (
    <CursorEffectsContext.Provider value={value}>
      {children}
    </CursorEffectsContext.Provider>
  );
};

export function useCursorEffects(): CursorEffectsState {
  const ctx = useContext(CursorEffectsContext);
  if (!ctx)
    throw new Error("useCursorEffects must be used within <ReactiveCursorProvider>");
  return ctx;
}

// ===================== Helpers =====================

function classNames(...xs: Array<string | undefined | false>): string {
  return xs.filter(Boolean).join(" ");
}

function isBrowser() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

// FIX for TS2345: accept Element | null and guard inside
function elMatches(el: Element | null, selector: string): boolean {
  if (!el) return false;
  const proto: any = Element.prototype;
  const fn =
    proto.matches || proto.msMatchesSelector || proto.webkitMatchesSelector;
  return !!fn && fn.call(el, selector);
}

function inClosest(el: Element | null, selector: string): boolean {
  return !!(el && (el as any).closest && (el as any).closest(selector));
}

function makeIsTargetFn(
  targets: HoverTargets | undefined
): (el: Element | null) => boolean {
  const { cursorPointer, selectors, excludeSelectors, isTarget } = targets || {};
  return (start: Element | null) => {
    if (!start) return false;

    // Exclusions first
    if (excludeSelectors && excludeSelectors.length) {
      for (const sel of excludeSelectors) {
        if (inClosest(start, sel)) return false;
      }
    }

    // Climb up the DOM tree (so nested elements still count)
    let el: Element | null = start;
    while (el) {
      if (isTarget && isTarget(el)) return true;
      if (selectors && selectors.some((sel) => elMatches(el, sel))) return true;
      if (cursorPointer) {
        const cur = getComputedStyle(el as HTMLElement).cursor;
        if (cur === "pointer") return true;
      }
      el = el.parentElement;
    }
    return false;
  };
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

// ===================== ReactiveCursor =====================

export const ReactiveCursor: React.FC<ReactiveCursorProps> = ({
  enabled: enabledProp,
  layers,
  hoverEffect,
  hoverTargets,
  sticky = true,
  zIndex = 9999,
  hideNativeCursor = true,
}) => {
  if (!isBrowser()) return null;

  const { enabled: enabledCtx } = useCursorEffects();
  const enabled = enabledProp ?? enabledCtx;

  const isTarget = useMemo(
    () =>
      makeIsTargetFn(
        hoverTargets ?? {
          cursorPointer: true,
          selectors: [
            "a",
            "button",
            "[role=button]",
            "input",
            "select",
            "textarea",
            "[data-cursor-hover]",
          ],
          excludeSelectors: ["[data-cursor-ignore]"],
        }
      ),
    [hoverTargets]
  );

  const rafRef = useRef<number | null>(null);
  const pos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const lerpPos = useRef({ x: pos.current.x, y: pos.current.y });
  const hoverRef = useRef(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Pointer move (more reliable than mousemove)
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pos.current.x = e.clientX;
      pos.current.y = e.clientY;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // Hover detection (capture phase)
  useEffect(() => {
    const onOver = (e: Event) => {
      const target = e.target as Element | null;
      hoverRef.current = !!(target && isTarget(target));
    };
    const onOut = (e: Event) => {
      const target = e.target as Element | null;
      if (target && isTarget(target)) {
        hoverRef.current = false;
      }
    };
    document.addEventListener("pointerover", onOver, true);
    document.addEventListener("pointerout", onOut, true);
    return () => {
      document.removeEventListener("pointerover", onOver, true);
      document.removeEventListener("pointerout", onOut, true);
    };
  }, [isTarget]);

  // RAF loop (smooth follow)
  useEffect(() => {
    let raf: number;
    const speed = 0.22;

    const step = () => {
      const dx = pos.current.x - lerpPos.current.x;
      const dy = pos.current.y - lerpPos.current.y;
      lerpPos.current.x += dx * speed;
      lerpPos.current.y += dy * speed;

      if (rootRef.current) {
        rootRef.current.style.transform = `translate3d(${Math.round(
          lerpPos.current.x
        )}px, ${Math.round(lerpPos.current.y)}px, 0)`;
      }
      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Hide native cursor (optional)
  useEffect(() => {
    if (!hideNativeCursor) return;
    const prev = document.body.style.cursor;
    document.body.style.cursor = enabled ? "none" : prev;
    return () => {
      document.body.style.cursor = prev;
    };
  }, [enabled, hideNativeCursor]);

  // Layers (default ring + dot)
  const mergedLayers: LayerConfig[] = useMemo(() => {
    if (layers && layers.length) return layers;
    return [
      { SVG: "ring", size: 36 },
      { SVG: "dot", size: 6 },
    ];
  }, [layers]);

  const globalHover = hoverRef.current && enabled;

  const renderPrimitive = useCallback(
    (cfg: LayerConfig, idx: number) => {
      if (cfg.render)
        return (
          <div
            key={idx}
            className={classNames("absolute inset-0 d-flex align-items-center justify-content-center", cfg.className)}
            style={{ transform: "translate(-50%, -50%)" }}
          >
            {cfg.render()}
          </div>
        );

      const s =
        cfg.size ??
        (cfg.SVG === "ring" ? 36 : cfg.SVG === "circle" ? 16 : cfg.SVG === "square" ? 16 : 6);
      const half = s / 2;

      let child: React.ReactNode = null;
      if (cfg.SVG === "ring") {
        child = (
          <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ display: "block" }}>
            <circle
              cx={half}
              cy={half}
              r={half - 1}
              fill="none"
              strokeWidth={2}
              stroke="currentColor"
            />
          </svg>
        );
      } else if (cfg.SVG === "circle" || cfg.SVG === "dot") {
        child = (
          <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ display: "block" }}>
            <circle cx={half} cy={half} r={half} fill="currentColor" />
          </svg>
        );
      } else if (cfg.SVG === "square") {
        child = (
          <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ display: "block" }}>
            <rect x={1} y={1} width={s - 2} height={s - 2} fill="none" strokeWidth={2} stroke="currentColor" />
          </svg>
        );
      }

      // Per-layer hover scale
      const layerHover = globalHover && !!cfg.hoverEffect;
      const layerScale = clamp(
        layerHover && cfg.hoverEffect?.type === "scale"
          ? cfg.hoverEffect.amount ?? 2
          : 1,
        0.1,
        8
      );

      const style: React.CSSProperties = {
        position: "absolute",
        left: 0,
        top: 0,
        transform: `translate(-50%, -50%) scale(${layerScale})`,
        transformOrigin: "center",
        transition: "transform 160ms ease, opacity 160ms ease",
        willChange: "transform",
      };

      return (
        <div key={idx} className={cfg.className} style={style}>
          {child}
        </div>
      );
    },
    [globalHover]
  );

  // Global hover scale on whole stack
  const globalScale = clamp(
    globalHover && hoverEffect?.type === "scale" ? hoverEffect.amount ?? 2 : 1,
    0.1,
    8
  );

  return (
    <div
      ref={rootRef}
      aria-hidden
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: 0,
        height: 0,
        zIndex,
        pointerEvents: "none",
        mixBlendMode: "normal",
        transform: `translate3d(${Math.round(lerpPos.current.x)}px, ${Math.round(
          lerpPos.current.y
        )}px, 0)`,
      }}
    >
      <div
        className={classNames("position-relative", enabled ? "" : "opacity-0")}
        style={{
          transform: `translate(-50%, -50%) scale(${globalScale})`,
          transformOrigin: "center",
          transition: "opacity 180ms ease, transform 160ms ease",
          color: "#111",
        }}
      >
        {mergedLayers.map(renderPrimitive)}
      </div>
    </div>
  );
};

// ===================== Toggle Button =====================

export const CursorEffectsToggle: React.FC<{
  className?: string; // pass e.g. "btn btn-dark"
  onLabel?: string;
  offLabel?: string;
}> = ({ className, onLabel = "Cursor effects on", offLabel = "Cursor effects off" }) => {
  const { enabled, toggle } = useCursorEffects();
  return (
    <button
      type="button"
      aria-pressed={enabled}
      onClick={toggle}
      className={className}
    >
      {enabled ? onLabel : offLabel}
    </button>
  );
};
