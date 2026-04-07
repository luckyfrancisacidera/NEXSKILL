import { useEffect, useRef } from "react";

export const useReveal = <T extends HTMLElement = HTMLDivElement>() => {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add("visible");
          observer.unobserve(element);
        }
      },
      { threshold: 0.12 },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return ref;
};
