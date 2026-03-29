import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
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
    <div className={cn("pointer-events-none fixed inset-0 z-[115]", className)}>
      <div className="absolute inset-x-0 top-0 h-1 overflow-hidden bg-transparent">
        <div className="route-navigation-bar h-full w-1/3 rounded-full bg-zinc-900/85 dark:bg-zinc-100/90" />
      </div>
      <div className="absolute inset-0 bg-zinc-950/10 backdrop-blur-[1px] dark:bg-zinc-950/20" />
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div className="inline-flex items-center gap-3 rounded-full border border-zinc-200 bg-white/94 px-4 py-2 text-sm font-medium text-zinc-700 shadow-lg dark:border-zinc-700 dark:bg-zinc-950/92 dark:text-zinc-200">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Loading page
        </div>
      </div>
    </div>
  );
};
