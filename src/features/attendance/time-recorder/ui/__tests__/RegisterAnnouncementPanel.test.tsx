import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import RegisterAnnouncementPanel from "../RegisterAnnouncementPanel";

describe("RegisterAnnouncementPanel", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("管理者設定アナウンスをアナウンスカードとして表示する", () => {
    render(
      <MemoryRouter>
        <RegisterAnnouncementPanel
          configId="cfg-1"
          announcement={{ enabled: true, message: "連絡事項です" }}
        />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("register-dashboard-panel")).toBeInTheDocument();
    expect(
      screen.getByTestId("register-dashboard-announcement-card"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "アナウンス" }),
    ).toBeInTheDocument();
    expect(screen.getByText("連絡事項です")).toBeInTheDocument();
  });

  it("無効または空メッセージのアナウンスは表示しない", () => {
    render(
      <MemoryRouter>
        <RegisterAnnouncementPanel
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
        <RegisterAnnouncementPanel
          configId="cfg-1"
          announcement={{ enabled: true, message: "   " }}
        />
      </MemoryRouter>,
    );

    expect(
      screen.queryByTestId("register-dashboard-announcement-card"),
    ).not.toBeInTheDocument();
  });

  it("dismiss済みのアナウンスは再表示しない", () => {
    localStorage.setItem(
      "timeRecorderAnnouncementDismissed:cfg-1:連絡事項です",
      "1",
    );

    render(
      <MemoryRouter>
        <RegisterAnnouncementPanel
          configId="cfg-1"
          announcement={{ enabled: true, message: "連絡事項です" }}
        />
      </MemoryRouter>,
    );

    expect(
      screen.queryByTestId("register-dashboard-announcement-card"),
    ).not.toBeInTheDocument();
  });

  it("表示時は先頭カードとして固定表示される", () => {
    render(
      <MemoryRouter>
        <RegisterAnnouncementPanel
          announcement={{ enabled: true, message: "連絡事項です" }}
        />
      </MemoryRouter>,
    );

    const panel = screen.getByTestId("register-dashboard-panel");
    const firstCard = panel.firstElementChild as HTMLElement | null;
    expect(firstCard).toBe(
      screen.getByTestId("register-dashboard-announcement-card"),
    );
    expect(
      screen.getByTestId("register-dashboard-announcement-card"),
    ).toHaveClass("sticky", "top-4");
  });
});
