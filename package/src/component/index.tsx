import { CSSProperties, useEffect, useRef } from "react";
import { CursorLayer } from "../types";
import { resolveSvg, svgStylesMap } from "../utils";

// Default Cursor Layer Options
const defaultSvgOptions: Required<CursorLayer> = {
  SVG: svgStylesMap.default,
  fill: "black",
  stroke: "white",
  strokeSize: 10,
  opacity: 1,
  size: {
    height: 100,
    width: 100,
  },
  delay: 0,
};

// Component Props
export type Props = {
  enable?: boolean; // enable/disable the entire component
  showSystemCursor?: boolean; // show/hide the system cursor
  layers?: CursorLayer[]; // defines each cursor draw layer
  mixBlendMode?: CSSProperties["mixBlendMode"]; // CSS mix-blend-mode property to apply to the entire component
  zIndex?: number; // custom-define the z-index of the cursor (default is max z-index value)
};

// Component
const ReactiveCursor = ({
  enable = true,
  layers = [
    {
      fill: "black",
      stroke: "white",
      strokeSize: 10,
      size: { height: 20, width: 20 },
    },
  ],
  showSystemCursor = true,
  mixBlendMode = "normal",
  zIndex = 2147483647,
}: Props) => {
  const cursorRef = useRef<HTMLDivElement>(null); // cursor DOM element
  const targetPosition = useRef({ x: 0, y: 0 }); // current system cursor xy-position, at the current animation frame
  const layerPosisitions = useRef(layers.map(() => ({ x: 0, y: 0 }))); // current xy-position of the custom cursor layers, at the previous animation frame
  const animationFrame = useRef<number | null>(null); // current animation frame

  // Precompute layer sizes (width/height) for centering
  const layerSizes = layers.map(
    (layer) => layer.size ?? defaultSvgOptions.size
  );

  // Hide system cursor
  useEffect(() => {
    if (!enable || showSystemCursor) return;

    // get the originally set values
    const originalRootCursor = document.documentElement.style.cursor;
    const originalBodyCursor = document.body.style.cursor;

    // override styles with no cursor
    document.body.style.setProperty("cursor", "none", "important");
    document.documentElement.style.setProperty("cursor", "none", "important");

    return () => {
      document.documentElement.style.setProperty("cursor", originalRootCursor);
      document.body.style.setProperty("cursor", originalBodyCursor);
    };
  }, [enable, showSystemCursor]);

  // Position and animation of cursor
  useEffect(() => {
    // Handler for calculating current system cursor position
    const handleMouseMove = (e: MouseEvent) => {
      targetPosition.current = { x: e.clientX, y: e.clientY };
    };

    // Recursive function for animating each cursor layer
    const animate = () => {
      if (!cursorRef.current) return;

      const children = cursorRef.current.children;

      layers.forEach((layer, i) => {
        const pos = layerPosisitions.current[i];
        const lerp = (layer.delay ?? defaultSvgOptions.delay) + 1;
        const size = layerSizes[i];

        // update position
        pos.x += ((targetPosition.current.x - pos.x) * 1) / lerp;
        pos.y += ((targetPosition.current.y - pos.y) * 1) / lerp;

        // apply transform directly to layer
        const layerEl = children[i] as HTMLElement;
        layerEl.style.transform = `translate3d(${pos.x - size.width / 2}px, ${
          pos.y - size.height / 2
        }px, 0)`; // use translate3d as it may be more likely to force GPU computation for performance (?)
      });

      // call next animation frame
      animationFrame.current = requestAnimationFrame(animate);
    };

    // bind the mousemove handler
    window.addEventListener("mousemove", handleMouseMove);
    // trigger the first animation frame
    animationFrame.current = requestAnimationFrame(animate);

    // remove effects on unmount
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    };
  }, [enable, layers]);

  // Don't render anything if cursor is disabled
  if (!enable) return null;

  // ReactiveCursor Component
  return (
    <div
      ref={cursorRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: zIndex,
        mixBlendMode: mixBlendMode,
      }}
    >
      {/* Render each layer in order, reducing z-index per layer */}
      {layers.map((layer, i) => {
        // Resolve the SVG component
        const SvgComponent = resolveSvg(layer.SVG);
        // Render the SVG cursor layer
        return (
          <SvgComponent
            key={`reactive-cursor-layer-${i}`}
            color={layer.fill || defaultSvgOptions.fill}
            stroke={layer.stroke || defaultSvgOptions.stroke}
            strokeWidth={layer.strokeSize || defaultSvgOptions.strokeSize}
            height={layer.size?.height || defaultSvgOptions.size.height}
            width={layer.size?.width || defaultSvgOptions.size.width}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              opacity: layer.opacity || defaultSvgOptions.opacity,
              zIndex: zIndex - i,
            }}
          />
        );
      })}
    </div>
  );
};

export default ReactiveCursor;
