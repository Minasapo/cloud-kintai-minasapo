import "./MobileCalendar.scss";

import { CSSProperties, ReactNode } from "react";

import { AttendanceStatus } from "@/entities/attendance/lib/AttendanceState";

type CalendarDayCellProps = {
  isCurrentMonth: boolean;
  hasError: boolean;
  status?: AttendanceStatus;
  isSelected?: boolean;
  termColor?: string;
  children: ReactNode;
  onClick?: () => void;
};

export const CalendarContainer = ({ children }: { children: ReactNode }) => (
  <div className="mobile-calendar">{children}</div>
);

export const DayOfWeekHeader = ({ children }: { children: ReactNode }) => (
  <div className="mobile-calendar__dow-header">{children}</div>
);

export const DayOfWeekCell = ({ children }: { children: ReactNode }) => (
  <p className="mobile-calendar__dow-cell">{children}</p>
);

export const CalendarGrid = ({ children }: { children: ReactNode }) => (
  <div className="mobile-calendar__grid">{children}</div>
);

export const CalendarDayCell = ({
  isCurrentMonth,
  hasError,
  status,
  isSelected,
  termColor,
  children,
  onClick,
}: CalendarDayCellProps) => {
  let backgroundColor = isCurrentMonth
    ? "var(--mui-palette-background-paper)"
    : "var(--mui-palette-grey-50)";
  let borderColor = "var(--mui-palette-divider)";
  let color = isCurrentMonth
    ? "var(--mui-palette-text-primary)"
    : "var(--mui-palette-text-secondary)";

  if (status === AttendanceStatus.Error || hasError) {
    color = "var(--mui-palette-error-dark)";
  } else if (status === AttendanceStatus.Late) {
    color = "var(--mui-palette-warning-dark)";
  } else if (status === AttendanceStatus.None && !isCurrentMonth) {
    backgroundColor = "var(--mui-palette-grey-200)";
    color = "var(--mui-palette-text-secondary)";
  }

  if (isSelected) {
    borderColor = "var(--mui-palette-primary-main)";
  }

  const classNames = ["mobile-calendar__day-cell"];
  if (isCurrentMonth) classNames.push("is-clickable");
  if (isSelected) classNames.push("is-selected");
  if (termColor) classNames.push("has-term");

  const style = {
    backgroundColor,
    borderColor,
    color,
    "--term-color": termColor ?? "transparent",
    "--day-hover-shadow": "0px 1px 3px rgba(0, 0, 0, 0.2)",
  } as CSSProperties;

  return (
    <button
      type="button"
      className={classNames.join(" ")}
      onClick={onClick}
      style={style}
      disabled={!isCurrentMonth}
    >
      {children}
    </button>
  );
};

export const DayNumber = ({ children }: { children: ReactNode }) => (
  <p className="mobile-calendar__day-number">{children}</p>
);

export const HolidayName = ({ children }: { children: ReactNode }) => (
  <p className="mobile-calendar__holiday-name">{children}</p>
);
