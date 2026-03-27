import { useEffect, useState } from "react";

const COMPACT_MEDIA_QUERY = "(max-width: 767px)";

export default function useCompactLayout() {
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const mediaQuery = window.matchMedia(COMPACT_MEDIA_QUERY);
    const sync = (event?: MediaQueryListEvent) => {
      setIsCompact(event ? event.matches : mediaQuery.matches);
    };

    sync();
    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  return isCompact;
}
