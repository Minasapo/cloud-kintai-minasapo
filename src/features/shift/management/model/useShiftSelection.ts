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
    () => new Set()
  );
  const [selectedDayKeys, setSelectedDayKeys] = useState<Set<string>>(
    () => new Set()
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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedStaffIds((prev) => {
      let changed = false;
      const next = new Set<string>();
      prev.forEach((id) => {
        if (staffIdToIndex.has(id)) {
          next.add(id);
        } else {
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [staffIdToIndex]);

  useEffect(() => {
    const dayKeySet = new Set(dayKeyList);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedDayKeys((prev) => {
      let changed = false;
      const next = new Set<string>();
      prev.forEach((key) => {
        if (dayKeySet.has(key)) {
          next.add(key);
        } else {
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [dayKeyList]);

  const hasBulkSelection =
    selectedStaffIds.size > 0 && selectedDayKeys.size > 0;
  const selectedCellCount = useMemo(
    () => selectedStaffIds.size * selectedDayKeys.size,
    [selectedStaffIds, selectedDayKeys]
  );

  return {
    selectedStaffIds,
    selectedDayKeys,
    hasBulkSelection,
    selectedCellCount,
    handleStaffCheckboxChange,
    handleDayCheckboxChange,
  } as const;
}
