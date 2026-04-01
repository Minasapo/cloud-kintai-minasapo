import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import AdminMasterLayout from "./AdminMasterLayout";

const mockNavigate = jest.fn();
let pathname = "/admin/master/job_term";

jest.mock("react-router-dom", () => ({
  Outlet: () => <div data-testid="outlet" />,
  useLocation: () => ({ pathname }),
  useNavigate: () => mockNavigate,
}));

describe("AdminMasterLayout", () => {
  beforeEach(() => {
    pathname = "/admin/master/job_term";
    mockNavigate.mockReset();
  });

  it("renders grouped navigation sections", async () => {
    const user = userEvent.setup();

    render(<AdminMasterLayout />);

    await user.click(screen.getByRole("button", { name: "menu" }));
    const nav = screen.getByRole("navigation", { name: "設定ナビゲーション" });

    expect(screen.getByText("設定")).toBeInTheDocument();
    expect(within(nav).getByText("基本")).toBeInTheDocument();
    expect(within(nav).getByText("勤務ルール")).toBeInTheDocument();
    expect(within(nav).getByText("シフト・申請")).toBeInTheDocument();
    expect(within(nav).getByText("データ・連携")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^集計対象月/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^勤務時間/ }),
    ).toBeInTheDocument();
  });

  it("opens another category and navigates to a nested setting", async () => {
    const user = userEvent.setup();

    render(<AdminMasterLayout />);

    await user.click(screen.getByRole("button", { name: "menu" }));
    await user.click(screen.getByRole("button", { name: /^開発者/ }));

    expect(mockNavigate).toHaveBeenCalledWith("/admin/master/developer");
  });

  it("shows current setting context for detail pages", () => {
    pathname = "/admin/master/export";

    render(<AdminMasterLayout />);

    expect(screen.getByText("データ・連携")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "エクスポート" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "外部連携向けのエクスポート設定や出力内容を確認します。",
      ),
    ).toBeInTheDocument();
  });
});
