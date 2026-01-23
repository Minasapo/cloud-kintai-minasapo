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

  it("returns BEFORE_WORK when attendance is null or undefined", () => {
    expect(getWorkStatus(null)).toEqual({
      code: WorkStatusCodes.BEFORE_WORK,
      text: WorkStatusTexts.BEFORE_WORK,
    });
    expect(getWorkStatus(undefined)).toEqual({
      code: WorkStatusCodes.BEFORE_WORK,
      text: WorkStatusTexts.BEFORE_WORK,
    });
  });

  it("returns LEFT_WORK when startTime and endTime are both set", () => {
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

  it("returns RESTING when last rest has startTime but no endTime", () => {
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

  it("returns WORKING when startTime is set but endTime is not", () => {
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

  it("returns BEFORE_WORK when attendance is present but no startTime", () => {
    const attendance = {
      ...baseAttendance,
      startTime: undefined,
    };

    expect(getWorkStatus(attendance)).toEqual({
      code: WorkStatusCodes.BEFORE_WORK,
      text: WorkStatusTexts.BEFORE_WORK,
    });
  });

  it("filters null rests when checking rest status", () => {
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
