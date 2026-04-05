import { useEffect, useState } from "react";

const getInitialMatch = (query: string) => {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia(query).matches;
};

// Use to mirror a CSS media query inside React state.
export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(() => getInitialMatch(query));

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const mediaQuery = window.matchMedia(query);
    const updateMatches = () => setMatches(mediaQuery.matches);

    updateMatches();
    mediaQuery.addEventListener("change", updateMatches);

    return () => {
      mediaQuery.removeEventListener("change", updateMatches);
    };
  }, [query]);

  return matches;
};
