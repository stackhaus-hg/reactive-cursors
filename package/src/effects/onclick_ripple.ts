import { EffectHandler } from "./types";

const ripple: EffectHandler = (cfg, ctx) => {
  const { event, zIndex } = ctx;
  const x = event.clientX;
  const y = event.clientY;
  const color = cfg.color ?? "rgba(255,255,255,0.9)";
  const size = cfg.amount ?? 100;
  const duration = cfg.durationMs ?? 250;

  const rippleEl = document.createElement("div");
  rippleEl.style.position = "fixed";
  rippleEl.style.left = `${x - size / 2}px`;
  rippleEl.style.top = `${y - size / 2}px`;
  rippleEl.style.width = `${size}px`;
  rippleEl.style.height = `${size}px`;
  rippleEl.style.pointerEvents = "none";
  rippleEl.style.borderRadius = "50%";
  rippleEl.style.border = `2px solid ${color}`;
  rippleEl.style.opacity = "0.9";
  rippleEl.style.transform = "scale(0.1)";
  rippleEl.style.transition = `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`;
  rippleEl.style.zIndex = `${zIndex + 1}`;
  document.body.appendChild(rippleEl);
  requestAnimationFrame(() => {
    rippleEl.style.transform = "scale(1.8)";
    rippleEl.style.opacity = "0";
  });
  setTimeout(() => rippleEl.remove(), duration + 50);
};

export default ripple;
