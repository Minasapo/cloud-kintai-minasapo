import { resolveCurrentBusinessWorkDate } from "@entities/attendance/lib/businessDate";
import { useEffect, useState } from "react";

export function useWorkDateInterval(): string {
  const [currentWorkDate, setCurrentWorkDate] = useState(() =>
    resolveCurrentBusinessWorkDate(),
  );
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const nextWorkDate = resolveCurrentBusinessWorkDate();
      setCurrentWorkDate((prev) =>
        prev === nextWorkDate ? prev : nextWorkDate,
      );
    }, 30 * 1000);
    return () => {
      window.clearInterval(intervalId);
    };
  }, []);
  return currentWorkDate;
}
