import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import RegisterDashboardPanel from "../RegisterDashboardPanel";

describe("RegisterDashboardPanel", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("管理者設定アナウンスをダッシュボードカードとして表示する", () => {
    render(
      <MemoryRouter>
        <RegisterDashboardPanel
          configId="cfg-1"
          announcement={{ enabled: true, message: "連絡事項です" }}
        />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("register-dashboard-panel")).toBeInTheDocument();
    expect(
      screen.getByTestId("register-dashboard-announcement-card"),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "アナウンス" })).toBeInTheDocument();
    expect(screen.getByText("連絡事項です")).toBeInTheDocument();
  });

  it("無効または空メッセージのアナウンスは表示しない", () => {
    render(
      <MemoryRouter>
        <RegisterDashboardPanel
          configId="cfg-1"
          announcement={{ enabled: false, message: "連絡事項です" }}
        />
      </MemoryRouter>,
    );

    expect(
      screen.queryByTestId("register-dashboard-announcement-card"),
    ).not.toBeInTheDocument();

    render(
      <MemoryRouter>
        <RegisterDashboardPanel
          configId="cfg-1"
          announcement={{ enabled: true, message: "   " }}
        />
      </MemoryRouter>,
    );

    expect(
      screen.queryByTestId("register-dashboard-announcement-card"),
    ).not.toBeInTheDocument();
  });

  it("アナウンスを閉じるとlocalStorageに保存され再表示しない", () => {
    const { rerender } = render(
      <MemoryRouter>
        <RegisterDashboardPanel
          configId="cfg-1"
          announcement={{ enabled: true, message: "連絡事項です" }}
        />
      </MemoryRouter>,
    );

    fireEvent.click(
      screen.getByTestId("register-dashboard-announcement-close-button"),
    );

    expect(
      localStorage.getItem("timeRecorderAnnouncementDismissed:cfg-1:連絡事項です"),
    ).toBe("1");
    expect(
      screen.queryByTestId("register-dashboard-announcement-card"),
    ).not.toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <RegisterDashboardPanel
          configId="cfg-1"
          announcement={{ enabled: true, message: "連絡事項です" }}
        />
      </MemoryRouter>,
    );

    expect(
      screen.queryByTestId("register-dashboard-announcement-card"),
    ).not.toBeInTheDocument();
  });

  it("アナウンスが表示されると先頭に固定表示される", () => {
    render(
      <MemoryRouter>
        <RegisterDashboardPanel
          announcement={{ enabled: true, message: "連絡事項です" }}
        />
      </MemoryRouter>,
    );

    const panel = screen.getByTestId("register-dashboard-panel");
    const firstCard = panel.firstElementChild as HTMLElement | null;
    expect(firstCard).toBe(screen.getByTestId("register-dashboard-announcement-card"));
    expect(screen.getByTestId("register-dashboard-announcement-card")).toHaveClass(
      "sticky",
      "top-4",
    );
  });
});
