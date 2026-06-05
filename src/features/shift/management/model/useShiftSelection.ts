import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getShiftKeyState } from "../lib/selectionHighlight";

export type ShiftSelectableStaff = {
  id: string;
};

export type UseShiftSelectionArgs = {
  displayedStaffOrder: ShiftSelectableStaff[];
  dayKeyList: string[];
  staffIdToIndex: Map<string, number>;
};

export default function useShiftSelection({
  displayedStaffOrder,
  dayKeyList,
  staffIdToIndex,
}: UseShiftSelectionArgs) {
  const [selectedStaffIds, setSelectedStaffIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [selectedDayKeys, setSelectedDayKeys] = useState<Set<string>>(
    () => new Set(),
  );

  const lastStaffSelectionIndexRef = useRef<number | null>(null);
  const lastDaySelectionIndexRef = useRef<number | null>(null);

  const dayKeyToIndex = useMemo(() => {
    const map = new Map<string, number>();
    dayKeyList.forEach((key, index) => map.set(key, index));
    return map;
  }, [dayKeyList]);

  const updateSelectionSet = useCallback(
    (
      values: string[],
      shouldSelect: boolean,
      setter: typeof setSelectedStaffIds | typeof setSelectedDayKeys
    ) => {
      if (!values.length) return;
      setter((prev) => {
        const next = new Set(prev);
        values.forEach((value) => {
          if (shouldSelect) {
            next.add(value);
          } else {
            next.delete(value);
          }
        });
        return next;
      });
    },
    []
  );

  const handleStaffCheckboxChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, staffId: string) => {
      event.stopPropagation();
      const shouldSelect = event.target.checked;
      const staffIndex = staffIdToIndex.get(staffId);
      const isShiftSelection =
        staffIndex !== undefined &&
        lastStaffSelectionIndexRef.current !== null &&
        getShiftKeyState(event.nativeEvent);

      if (isShiftSelection) {
        const start = Math.min(
          staffIndex as number,
          lastStaffSelectionIndexRef.current as number
        );
        const end = Math.max(
          staffIndex as number,
          lastStaffSelectionIndexRef.current as number
        );
        const idsInRange = displayedStaffOrder
          .slice(start, end + 1)
          .map((staff) => staff.id);
        updateSelectionSet(idsInRange, shouldSelect, setSelectedStaffIds);
      } else {
        updateSelectionSet([staffId], shouldSelect, setSelectedStaffIds);
      }

      lastStaffSelectionIndexRef.current = staffIndex ?? null;
    },
    [displayedStaffOrder, staffIdToIndex, updateSelectionSet]
  );

  const handleDayCheckboxChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, dateKey: string) => {
      event.stopPropagation();
      const shouldSelect = event.target.checked;
      const dayIndex = dayKeyToIndex.get(dateKey);
      const isShiftSelection =
        dayIndex !== undefined &&
        lastDaySelectionIndexRef.current !== null &&
        getShiftKeyState(event.nativeEvent);

      if (isShiftSelection) {
        const start = Math.min(
          dayIndex as number,
          lastDaySelectionIndexRef.current as number
        );
        const end = Math.max(
          dayIndex as number,
          lastDaySelectionIndexRef.current as number
        );
        const keysInRange = dayKeyList.slice(start, end + 1);
        updateSelectionSet(keysInRange, shouldSelect, setSelectedDayKeys);
      } else {
        updateSelectionSet([dateKey], shouldSelect, setSelectedDayKeys);
      }

      lastDaySelectionIndexRef.current = dayIndex ?? null;
    },
    [dayKeyList, dayKeyToIndex, updateSelectionSet]
  );

  useEffect(() => {
    lastStaffSelectionIndexRef.current = null;
  }, [displayedStaffOrder]);

  useEffect(() => {
    lastDaySelectionIndexRef.current = null;
  }, [dayKeyList]);

  const visibleStaffIds = useMemo(
    () => new Set(displayedStaffOrder.map((staff) => staff.id)),
    [displayedStaffOrder],
  );
  const dayKeySet = useMemo(() => new Set(dayKeyList), [dayKeyList]);

  const prunedSelectedStaffIds = useMemo(() => {
    let changed = false;
    const next = new Set<string>();
    selectedStaffIds.forEach((id) => {
      if (visibleStaffIds.has(id) && staffIdToIndex.has(id)) {
        next.add(id);
      } else {
        changed = true;
      }
    });
    return changed ? next : selectedStaffIds;
  }, [selectedStaffIds, staffIdToIndex, visibleStaffIds]);

  const prunedSelectedDayKeys = useMemo(() => {
    let changed = false;
    const next = new Set<string>();
    selectedDayKeys.forEach((key) => {
      if (dayKeySet.has(key)) {
        next.add(key);
      } else {
        changed = true;
      }
    });
    return changed ? next : selectedDayKeys;
  }, [dayKeySet, selectedDayKeys]);

  const hasBulkSelection =
    prunedSelectedStaffIds.size > 0 && prunedSelectedDayKeys.size > 0;
  const selectedCellCount = useMemo(
    () => prunedSelectedStaffIds.size * prunedSelectedDayKeys.size,
    [prunedSelectedDayKeys, prunedSelectedStaffIds],
  );

  return {
    selectedStaffIds: prunedSelectedStaffIds,
    selectedDayKeys: prunedSelectedDayKeys,
    hasBulkSelection,
    selectedCellCount,
    handleStaffCheckboxChange,
    handleDayCheckboxChange,
  } as const;
}
