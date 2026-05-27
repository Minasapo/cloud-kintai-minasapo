import { getOperationLogLabel } from "../operationLogLabels";

describe("getOperationLogLabel", () => {
  it("既知の action コードに対応するラベルを返すこと", () => {
    expect(getOperationLogLabel("attendance.create")).toBe("勤怠作成");
  });

  it("レガシーコードに対応するラベルを返すこと", () => {
    expect(getOperationLogLabel("clock_in")).toBe("出勤");
  });

  it("未知のコードは入力をそのまま返すこと", () => {
    expect(getOperationLogLabel("unknown.action")).toBe("unknown.action");
  });

  it.each([undefined, null, ""])("%s の場合は '-' を返すこと", (input) => {
    expect(getOperationLogLabel(input)).toBe("-");
  });
});
