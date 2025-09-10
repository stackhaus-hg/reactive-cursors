import { useEffect, useRef } from "react";

export type Props = {
  enable?: boolean; // enable/disable the entire component
};

const ReactiveCursor = ({
  enable = true,
}: Props) => {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {}, [enable]);

  if (!enable) return null;

  return <div ref={cursorRef}>CURSOR</div>;
};

export default ReactiveCursor;
