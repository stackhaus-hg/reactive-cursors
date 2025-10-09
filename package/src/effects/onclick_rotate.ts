import { EffectHandler } from "./types";

const rotate: EffectHandler = (cfg, ctx) => {
  const amount = cfg.amount ?? 1;
  const duration = cfg.durationMs ?? 250;
  const deg = amount * 180;
  ctx.layerElements.forEach((el) => {
    el.style.transition = `transform ${duration}ms cubic-bezier(.2,.9,.3,1)`;
    el.style.setProperty("--rc-rot", `${deg}deg`);
    setTimeout(() => el.style.setProperty("--rc-rot", "0deg"), duration);
  });
};

export default rotate;
