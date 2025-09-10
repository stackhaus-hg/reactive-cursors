import { FC, SVGProps } from "react";

export type SvgDefaultStyles = "arrow" | "circle" | "cross";

export type CursorLayer = {
  SVG?: FC<SVGProps<SVGSVGElement>> | SvgDefaultStyles;
  fill?: string;
  stroke?: string;
  strokeSize?: number;
  opacity?: number;
  size?: { height: number; width: number };
  delay?: number;
};
