import {
  Attendance,
  CloseDate,
  CompanyHolidayCalendar,
  HolidayCalendar,
  Staff,
} from "@shared/api/graphql/types";
import { Dayjs } from "dayjs";
import { createContext, ReactNode, useContext } from "react";
import { NavigateFunction } from "react-router-dom";

type AttendanceListContextValue = {
  attendances: Attendance[];
  staff: Staff | null | undefined;
  holidayCalendars: HolidayCalendar[];
  companyHolidayCalendars: CompanyHolidayCalendar[];
  navigate: NavigateFunction;
  closeDates: CloseDate[];
  closeDatesLoading: boolean;
  closeDatesError?: Error | null;
  currentMonth: Dayjs;
  onMonthChange: (nextMonth: Dayjs) => void;
};

const AttendanceListContext = createContext<AttendanceListContextValue | null>(
  null,
);

type AttendanceListProviderProps = {
  value: AttendanceListContextValue;
  children: ReactNode;
};

export function AttendanceListProvider({
  value,
  children,
}: AttendanceListProviderProps) {
  return (
    <AttendanceListContext.Provider value={value}>
      {children}
    </AttendanceListContext.Provider>
  );
}

export function useAttendanceListContext() {
  const context = useOptionalAttendanceListContext();
  if (!context) {
    throw new Error(
      "useAttendanceListContext must be used within AttendanceListProvider",
    );
  }
  return context;
}

export function useOptionalAttendanceListContext() {
  const context = useContext(AttendanceListContext);
  return context;
}
