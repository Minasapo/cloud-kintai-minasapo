import dayjs from "dayjs";
import { ChangeEvent, useState } from "react";

export function sortCalendar<T extends { holidayDate: string }>(a: T, b: T) {
  return dayjs(a.holidayDate).isBefore(dayjs(b.holidayDate)) ? 1 : -1;
}

export function useHolidayCalendarList<
  T extends { holidayDate: string; name?: string }
>(
  items: T[] | undefined,
  options?: {
    initialRowsPerPage?: number;
    yearRange?: number;
    yearOffset?: number;
  }
) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(
    options?.initialRowsPerPage ?? 20
  );
  const [yearMonthFilter, setYearMonthFilter] = useState<string>("");
  const [nameFilter, setNameFilter] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<number | "">("");
  const [selectedMonth, setSelectedMonth] = useState<number | "">("");

  const YEAR_RANGE = options?.yearRange ?? 7;
  const YEAR_OFFSET = options?.yearOffset ?? 5;
  const currentYear = dayjs().year();
  const years = Array.from({ length: YEAR_RANGE }).map(
    (_, i) => currentYear - YEAR_OFFSET + i
  );

  const sorted = [...(items || [])].sort((a, b) => sortCalendar(a, b));

  const filtered = sorted.filter((hc) => {
    const date = dayjs(hc.holidayDate);

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

  const paginated = filtered.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
