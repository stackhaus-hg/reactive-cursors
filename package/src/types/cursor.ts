import { FC, SVGProps } from "react";

export type CursorLayer = {
  SVG?: FC<SVGProps<SVGSVGElement>> | string;
  fill?: string;
  stroke?: string;
  strokeSize?: number;
  opacity?: number;
  size?: { height: number; width: number };
  delay?: number;
};
