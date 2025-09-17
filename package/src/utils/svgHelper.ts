import { FC, SVGProps } from "react";
import { SvgDefaultStyles } from "../types";

// Import Default SVG Styles
import ArrowSvg from "../svg/arrow.svg";
import CircleSvg from "../svg/circle.svg";
import CrossSvg from "../svg/cross.svg";
import SquareSvg from "../svg/square.svg";

// Map each input string to actual SVG
export const svgStylesMap = {
  default: CircleSvg,
  arrow: ArrowSvg,
  circle: CircleSvg,
  cross: CrossSvg,
  square: SquareSvg,
};

// Returns an SVG depending on input
export const resolveSvg = (
  input: SvgDefaultStyles | FC<SVGProps<SVGSVGElement>> | undefined
): FC<SVGProps<SVGSVGElement>> => {
  // If no SVG, return the default
  if (!input) return svgStylesMap.default;

  // If it's already an SVG component, return it directly
  if (typeof input !== "string") return input;

  // If it's a string, look it up in the provided map
  const svgComponent = svgStylesMap[input] || svgStylesMap.default;

  return svgComponent;
};
