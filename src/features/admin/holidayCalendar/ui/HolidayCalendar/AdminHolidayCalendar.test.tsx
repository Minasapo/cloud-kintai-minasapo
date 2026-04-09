import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";

import AdminHolidayCalendar from "./AdminHolidayCalendar";

jest.mock("../CompanyHolidayCalendar/CompanyHolidayCalendarList", () => ({
  __esModule: true,
  default: () => <div>会社休日一覧</div>,
}));

jest.mock("../EventCalendar/EventCalendarList", () => ({
  __esModule: true,
  default: () => <div>イベント一覧</div>,
}));

jest.mock("./HolidayCalendarList", () => ({
  __esModule: true,
  default: () => <div>法定休日一覧</div>,
}));

function LocationDisplay() {
  const location = useLocation();

  return <div data-testid="location-search">{location.search}</div>;
}

function renderPage(initialEntry = "/admin/master/holiday_calendar") {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AdminHolidayCalendar />
      <LocationDisplay />
    </MemoryRouter>,
  );
}

describe("AdminHolidayCalendar", () => {
  it("search param に応じて初期タブを選択する", () => {
    renderPage("/admin/master/holiday_calendar?tab=company");

    expect(
      screen.getByRole("tab", { name: "会社休日" }),
    ).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("会社休日一覧");
  });

  it("タブクリックで表示内容と search param を更新する", () => {
    renderPage();

    fireEvent.click(screen.getByRole("tab", { name: "イベントカレンダー" }));

    expect(
      screen.getByRole("tab", { name: "イベントカレンダー" }),
    ).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("イベント一覧");
    expect(screen.getByTestId("location-search")).toHaveTextContent(
      "?tab=event",
    );
  });
});
