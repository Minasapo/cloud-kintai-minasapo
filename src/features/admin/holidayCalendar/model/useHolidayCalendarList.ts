import dayjs from "dayjs";
import { ChangeEvent, useMemo, useState } from "react";

export function sortCalendar<
  T extends { holidayDate?: string; eventDate?: string },
>(a: T, b: T) {
  const dateA = a.holidayDate || a.eventDate || "";
  const dateB = b.holidayDate || b.eventDate || "";
  return dayjs(dateA).isBefore(dayjs(dateB)) ? 1 : -1;
}

type HolidayCalendarLike = {
  id?: string | null;
  holidayDate?: string;
  eventDate?: string;
  name?: string;
  createdAt?: string | null;
};

export function useHolidayCalendarList<T extends HolidayCalendarLike>(
  items: T[] | undefined,
  options?: {
    initialRowsPerPage?: number;
    yearRange?: number;
    yearOffset?: number;
  },
) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(
    options?.initialRowsPerPage ?? 20,
  );
  const [yearMonthFilter, setYearMonthFilter] = useState<string>("");
  const [nameFilter, setNameFilter] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<number | "">("");
  const [selectedMonth, setSelectedMonth] = useState<number | "">("");

  const YEAR_RANGE = options?.yearRange ?? 7;
  const YEAR_OFFSET = options?.yearOffset ?? 5;
  const currentYear = dayjs().year();
  const years = Array.from({ length: YEAR_RANGE }).map(
    (_, i) => currentYear - YEAR_OFFSET + i,
  );

  const normalizedItems = useMemo(() => items ?? [], [items]);

  const sorted = useMemo(
    () => normalizedItems.toSorted((a, b) => sortCalendar(a, b)),
    [normalizedItems],
  );

  const filtered = useMemo(() => {
    return sorted.filter((hc) => {
      const dateStr = hc.holidayDate || hc.eventDate || "";
      const date = dayjs(dateStr);

      // Support filtering by year+month, year only, or month only.
      if (selectedYear !== "" && selectedMonth !== "") {
        const mm = String(selectedMonth).padStart(2, "0");
        const ym = `${selectedYear}-${mm}`;
        if (date.format("YYYY-MM") !== ym) return false;
      } else if (selectedYear !== "") {
        if (date.year() !== Number(selectedYear)) return false;
      } else if (selectedMonth !== "") {
        if (date.month() + 1 !== Number(selectedMonth)) return false;
      }

      if (nameFilter) {
        const name = (hc.name || "").toString().toLowerCase();
        if (!name.includes(nameFilter.toLowerCase())) return false;
      }

      return true;
    });
  }, [nameFilter, selectedMonth, selectedYear, sorted]);

  const paginated = useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage],
  );

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const applyYearMonthFilter = (year: number | "", month: number | "") => {
    // mirror the selected values to the internal selected state
    setSelectedYear(year);
    setSelectedMonth(month);

    if (year !== "" && month !== "") {
      const mm = String(month).padStart(2, "0");
      setYearMonthFilter(`${year}-${mm}`);
    } else {
      // keep yearMonthFilter for backward compatibility but main filtering
      // uses selectedYear/selectedMonth above
      setYearMonthFilter("");
    }
    setPage(0);
  };

  const setNameFilterAndResetPage = (v: string) => {
    setNameFilter(v);
    setPage(0);
  };

  const clearFilters = () => {
    setSelectedYear("");
    setSelectedMonth("");
    setYearMonthFilter("");
    setNameFilter("");
    setPage(0);
  };

  return {
    page,
    rowsPerPage,
    years,
    selectedYear,
    selectedMonth,
    setSelectedYear,
    setSelectedMonth,
    nameFilter,
    setNameFilter: setNameFilterAndResetPage,
    yearMonthFilter,
    applyYearMonthFilter,
    filtered,
    paginated,
    handleChangePage,
    handleChangeRowsPerPage,
    clearFilters,
  };
}
