export * from "./types";
import onclick_scale from "./onclick_scale";
import onclick_rotate from "./onclick_rotate";
import onclick_colorShift from "./onclick_colorShift";
import onclick_ripple from "./onclick_ripple";
import onclick_burst from "./onclick_burst";
import type { EffectHandler, EffectType } from "./types";

// Static registry of all effects (also used as fallback if dynamic loading isn't available)
const effectHandlers: Record<EffectType, EffectHandler> = {
  onclick_scale,
  onclick_rotate,
  onclick_colorShift,
  onclick_ripple,
  onclick_burst,
};

export default effectHandlers;
