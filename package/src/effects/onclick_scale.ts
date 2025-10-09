import { EffectHandler } from "./types";
import { getAccessibleDuration } from "../utils/accessibility";

const scale: EffectHandler = (cfg, ctx) => {
  const amount = cfg.amount ?? 1.6;
  const duration = getAccessibleDuration(cfg.durationMs ?? 250);

  ctx.layerElements.forEach((el) => {
    el.style.transition = `transform ${duration}ms ease-out`;
    el.style.setProperty("--rc-scale", `${amount}`);
    setTimeout(() => el.style.setProperty("--rc-scale", "1"), duration);
  });
};

export default scale;
