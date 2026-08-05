import { Attendance } from "@shared/api/graphql/types";

import { getWorkStatus, WorkStatusCodes, WorkStatusTexts } from "../workStatus";

describe("getWorkStatus", () => {
  const baseAttendance: Attendance = {
    __typename: "Attendance",
    id: "att-1",
    staffId: "staff-1",
    workDate: "2024-01-01",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  };

  it("attendance が null または undefined の場合、BEFORE_WORK を返すこと", () => {
    expect(getWorkStatus(null)).toEqual({
      code: WorkStatusCodes.BEFORE_WORK,
      text: WorkStatusTexts.BEFORE_WORK,
    });
    expect(getWorkStatus(undefined)).toEqual({
      code: WorkStatusCodes.BEFORE_WORK,
      text: WorkStatusTexts.BEFORE_WORK,
    });
  });

  it("startTime と endTime が両方設定されている場合、LEFT_WORK を返すこと", () => {
    const attendance = {
      ...baseAttendance,
      startTime: "09:00",
      endTime: "18:00",
    };

    expect(getWorkStatus(attendance)).toEqual({
      code: WorkStatusCodes.LEFT_WORK,
      text: WorkStatusTexts.LEFT_WORK,
    });
  });

  it("最後の rest に startTime があり endTime がない場合、RESTING を返すこと", () => {
    const attendance = {
      ...baseAttendance,
      startTime: "09:00",
      rests: [
        { __typename: "Rest" as const, startTime: "12:00", endTime: "13:00" },
        { __typename: "Rest" as const, startTime: "15:00", endTime: null },
      ],
    };

    expect(getWorkStatus(attendance)).toEqual({
      code: WorkStatusCodes.RESTING,
      text: WorkStatusTexts.RESTING,
    });
  });

  it("startTime があり endTime がない場合、WORKING を返すこと", () => {
    const attendance = {
      ...baseAttendance,
      startTime: "09:00",
      endTime: undefined,
    };

    expect(getWorkStatus(attendance)).toEqual({
      code: WorkStatusCodes.WORKING,
      text: WorkStatusTexts.WORKING,
    });
  });

  it("attendance が存在しても startTime がない場合、BEFORE_WORK を返すこと", () => {
    const attendance = {
      ...baseAttendance,
      startTime: undefined,
    };

    expect(getWorkStatus(attendance)).toEqual({
      code: WorkStatusCodes.BEFORE_WORK,
      text: WorkStatusTexts.BEFORE_WORK,
    });
  });

  it("rest 状態判定時に null rests を除外すること", () => {
    const attendance = {
      ...baseAttendance,
      startTime: "09:00",
      rests: [
        null,
        { __typename: "Rest" as const, startTime: "12:00", endTime: null },
      ],
    };

    expect(getWorkStatus(attendance)).toEqual({
      code: WorkStatusCodes.RESTING,
      text: WorkStatusTexts.RESTING,
    });
  });
});
