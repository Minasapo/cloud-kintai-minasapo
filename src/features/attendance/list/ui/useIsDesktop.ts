import { useEffect, useState } from "react";

const DESKTOP_BREAKPOINT_PX = 768;

export function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined"
      ? window.innerWidth >= DESKTOP_BREAKPOINT_PX
      : true,
  );
  useEffect(() => {
    const handleResize = () =>
      setIsDesktop(window.innerWidth >= DESKTOP_BREAKPOINT_PX);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return isDesktop;
}
