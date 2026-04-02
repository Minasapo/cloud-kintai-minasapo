import { render, screen } from "@testing-library/react";

import AdminMasterLayout from "./AdminMasterLayout";

let pathname = "/admin/master/job_term";

jest.mock("react-router-dom", () => ({
  Outlet: () => <div data-testid="outlet" />,
  useLocation: () => ({ pathname }),
}));

describe("AdminMasterLayout", () => {
  beforeEach(() => {
    pathname = "/admin/master/job_term";
  });

  it("renders the settings content area with outlet", () => {
    render(<AdminMasterLayout />);

    expect(screen.getByTestId("outlet")).toBeInTheDocument();
  });

  it("shows current setting context header for detail pages", () => {
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

  it("shows generic settings header when path has no matching item", () => {
    pathname = "/admin/master";

    render(<AdminMasterLayout />);

    expect(screen.getByRole("heading", { name: "設定" })).toBeInTheDocument();
  });
});
