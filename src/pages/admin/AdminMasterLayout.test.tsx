import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import AdminMasterLayout from "./AdminMasterLayout";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  Outlet: () => <div data-testid="outlet" />,
  useLocation: () => ({ pathname: "/admin/master/job_term" }),
  useNavigate: () => mockNavigate,
}));

describe("AdminMasterLayout", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it("renders a direct menu entry to feature management root", async () => {
    const user = userEvent.setup();

    render(<AdminMasterLayout />);

    await user.click(screen.getByRole("button", { name: "menu" }));

    expect(
      screen.getByRole("button", { name: "設定一覧" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "残業確認" }),
    ).toBeInTheDocument();
  });

  it("navigates to feature management root from the settings menu", async () => {
    const user = userEvent.setup();

    render(<AdminMasterLayout />);

    await user.click(screen.getByRole("button", { name: "menu" }));

    await user.click(screen.getByRole("button", { name: "設定一覧" }));

    expect(mockNavigate).toHaveBeenCalledWith(
      "/admin/master/feature_management",
    );
  });
});
