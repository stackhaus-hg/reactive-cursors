import { FC, SVGProps } from "react";

// Default/Fallback SVG Styles
export type SvgDefaultStyles = "arrow" | "circle" | "cross";

// Single Cursor Layer
export type CursorLayer = {
  SVG?: FC<SVGProps<SVGSVGElement>> | SvgDefaultStyles;  // SVG to use (must supply SVGR)
  fill?: string;  // fill colour (replaces fill=currentColor in SVG file)
  stroke?: string;  // stroke colour (replaces stroke=currentColor in SVG file)
  strokeSize?: number;  // adjusts the stroke size of SVG
  opacity?: number;  // opacity of the layer (0-1)
  size?: { height: number; width: number };  // 'px' height/width of the SVG
  delay?: number;  // amount of lag that the layer has to the actual system cursor position (0=none)
};
