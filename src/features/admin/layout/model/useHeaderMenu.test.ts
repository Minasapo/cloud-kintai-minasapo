import { ADMIN_HEADER_MENU_ITEMS } from "@features/admin/layout/model/useHeaderMenu";

describe("ADMIN_HEADER_MENU_ITEMS", () => {
  it("先頭にダッシュボードカテゴリを定義する", () => {
    expect(ADMIN_HEADER_MENU_ITEMS[0]).toMatchObject({
      primaryLabel: "ダッシュボード",
      secondaryLabel: "Overview",
      ctaLabel: "主要指標を確認",
      href: "/admin",
    });
  });

  it("ワークフローのラベルを表示する", () => {
    expect(ADMIN_HEADER_MENU_ITEMS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          primaryLabel: "ワークフロー",
          secondaryLabel: "Workflow",
          ctaLabel: "申請一覧を確認",
          href: "/admin/workflow",
        }),
      ]),
    );
  });

  it("すべてのカテゴリに secondaryLabel と ctaLabel が設定されている", () => {
    expect(
      ADMIN_HEADER_MENU_ITEMS.every(
        (item) =>
          typeof item.secondaryLabel === "string" &&
          item.secondaryLabel.length > 0 &&
          typeof item.ctaLabel === "string" &&
          item.ctaLabel.length > 0,
      ),
    ).toBe(true);
  });
});
