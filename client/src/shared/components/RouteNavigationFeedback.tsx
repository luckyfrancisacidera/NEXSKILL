import { useEffect, useState } from "react";
import { useNavigation } from "react-router-dom";
import { cn } from "@shared/utils/cn";

interface RouteNavigationFeedbackProps {
  className?: string;
}

export const RouteNavigationFeedback = ({
  className,
}: RouteNavigationFeedbackProps) => {
  const navigation = useNavigation();
  const isNavigating = navigation.state === "loading";
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isNavigating) {
      setIsVisible(false);
      return;
    }

    const timeout = window.setTimeout(() => {
      setIsVisible(true);
    }, 120);

    return () => window.clearTimeout(timeout);
  }, [isNavigating]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={cn("pointer-events-none fixed inset-x-0 top-0 z-[115] h-1", className)}>
      <div className="absolute inset-x-0 top-0 h-1 overflow-hidden bg-transparent">
        <div className="route-navigation-bar h-full w-1/3 rounded-full bg-zinc-900/85 dark:bg-zinc-100/90" />
      </div>
    </div>
  );
};
