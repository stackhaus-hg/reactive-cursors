import { EffectHandler } from "./types";
import { getAccessibleDuration, getAccessibleColor } from "../utils/accessibility";

  // Use accessibility utilities for color and duration
  const color = getAccessibleColor(cfg.color ?? "rgba(255,255,255,0.9)");
  const duration = getAccessibleDuration(cfg.durationMs ?? 250);
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
