import "./DailyReportCalendar.scss";

import { type Dayjs } from "dayjs";
import { useEffect, useMemo, useState } from "react";

export type DailyReportCalendarProps = {
  value: Dayjs;
  reportedDateSet: Set<string>;
  onChange: (value: Dayjs | null) => void;
};

export function DailyReportCalendar({
  value,
  reportedDateSet,
  onChange,
}: DailyReportCalendarProps) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(max-width: 639px)").matches
      : false,
  );
  const [monthOffset, setMonthOffset] = useState(0);
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(max-width: 639px)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const weekLabels = ["日", "月", "火", "水", "木", "金", "土"];
  const resolvedDisplayMonth = value.startOf("month").add(monthOffset, "month");
  const resolvedWeekStart = value
    .startOf("day")
    .subtract(value.day(), "day")
    .add(weekOffset * 7, "day");
  const monthLabel =
    !isMobile
      ? resolvedDisplayMonth.format("YYYY年MM月")
      : `${resolvedWeekStart.format("M/D")} - ${resolvedWeekStart
          .add(6, "day")
          .format("M/D")}`;

  const calendarDays = useMemo(() => {
    if (isMobile) {
      return Array.from({ length: 7 }, (_, index) =>
        resolvedWeekStart.add(index, "day"),
      );
    }
    const firstDay = resolvedDisplayMonth.startOf("month");
    const gridStart = firstDay.subtract(firstDay.day(), "day");
    return Array.from({ length: 42 }, (_, index) => gridStart.add(index, "day"));
  }, [resolvedDisplayMonth, resolvedWeekStart, isMobile]);

  const handleSelectDay = (targetDay: Dayjs) => {
    setMonthOffset(0);
    setWeekOffset(0);
    onChange(targetDay.startOf("day"));
  };

  return (
    <div className="dr-calendar-card">
      <div className="dr-calendar-card-body">
        <div className="dr-calendar" role="group" aria-label="日報カレンダー">
          <div className="dr-calendar-header">
            <button
              type="button"
              className="dr-calendar-nav"
              onClick={() => {
                if (!isMobile) {
                  setMonthOffset((current) => current - 1);
                  return;
                }
                setWeekOffset((current) => current - 1);
              }}
              aria-label="前月"
            >
              ‹
            </button>
            <p className="dr-calendar-header-label">{monthLabel}</p>
            <button
              type="button"
              className="dr-calendar-nav"
              onClick={() => {
                if (!isMobile) {
                  setMonthOffset((current) => current + 1);
                  return;
                }
                setWeekOffset((current) => current + 1);
              }}
              aria-label="翌月"
            >
              ›
            </button>
          </div>

          <div className="dr-calendar-weekdays">
            {weekLabels.map((label) => (
              <span key={label} className="dr-calendar-weekday">
                {label}
              </span>
            ))}
          </div>

          <div
            className={`dr-calendar-grid ${
              isMobile ? "dr-calendar-grid--week" : ""
            }`}
          >
            {calendarDays.map((day) => {
              const dateKey = day.format("YYYY-MM-DD");
              const isOutsideMonth =
                !isMobile && !day.isSame(resolvedDisplayMonth, "month");
              const isSelected = day.isSame(value, "day");
              const hasReport = reportedDateSet.has(dateKey);

              return (
                <button
                  key={dateKey}
                  type="button"
                  className={[
                    "dr-calendar-day",
                    isOutsideMonth ? "dr-calendar-day--outside" : "",
                    isSelected ? "dr-calendar-day--selected" : "",
                    hasReport ? "dr-calendar-day--reported" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => handleSelectDay(day)}
                  aria-pressed={isSelected}
                >
                  {day.date()}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
