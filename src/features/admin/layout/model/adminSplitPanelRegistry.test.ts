import {
  ADMIN_SPLIT_PANEL_COMPONENTS,
  ADMIN_SPLIT_PANEL_OPTIONS,
} from "@/features/admin/layout/model/adminSplitPanelRegistry";

describe("adminSplitPanelRegistry", () => {
  it("分割パネルの選択肢とコンポーネントが1対1で対応している", () => {
    const optionValues = ADMIN_SPLIT_PANEL_OPTIONS.map(
      (option) => option.value,
    ).toSorted();
    const componentKeys = Object.keys(ADMIN_SPLIT_PANEL_COMPONENTS).toSorted();

    expect(optionValues).toEqual(componentKeys);
  });

  it("主要な管理画面ルートを分割パネル選択肢に含む", () => {
    expect(ADMIN_SPLIT_PANEL_OPTIONS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ route: "/admin/attendances" }),
        expect.objectContaining({ route: "/admin/daily-report" }),
        expect.objectContaining({ route: "/admin/staff" }),
        expect.objectContaining({ route: "/admin/shift" }),
      ]),
    );
  });
});
