import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

import AdminShiftSettings from "./AdminShiftSettings";

jest.mock("@/app/hooks", () => ({
  useAppDispatchV2: () => jest.fn(),
}));

jest.mock("@/features/admin-config-shift/useAdminShiftSettings", () => ({
  useAdminShiftSettings: jest.fn(() => ({
    control: {},
    fields: [],
    validationDetails: [],
    hasValidationError: false,
    savingShiftGroup: false,
    savingShiftDisplay: false,
    isDirty: false,
    isBusy: false,
    shiftDefaultMode: "normal",
    setShiftDefaultMode: jest.fn(),
    handleAddGroup: jest.fn(),
    handleRemoveGroup: jest.fn(),
    handleSaveShiftGroup: jest.fn(),
    handleSaveShiftDisplay: jest.fn(),
  })),
}));

describe("AdminShiftSettings", () => {
  const renderWithRouter = (ui: React.ReactElement) => {
    const router = createMemoryRouter(
      [
        {
          path: "/",
          element: ui,
        },
      ],
      { initialEntries: ["/"] },
    );

    return render(<RouterProvider router={router} />);
  };

  it("switches between shift group and shift display tabs", async () => {
    const user = userEvent.setup();
    const shiftGroupTab = "シフトグループ";
    const shiftDisplayTab = "シフト表示";

    renderWithRouter(<AdminShiftSettings />);

    const shiftGroupTabElement = screen.getByRole("tab", {
      name: shiftGroupTab,
    });
    const shiftDisplayTabElement = screen.getByRole("tab", {
      name: shiftDisplayTab,
    });

    expect(shiftGroupTabElement).toHaveAttribute("aria-selected", "true");
    expect(shiftGroupTabElement).toHaveAttribute(
      "aria-controls",
      "admin-shift-settings-panel-shift-group",
    );
    expect(shiftDisplayTabElement).toHaveAttribute(
      "aria-controls",
      "admin-shift-settings-panel-shift-display",
    );
    expect(
      screen.getByRole("tabpanel", { name: shiftGroupTab }),
    ).toHaveAttribute("id", "admin-shift-settings-panel-shift-group");
    expect(
      screen.getByRole("heading", { name: shiftGroupTab }),
    ).toBeInTheDocument();

    await user.click(shiftDisplayTabElement);

    expect(shiftDisplayTabElement).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("表示モード")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "共同編集モード" }),
    ).toBeEnabled();
  });

  it("moves focus and selection with arrow keys in tablist", async () => {
    const user = userEvent.setup();
    renderWithRouter(<AdminShiftSettings />);

    const shiftGroupTab = screen.getByRole("tab", { name: "シフトグループ" });
    const shiftDisplayTab = screen.getByRole("tab", { name: "シフト表示" });

    shiftGroupTab.focus();
    await user.keyboard("{ArrowRight}");

    expect(shiftDisplayTab).toHaveFocus();
    expect(shiftDisplayTab).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{ArrowLeft}");
    expect(shiftGroupTab).toHaveFocus();
    expect(shiftGroupTab).toHaveAttribute("aria-selected", "true");
  });
});
