import { getGroupCoveragePresentation } from "../shiftGroups";

describe("getGroupCoveragePresentation", () => {
  describe("fixed constraint", () => {
    it("実績値が固定値と同じ場合、違反なしを返すこと", () => {
      const result = getGroupCoveragePresentation(3, { min: null, max: null, fixed: 3 });
      expect(result.violationTone).toBeNull();
      expect(result.violationReason).toBeNull();
      expect(result.primaryColor).toBe("text.primary");
    });

    it("実績値が固定値を下回る場合、error を返すこと", () => {
      const result = getGroupCoveragePresentation(2, { min: null, max: null, fixed: 3 });
      expect(result.violationTone).toBe("error");
      expect(result.primaryColor).toBe("error.main");
      expect(result.violationReason).toContain("3名");
    });

    it("実績値が固定値を上回る場合、warning を返すこと", () => {
      const result = getGroupCoveragePresentation(4, { min: null, max: null, fixed: 3 });
      expect(result.violationTone).toBe("warning");
      expect(result.primaryColor).toBe("warning.main");
      expect(result.violationReason).toContain("3名");
    });
  });

  describe("min/max constraint", () => {
    it("実績値が min/max 範囲内の場合、違反なしを返すこと", () => {
      const result = getGroupCoveragePresentation(3, { min: 2, max: 5, fixed: null });
      expect(result.violationTone).toBeNull();
      expect(result.violationReason).toBeNull();
    });

    it("実績値が min 未満の場合、error を返すこと", () => {
      const result = getGroupCoveragePresentation(1, { min: 2, max: 5, fixed: null });
      expect(result.violationTone).toBe("error");
      expect(result.violationReason).toContain("2名以上");
    });

    it("実績値が max を超える場合、warning を返すこと", () => {
      const result = getGroupCoveragePresentation(6, { min: 2, max: 5, fixed: null });
      expect(result.violationTone).toBe("warning");
      expect(result.violationReason).toContain("5名以下");
    });

    it("実績値が min と同じ場合、違反なしを返すこと", () => {
      const result = getGroupCoveragePresentation(2, { min: 2, max: 5, fixed: null });
      expect(result.violationTone).toBeNull();
    });

    it("実績値が max と同じ場合、違反なしを返すこと", () => {
      const result = getGroupCoveragePresentation(5, { min: 2, max: 5, fixed: null });
      expect(result.violationTone).toBeNull();
    });
  });

  describe("no constraints", () => {
    it("すべての制約が null の場合、違反なしを返すこと", () => {
      const result = getGroupCoveragePresentation(5, { min: null, max: null, fixed: null });
      expect(result.violationTone).toBeNull();
      expect(result.violationReason).toBeNull();
      expect(result.primaryColor).toBe("text.primary");
    });
  });

  describe("primary display", () => {
    it("実績値を文字列で表示すること", () => {
      const result = getGroupCoveragePresentation(7, { min: null, max: null, fixed: null });
      expect(result.primary).toBe("7");
    });
  });
});
