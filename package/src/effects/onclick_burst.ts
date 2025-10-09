import { EffectHandler } from "./types";
import {
  getAccessibleDuration,
  getAccessibleOpacity,
  getAccessibleColor,
} from "../utils/accessibility";

const BURST_MIN_DIST = 20;
const BURST_DIST_RANGE = 40;
const REMOVE_DELAY_MS = 100;

const burst: EffectHandler = (cfg, ctx) => {
  const { event, zIndex } = ctx;
  const x = event.clientX;
  const y = event.clientY;
  const color = getAccessibleColor(cfg.color ?? "rgba(255,255,255,0.95)");
  const count = Math.min(Math.max(Math.round(cfg.amount ?? 6), 3), 20);
  const duration = getAccessibleDuration(cfg.durationMs ?? 250);
  const opacity = getAccessibleOpacity(1);

  for (let i = 0; i < count; i++) {
    const p = document.createElement("div");
    p.setAttribute("aria-hidden", "true"); // Hidden from screen readers
    p.style.position = "fixed";
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    p.style.width = "6px";
    p.style.height = "6px";
    p.style.borderRadius = "50%";
    p.style.background = color;
    p.style.pointerEvents = "none";
    p.style.zIndex = `${zIndex + 1}`;
    p.style.opacity = opacity.toString();
    p.style.transform = "translate3d(0,0,0) scale(1)";

    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5);
    const dist = BURST_MIN_DIST + Math.random() * BURST_DIST_RANGE;

    document.body.appendChild(p);

    requestAnimationFrame(() => {
      p.style.transform = `translate3d(${Math.cos(angle) * dist}px, ${
        Math.sin(angle) * dist
      }px, 0) scale(0.6)`;
      p.style.opacity = "0";
    });

    setTimeout(() => p.remove(), duration + REMOVE_DELAY_MS);
  }
};

export default burst;
