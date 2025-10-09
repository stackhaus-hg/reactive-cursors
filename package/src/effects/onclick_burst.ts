import { EffectHandler } from "./types";

const burst: EffectHandler = (cfg, ctx) => {
  const { event, zIndex } = ctx;
  const x = event.clientX;
  const y = event.clientY;
  const color = cfg.color ?? "rgba(255,255,255,0.95)";
  const count = Math.min(Math.max(Math.round(cfg.amount ?? 6), 3), 20);
  const duration = cfg.durationMs ?? 250;

  for (let i = 0; i < count; i++) {
    const p = document.createElement("div");
    p.style.position = "fixed";
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    p.style.width = "6px";
    p.style.height = "6px";
    p.style.borderRadius = "50%";
    p.style.background = color;
    p.style.pointerEvents = "none";
    p.style.zIndex = `${zIndex + 1}`;
    p.style.opacity = "1";
    p.style.transform = "translate3d(0,0,0) scale(1)";
    p.style.transition = `transform ${duration}ms cubic-bezier(.2,.8,.3,1), opacity ${duration}ms ease-out`;
    document.body.appendChild(p);
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5);
    const dist = 20 + Math.random() * 40;
    requestAnimationFrame(() => {
      p.style.transform = `translate3d(${Math.cos(angle) * dist}px, ${
        Math.sin(angle) * dist
      }px, 0) scale(0.6)`;
      p.style.opacity = "0";
    });
    setTimeout(() => p.remove(), duration + 50);
  }
};

export default burst;
