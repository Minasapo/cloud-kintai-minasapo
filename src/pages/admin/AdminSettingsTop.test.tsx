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

    expect(screen.getByRole("heading", { name: "基本設定" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "勤務ルール" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "運用設定" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "外部連携・補助" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /集計対象月.*集計対象月を開く/i }),
    ).toHaveAttribute("href", "/admin/master/job_term");
    expect(
      screen.getByRole("link", { name: /勤務時間.*勤務時間を開く/i }),
    ).toHaveAttribute("href", "/admin/master/feature_management/working_time");
    expect(
      screen.getByRole("link", { name: /エクスポート.*エクスポートを開く/i }),
    ).toHaveAttribute("href", "/admin/master/export");
  });
});
