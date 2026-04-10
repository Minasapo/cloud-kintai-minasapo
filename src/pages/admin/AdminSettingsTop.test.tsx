import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import AdminSettingsTop from "./AdminSettingsTop";

describe("AdminSettingsTop", () => {
  it("renders grouped settings cards", () => {
    render(
      <MemoryRouter>
        <AdminSettingsTop />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "基本" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "データ・連携" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /集計対象月.*集計対象月を開く/i }),
    ).toHaveAttribute("href", "/admin/master/job_term");
    expect(
      screen.getByRole("link", { name: /エクスポート.*エクスポートを開く/i }),
    ).toHaveAttribute("href", "/admin/master/export");
    expect(
      screen.queryByRole("link", { name: /シフト.*シフト設定を開く/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /ワークフロー.*ワークフロー管理を開く/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "勤務ルール" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /勤務時間.*勤務時間を開く/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "シフト・申請" }),
    ).not.toBeInTheDocument();
  });
});
