import { useCallback, useRef } from "react";

export const useDayCellFocus = () => {
  const cellRefs = useRef<Map<string, HTMLElement | null>>(new Map());

  const registerCellRef = useCallback(
    (cellId: string, element: HTMLElement | null) => {
      if (element instanceof HTMLElement) {
        cellRefs.current.set(cellId, element);
      } else {
        cellRefs.current.delete(cellId);
      }
    },
    [],
  );

  const focusCell = useCallback((cellId: string) => {
    setTimeout(() => {
      const cell = cellRefs.current.get(cellId);
      if (cell) {
        cell.click();
        cell.focus();
      }
    }, 0);
  }, []);

  return { registerCellRef, focusCell };
};
