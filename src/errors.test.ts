import {
  E02004,
  E14001,
  getMessageDefinition,
  MESSAGE_CATEGORY_ENTRIES,
  MESSAGE_DEFINITIONS,
  MESSAGE_TEXTS,
} from "./errors";

describe("errors catalog", () => {
  it("keeps the existing named exports mapped to the catalog messages", () => {
    expect(E14001).toBe("設定の保存に失敗しました(エラーコード: E14001)");
    expect(E02004).toBe(
      "同一日付に重複した勤怠データが存在します。データ統合をしてください。(エラーコード: E02004)",
    );
  });

  it("exposes a flat message definition map without duplicate codes", () => {
    const codes = Object.keys(MESSAGE_DEFINITIONS);

    expect(codes).toHaveLength(70);
    expect(new Set(codes).size).toBe(codes.length);
    expect(MESSAGE_TEXTS.E05008).toBe(
      "スタッフ情報の同期に失敗しました(エラーコード: E05008)",
    );
  });

  it("groups definitions by category and preserves notes for special cases", () => {
    const staffInfoCategory = MESSAGE_CATEGORY_ENTRIES.find(
      (entry) => entry.key === "staffInfo",
    );

    expect(staffInfoCategory?.label).toBe("スタッフ情報");
    expect(
      staffInfoCategory?.definitions.map((definition) => definition.code),
    ).toContain("E05008");

    const definition = getMessageDefinition("E05008");

    expect(definition.kind).toBe("error");
    expect(definition.category).toBe("staffInfo");
    expect(definition.note).toContain("ユーザーロール");
  });

  it("marks success codes separately from error codes", () => {
    expect(getMessageDefinition("S14001")).toMatchObject({
      code: "S14001",
      kind: "success",
      message: "設定が正常に作成されました",
    });
  });
});
