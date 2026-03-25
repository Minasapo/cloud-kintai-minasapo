import { Attendance } from "@shared/api/graphql/types";
import { Dayjs } from "dayjs";
import { createContext, ReactNode, useContext } from "react";

import { AttendanceStatus } from "@/entities/attendance/lib/AttendanceState";

import { HolidayInfo, MonthTerm } from "./mobileCalendarUtils";

export type MobileCalendarUIContextValue = {
  currentMonth: Dayjs;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  monthlyTerms: MonthTerm[];
  selectedDate: string | null;
  selectedAttendance: Attendance | null;
  selectedDateStatus: AttendanceStatus;
  getHolidayInfo: (date: Dayjs) => HolidayInfo | null;
  onEditSelectedDate: () => void;
  onCloseSelectedDate: () => void;
};

const MobileCalendarUIContext =
  createContext<MobileCalendarUIContextValue | null>(null);

export const MobileCalendarUIProvider = ({
  children,
  value,
}: {
  children: ReactNode;
  value: MobileCalendarUIContextValue;
}) => (
  <MobileCalendarUIContext.Provider value={value}>
    {children}
  </MobileCalendarUIContext.Provider>
);

export const useMobileCalendarUI = () => {
  const context = useContext(MobileCalendarUIContext);
  if (!context) {
    throw new Error(
      "useMobileCalendarUI must be used within MobileCalendarUIProvider",
    );
  }
  return context;
};
