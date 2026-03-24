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

  it("renders feature management menu entries", async () => {
    const user = userEvent.setup();

    render(<AdminMasterLayout />);

    await user.click(screen.getByRole("button", { name: "menu" }));

    expect(screen.getByRole("button", { name: "勤怠" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "残業確認" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "開発者" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "エクスポート" })).toBeInTheDocument();
  });

  it("navigates to developer settings from the attendance menu", async () => {
    const user = userEvent.setup();

    render(<AdminMasterLayout />);

    await user.click(screen.getByRole("button", { name: "menu" }));

    await user.click(screen.getByRole("button", { name: "開発者" }));

    expect(mockNavigate).toHaveBeenCalledWith("/admin/master/developer");
  });

  it("navigates to schema export settings", async () => {
    const user = userEvent.setup();

    render(<AdminMasterLayout />);

    await user.click(screen.getByRole("button", { name: "menu" }));
    await user.click(screen.getByRole("button", { name: "エクスポート" }));

    expect(mockNavigate).toHaveBeenCalledWith("/admin/master/export");
  });
});
