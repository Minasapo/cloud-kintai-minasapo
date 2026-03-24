import { ADMIN_HEADER_MENU_ITEMS } from "@/features/admin/layout/model/useHeaderMenu";

describe("ADMIN_HEADER_MENU_ITEMS", () => {
  it("先頭にダッシュボードカテゴリを定義する", () => {
    expect(ADMIN_HEADER_MENU_ITEMS[0]).toMatchObject({
      primaryLabel: "ダッシュボード",
      href: "/admin",
    });
  });
});
