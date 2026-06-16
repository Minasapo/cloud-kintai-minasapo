import { buildConfirmFieldRows } from "../duplicateConfirmFieldRows";

describe("duplicateConfirmFieldRows", () => {
  it("returns core labels in stable order", () => {
    const rows = buildConfirmFieldRows();
    const labels = rows.map((row) => row.label);

    expect(labels).toEqual([
      "対象日",
      "スタッフID",
      "出勤",
      "退勤",
      "直行",
      "直帰",
      "欠勤",
      "休憩",
      "時間有休",
      "備考",
      "有給",
      "特別休暇",
      "指定休日",
      "時間有休(時間)",
      "振替日",
      "変更申請",
      "改訂番号",
      "作成日時",
      "更新日時",
      "ID",
    ]);
  });

  it("formats missing values as fallback markers", () => {
    const rows = buildConfirmFieldRows();
    const record = {
      id: undefined,
      staffId: undefined,
      workDate: undefined,
      startTime: undefined,
      endTime: undefined,
      goDirectlyFlag: false,
      returnDirectlyFlag: false,
      absentFlag: false,
      rests: [],
      hourlyPaidHolidayTimes: [],
      remarks: "",
      paidHolidayFlag: false,
      specialHolidayFlag: false,
      isDeemedHoliday: false,
      hourlyPaidHolidayHours: undefined,
      substituteHolidayDate: undefined,
      changeRequests: [],
      revision: undefined,
      createdAt: undefined,
      updatedAt: undefined,
    };

    const values = rows.map((row) => row.value(record as never));

    expect(values).toContain("-");
    expect(values[0]).toBe("-");
    expect(values[1]).toBe("-");
  });

  it("formats array-like fields into readable strings", () => {
    const rows = buildConfirmFieldRows();
    const rowMap = new Map(rows.map((row) => [row.label, row]));
    const record = {
      rests: [
        {
          startTime: "2024-01-10T12:00:00.000Z",
          endTime: "2024-01-10T13:00:00.000Z",
        },
      ],
      hourlyPaidHolidayTimes: [
        {
          startTime: "2024-01-10T15:00:00.000Z",
          endTime: "2024-01-10T16:00:00.000Z",
        },
      ],
      changeRequests: [
        {
          startTime: "2024-01-10T09:00:00.000Z",
          endTime: "2024-01-10T18:00:00.000Z",
          completed: true,
        },
      ],
    };

    expect(rowMap.get("休憩")?.value(record as never)).toContain("-");
    expect(rowMap.get("時間有休")?.value(record as never)).toContain("-");
    expect(rowMap.get("変更申請")?.value(record as never)).toContain("#1");
  });
});
