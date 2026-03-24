import { resolveActiveMenuHref } from "@/features/admin/layout/model/resolveActiveMenuHref";

const menuItems = [
  { href: "/admin" },
  { href: "/admin/attendances" },
  { href: "/admin/staff" },
  { href: "/admin/master" },
] as const;

describe("resolveActiveMenuHref", () => {
  it("`/admin` ではダッシュボードを選択する", () => {
    expect(
      resolveActiveMenuHref({
        currentPath: "/admin",
        menuItems,
      }),
    ).toBe("/admin");
  });

  it("`/admin/attendances/edit/...` では勤怠カテゴリを選択する", () => {
    expect(
      resolveActiveMenuHref({
        currentPath: "/admin/attendances/edit/2026-03-24/staff-001",
        menuItems,
      }),
    ).toBe("/admin/attendances");
  });

  it("スタッフ勤怠詳細パスでは勤怠カテゴリを優先する", () => {
    expect(
      resolveActiveMenuHref({
        currentPath: "/admin/staff/staff-001/attendance",
        menuItems,
      }),
    ).toBe("/admin/attendances");
  });
});
