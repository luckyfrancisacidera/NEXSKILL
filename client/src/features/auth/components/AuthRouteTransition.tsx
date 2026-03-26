import { useEffect, useState, type PropsWithChildren } from "react";

import { cn } from "@shared/utils/cn";

export const AuthRouteTransition = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setIsVisible(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className={cn(
        "transition-all duration-300 ease-out motion-reduce:transition-none",
        isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-2 opacity-0",
        className,
      )}
    >
      {children}
    </div>
  );
};
