import { useEffect, useRef } from "react";

export type Props = {
  enable?: boolean; // to enable/disable the cursor entirely
};

const ReactiveCursor = ({
  enable = true,
}: Props) => {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {}, [enable]);

  if (!enable) return null;

  return (
    <div
      ref={cursorRef}
    >
      {/* TODO */}
    </div>
  );
};

export default ReactiveCursor;
