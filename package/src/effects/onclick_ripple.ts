import { EffectHandler } from "./types";
import {
  getAccessibleDuration,
  getAccessibleOpacity,
  getAccessibleColor,
} from "../utils/accessibility";

const RIPPLE_REMOVE_DELAY_MS = 50;

const ripple: EffectHandler = (cfg, ctx) => {
  const { event, zIndex } = ctx;
  const x = event.clientX;
  const y = event.clientY;
  const color = getAccessibleColor(cfg.color ?? "rgba(255,255,255,0.9)");
  const size = cfg.amount ?? 100;
  const duration = getAccessibleDuration(cfg.durationMs ?? 250);
  const opacity = getAccessibleOpacity(0.9);

  const rippleEl = document.createElement("div");
  rippleEl.setAttribute("aria-hidden", "true"); // Hidden from screen readers
  rippleEl.style.position = "fixed";
  rippleEl.style.left = `${x - size / 2}px`;
  rippleEl.style.top = `${y - size / 2}px`;
  rippleEl.style.width = `${size}px`;
  rippleEl.style.height = `${size}px`;
  rippleEl.style.pointerEvents = "none";
  rippleEl.style.borderRadius = "50%";
  rippleEl.style.border = `2px solid ${color}`;
  rippleEl.style.opacity = opacity.toString();
  rippleEl.style.transform = "scale(0.1)";
  rippleEl.style.transition = `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`;
  rippleEl.style.zIndex = `${zIndex + 1}`;

  document.body.appendChild(rippleEl);

  requestAnimationFrame(() => {
    rippleEl.style.transform = "scale(1.8)";
    rippleEl.style.opacity = "0";
  });

  setTimeout(() => rippleEl.remove(), duration + RIPPLE_REMOVE_DELAY_MS);
};

export default ripple;
