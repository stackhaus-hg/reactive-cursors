import { EffectHandler } from "./types";

const colorShift: EffectHandler = (cfg, ctx) => {
  const color = cfg.color ?? "rgba(255,255,255,0.9)";
  const duration = cfg.durationMs ?? 250;
  ctx.layerElements.forEach((el) => {
    const origFill = el.getAttribute("fill") || "";
    const origStroke = el.getAttribute("stroke") || "";
    el.setAttribute("fill", color);
    el.setAttribute("stroke", color);
    setTimeout(() => {
      if (origFill) el.setAttribute("fill", origFill);
      else el.removeAttribute("fill");
      if (origStroke) el.setAttribute("stroke", origStroke);
      else el.removeAttribute("stroke");
    }, duration);
  });
};

export default colorShift;
