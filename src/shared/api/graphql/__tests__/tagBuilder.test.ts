import { buildListAndItemTags } from "../tagBuilder";

describe("buildListAndItemTags", () => {
  const idExtractor = (item: { id?: string | null }) => item.id ?? "unknown";

  it("result が undefined の場合、LIST タグのみを返すこと", () => {
    expect(buildListAndItemTags("Staff", undefined, idExtractor)).toEqual([
      { type: "Staff", id: "LIST" },
    ]);
  });

  it("result が null の場合、LIST タグのみを返すこと", () => {
    expect(buildListAndItemTags("Staff", null, idExtractor)).toEqual([
      { type: "Staff", id: "LIST" },
    ]);
  });

  it("result が空配列の場合、LIST タグのみを返すこと", () => {
    expect(buildListAndItemTags("Staff", [], idExtractor)).toEqual([
      { type: "Staff", id: "LIST" },
    ]);
  });

  it("LIST タグに加えて item ごとのタグを返すこと", () => {
    const items = [{ id: "id-1" }, { id: "id-2" }];
    expect(buildListAndItemTags("Staff", items, idExtractor)).toEqual([
      { type: "Staff", id: "LIST" },
      { type: "Staff", id: "id-1" },
      { type: "Staff", id: "id-2" },
    ]);
  });

  it("id が undefined の場合、idExtractor のフォールバック値を使うこと", () => {
    const items = [{ id: undefined }, { id: "id-2" }];
    expect(buildListAndItemTags("Staff", items, idExtractor)).toEqual([
      { type: "Staff", id: "LIST" },
      { type: "Staff", id: "unknown" },
      { type: "Staff", id: "id-2" },
    ]);
  });

  it("返却オブジェクトの type に TagType 文字列を保持すること", () => {
    const result = buildListAndItemTags("Workflow", [{ id: "w-1" }], idExtractor);
    result.forEach((tag) => {
      expect(tag.type).toBe("Workflow");
    });
  });

  it("複数フィールドを組み合わせる custom idExtractor でも動作すること", () => {
    const items = [
      { staffId: "s1", year: 2024 },
      { staffId: "s2", year: 2024 },
    ];
    const extractor = (item: { staffId: string; year: number }) =>
      `${item.staffId}:${item.year}`;
    expect(buildListAndItemTags("Stats", items, extractor)).toEqual([
      { type: "Stats", id: "LIST" },
      { type: "Stats", id: "s1:2024" },
      { type: "Stats", id: "s2:2024" },
    ]);
  });
});
