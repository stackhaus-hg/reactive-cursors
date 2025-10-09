export type EffectType =
  | "onclick_scale"
  | "onclick_ripple"
  | "onclick_rotate"
  | "onclick_colorShift"
  | "onclick_burst";

export type EffectConfig = {
  type: EffectType;
  amount?: number;
  durationMs?: number;
  color?: string;
};

export type EffectContext = {
  event: PointerEvent;
  cursorRef: HTMLDivElement | null;
  layerElements: HTMLElement[];
  zIndex: number;
};

export type EffectHandler = (
  cfg: EffectConfig,
  ctx: EffectContext
) => void | (() => void);
