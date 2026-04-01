import {
  formatOperationLogInlineValue,
  getOperationLogDisplaySummary,
  getOperationLogResourceDisplay,
} from "../operationLogDisplay";

describe("formatOperationLogInlineValue", () => {
  it("returns trimmed strings as-is", () => {
    expect(formatOperationLogInlineValue("  勤怠を更新  ")).toBe("勤怠を更新");
  });

  it("stringifies objects and arrays into one line", () => {
    expect(formatOperationLogInlineValue({ message: "object summary" })).toBe(
      '{"message":"object summary"}',
    );
    expect(formatOperationLogInlineValue(["a", 1, true])).toBe(
      '["a",1,true]',
    );
  });

  it("stringifies numbers and booleans", () => {
    expect(formatOperationLogInlineValue(123)).toBe("123");
    expect(formatOperationLogInlineValue(false)).toBe("false");
  });

  it("returns null for empty values", () => {
    expect(formatOperationLogInlineValue("   ")).toBeNull();
    expect(formatOperationLogInlineValue(null)).toBeNull();
    expect(formatOperationLogInlineValue(undefined)).toBeNull();
  });
});

describe("getOperationLogResourceDisplay", () => {
  it("prefers resourceKey and stringifies object values safely", () => {
    expect(
      getOperationLogResourceDisplay({
        resource: "attendance",
        resourceId: "attendance-1",
        resourceKey: { key: "attendance#attendance-1" },
      }),
    ).toBe('{"key":"attendance#attendance-1"}');
  });

  it("falls back to resource and resourceId when resourceKey is unavailable", () => {
    expect(
      getOperationLogResourceDisplay({
        resource: { name: "attendance" },
        resourceId: ["attendance-1"],
        resourceKey: null,
      }),
    ).toBe('{"name":"attendance"} ["attendance-1"]');
  });
});

describe("getOperationLogDisplaySummary", () => {
  it("returns string summary as-is", () => {
    expect(
      getOperationLogDisplaySummary({
        action: "attendance.update",
        details: null,
        summary: "勤怠を更新",
      }),
    ).toBe("勤怠を更新");
  });

  it("stringifies object summary into one line", () => {
    expect(
      getOperationLogDisplaySummary({
        action: "attendance.update",
        details: null,
        summary: {
          message: "object summary",
        },
      }),
    ).toBe('{"message":"object summary"}');
  });

  it("uses string details.summary when summary is unavailable", () => {
    expect(
      getOperationLogDisplaySummary({
        action: "attendance.request.submit",
        details: JSON.stringify({
          summary: "詳細のサマリー",
        }),
        summary: null,
      }),
    ).toBe("詳細のサマリー");
  });

  it("stringifies object details.summary when available", () => {
    expect(
      getOperationLogDisplaySummary({
        action: "attendance.request.submit",
        details: JSON.stringify({
          summary: {
            message: "details object summary",
          },
        }),
        summary: undefined,
      }),
    ).toBe('{"message":"details object summary"}');
  });

  it("stringifies primitive summary values", () => {
    expect(
      getOperationLogDisplaySummary({
        action: "attendance.clock_in",
        details: JSON.stringify({
          summary: 123,
        }),
        summary: false,
      }),
    ).toBe("false");
  });

  it("falls back to the action label when no summary is available", () => {
    expect(
      getOperationLogDisplaySummary({
        action: "attendance.clock_in",
        details: JSON.stringify({
          summary: null,
        }),
        summary: "   ",
      }),
    ).toBe("出勤");
  });
});
