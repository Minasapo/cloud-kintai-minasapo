import { Dayjs } from "dayjs";
import {
  Dispatch,
  MouseEvent,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { SelectedDateMap, ShiftRequestDayStatus } from "./statusMapping";

type UseShiftCalendarSelectionParams = {
  dayKeyList: string[];
  days: Dayjs[];
  monthStart: Dayjs;
  isMobile: boolean;
  setSelectedDates: Dispatch<SetStateAction<SelectedDateMap>>;
};

export function useShiftCalendarSelection({
  dayKeyList,
  days,
  monthStart,
  isMobile,
  setSelectedDates,
}: UseShiftCalendarSelectionParams) {
  const [focusedDateKey, setFocusedDateKey] = useState<string | null>(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [rawSelectedRowKeys, setRawSelectedRowKeys] = useState<string[]>([]);
  const [selectionAnchorKey, setSelectionAnchorKey] = useState<string | null>(
    null,
  );
  const dayDetailRef = useRef<HTMLDivElement | null>(null);

  const selectedRowKeys = useMemo(
    () => rawSelectedRowKeys.filter((key) => dayKeyList.includes(key)),
    [dayKeyList, rawSelectedRowKeys],
  );

  const activeSelectionAnchorKey = useMemo(
    () =>
      selectionAnchorKey && dayKeyList.includes(selectionAnchorKey)
        ? selectionAnchorKey
        : null,
    [dayKeyList, selectionAnchorKey],
  );

  const activeFocusedDateKey = useMemo(() => {
    if (isSelectionMode) return null;
    if (!focusedDateKey || !dayKeyList.includes(focusedDateKey)) return null;
    return focusedDateKey;
  }, [dayKeyList, focusedDateKey, isSelectionMode]);

  const clearRowSelection = useCallback(() => {
    setRawSelectedRowKeys([]);
    setSelectionAnchorKey(null);
  }, []);

  const isAllRowsSelected =
    selectedRowKeys.length === dayKeyList.length && dayKeyList.length > 0;

  const toggleAllRowsSelection = useCallback(() => {
    if (isAllRowsSelected) {
      clearRowSelection();
      return;
    }

    setRawSelectedRowKeys([...dayKeyList]);
    setSelectionAnchorKey(dayKeyList[0] ?? null);
  }, [clearRowSelection, dayKeyList, isAllRowsSelected]);

  const extendSelectionRange = useCallback(
    (anchorKey: string, targetKey: string) => {
      const startIndex = dayKeyList.indexOf(anchorKey);
      const endIndex = dayKeyList.indexOf(targetKey);
      if (startIndex === -1 || endIndex === -1) return;

      const [from, to] =
        startIndex <= endIndex
          ? [startIndex, endIndex]
          : [endIndex, startIndex];
      const rangeKeys = dayKeyList.slice(from, to + 1);

      setRawSelectedRowKeys((prev) => {
        const merged = new Set(prev.filter((key) => dayKeyList.includes(key)));
        rangeKeys.forEach((rangeKey) => merged.add(rangeKey));
        return Array.from(merged);
      });
    },
    [dayKeyList],
  );

  const applyStatusToSelection = useCallback(
    (status: ShiftRequestDayStatus) => {
      if (selectedRowKeys.length === 0) return;

      setSelectedDates((prev) => {
        const next = { ...prev };
        selectedRowKeys.forEach((key) => {
          next[key] = { status };
        });
        return next;
      });
    },
    [selectedRowKeys, setSelectedDates],
  );

  const setStatusForDate = useCallback(
    (key: string, status: ShiftRequestDayStatus) => {
      setFocusedDateKey(key);
      setSelectedDates((prev) => ({
        ...prev,
        [key]: { status },
      }));
    },
    [setSelectedDates],
  );

  const clearDateSelection = useCallback(
    (key: string) => {
      setFocusedDateKey(key);
      setSelectedDates((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    [setSelectedDates],
  );

  const scrollToDayDetail = useCallback(() => {
    if (!isMobile) return;

    if (dayDetailRef.current) {
      dayDetailRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [isMobile]);

  const handleCalendarDayClick = useCallback(
    (dayValue: Dayjs, event?: MouseEvent<HTMLDivElement>) => {
      if (!dayValue.isSame(monthStart, "month")) return;

      const key = dayValue.format("YYYY-MM-DD");
      if (isSelectionMode) {
        if (!isMobile && event?.shiftKey && activeSelectionAnchorKey) {
          extendSelectionRange(activeSelectionAnchorKey, key);
        } else {
          setRawSelectedRowKeys((prev) => {
            const current = prev.filter((item) => dayKeyList.includes(item));
            return current.includes(key)
              ? current.filter((item) => item !== key)
              : [...current, key];
          });
        }
        setSelectionAnchorKey(key);
        return;
      }

      setFocusedDateKey(key);
    },
    [
      extendSelectionRange,
      activeSelectionAnchorKey,
      dayKeyList,
      isMobile,
      isSelectionMode,
      monthStart,
    ],
  );

  const handleWeekdayLabelClick = useCallback(
    (weekdayIndex: number) => {
      if (isMobile || !isSelectionMode) return;

      const columnKeys = days
        .filter((day) => day.day() === weekdayIndex)
        .map((day) => day.format("YYYY-MM-DD"));
      if (columnKeys.length === 0) return;

      let nextAnchor: string | null = activeSelectionAnchorKey;
      setRawSelectedRowKeys((prev) => {
        const prevSet = new Set(prev.filter((key) => dayKeyList.includes(key)));
        const isColumnAlreadySelected = columnKeys.every((key) =>
          prevSet.has(key),
        );

        if (isColumnAlreadySelected) {
          columnKeys.forEach((key) => prevSet.delete(key));
          if (
            activeSelectionAnchorKey &&
            columnKeys.includes(activeSelectionAnchorKey)
          ) {
            nextAnchor = null;
          }
        } else {
          columnKeys.forEach((key) => prevSet.add(key));
          nextAnchor = columnKeys[0] ?? null;
        }

        return dayKeyList.filter((key) => prevSet.has(key));
      });
      setSelectionAnchorKey(nextAnchor ?? null);
    },
    [activeSelectionAnchorKey, dayKeyList, days, isMobile, isSelectionMode],
  );

  useEffect(() => {
    if (!activeFocusedDateKey) return;
    scrollToDayDetail();
  }, [activeFocusedDateKey, scrollToDayDetail]);

  const hasRowSelection = selectedRowKeys.length > 0;

  useEffect(() => {
    if (!isSelectionMode || !hasRowSelection) return;
    scrollToDayDetail();
  }, [hasRowSelection, isSelectionMode, scrollToDayDetail]);

  return {
    dayDetailRef,
    focusedDateKey: activeFocusedDateKey,
    isSelectionMode,
    selectedRowKeys,
    hasRowSelection,
    canBulkSelectByWeekday: !isMobile && isSelectionMode,
    clearRowSelection,
    toggleAllRowsSelection,
    applyStatusToSelection,
    setStatusForDate,
    clearDateSelection,
    handleCalendarDayClick,
    handleWeekdayLabelClick,
    setIsSelectionMode: (checked: boolean) => {
      setIsSelectionMode(checked);
      setSelectionAnchorKey(null);
      if (checked) {
        setFocusedDateKey(null);
      }
    },
  };
}
