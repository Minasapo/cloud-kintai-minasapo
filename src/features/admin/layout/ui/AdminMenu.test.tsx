import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import { ADMIN_HEADER_MENU_ITEMS } from "@/features/admin/layout/model/useHeaderMenu";
import AdminMenu from "@/features/admin/layout/ui/AdminMenu";

describe("AdminMenu", () => {
  it("カテゴリ見出しを表示する", () => {
    render(
      <MemoryRouter>
        <AdminMenu
          items={ADMIN_HEADER_MENU_ITEMS}
          selectedHref="/admin"
          onSelect={jest.fn()}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText("CORE")).toBeInTheDocument();
    expect(screen.getByText("OPERATIONS")).toBeInTheDocument();
    expect(screen.getByText("GOVERNANCE")).toBeInTheDocument();
  });

  it("メニュークリックで onSelect が呼ばれる", async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();

    render(
      <MemoryRouter>
        <AdminMenu
          items={ADMIN_HEADER_MENU_ITEMS}
          selectedHref="/admin"
          onSelect={onSelect}
        />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("link", { name: /勤怠 Attendance/i }));

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ href: "/admin/attendances" }),
    );
  });
});
