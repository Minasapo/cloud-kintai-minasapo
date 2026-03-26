import { CSSProperties } from "react";

import { useMobileCalendarUI } from "./mobileCalendarContext";

const withAlpha = (color: string, opacity: number) =>
  `color-mix(in srgb, ${color} ${opacity * 100}%, transparent)`;

export const MobileCalendarHeader = () => {
  const { currentMonth, onPrevMonth, onNextMonth, onToday } =
    useMobileCalendarUI();

  return (
    <div className="mobile-calendar__header">
      <button
        type="button"
        className="mobile-calendar__icon-btn"
        onClick={onPrevMonth}
        aria-label="前月"
      >
        <span aria-hidden>‹</span>
      </button>
      <h2 className="mobile-calendar__month-title">
        {currentMonth.format("YYYY年M月")}
      </h2>
      <div className="mobile-calendar__header-actions">
        <button
          type="button"
          onClick={onToday}
          className="mobile-calendar__today-btn"
        >
          今日
        </button>
        <button
          type="button"
          className="mobile-calendar__icon-btn"
          onClick={onNextMonth}
          aria-label="次月"
        >
          <span aria-hidden>›</span>
        </button>
      </div>
    </div>
  );
};

export const MonthlyTermChips = () => {
  const { monthlyTerms } = useMobileCalendarUI();
  if (monthlyTerms.length === 0) return null;

  return (
    <div className="mobile-calendar__term-chips">
      {monthlyTerms.map((term, index) => (
        <span
          key={`${term.label}-${index}`}
          className="mobile-calendar__term-chip"
          style={
            {
              "--term-chip-bg": withAlpha(term.color, 0.1),
              "--term-chip-color": term.color,
              "--term-chip-border": withAlpha(term.color, 0.4),
            } as CSSProperties
          }
          title={term.label}
        >
          {term.label}
        </span>
      ))}
    </div>
  );
};
