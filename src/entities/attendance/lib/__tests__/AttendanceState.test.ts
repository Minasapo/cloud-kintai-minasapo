import { Attendance, Staff } from "@shared/api/graphql/types";
import dayjs, { Dayjs } from "dayjs";

import { AttendanceState, AttendanceStatus } from "../AttendanceState";

describe("AttendanceState", () => {
  const setMockToday = (state: AttendanceState, date: string) => {
    (state as unknown as { today: Dayjs }).today = dayjs(date);
  };

  const baseStaff: Staff = {
    __typename: "Staff",
    id: "staff-1",
    cognitoUserId: "cognito-1",
    mailAddress: "staff@example.com",
    role: "staff",
    enabled: true,
    status: "active",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  };

  const baseAttendance: Attendance = {
    __typename: "Attendance",
    id: "attendance-1",
    staffId: baseStaff.id,
    workDate: "2024-01-01",
    startTime: "09:00",
    endTime: "18:00",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  };

  const buildState = (
    attendanceOverrides: Partial<Attendance> = {},
    staffOverrides: Partial<
      Staff & { attendanceManagementEnabled?: boolean | null }
    > = {},
  ) => {
    const staff: Staff = {
      ...baseStaff,
      workType: "weekday",
      ...(staffOverrides as Partial<Staff>),
    };

    const attendance: Attendance = {
      ...baseAttendance,
      ...attendanceOverrides,
    };

    return new AttendanceState(staff, attendance, [], []);
  };

  it("勤務日が当日の場合、None を返すこと", () => {
    const today = "2024-01-05";
    const state = buildState({ workDate: today });

    setMockToday(state, today);

    expect(state.get()).toBe(AttendanceStatus.None);
  });

  it("勤務日が当日かつ未完了の変更申請がある場合、Requesting を返すこと", () => {
    const today = "2024-01-05";
    const state = buildState({
      workDate: today,
      changeRequests: [
        {
          __typename: "AttendanceChangeRequest",
          completed: false,
        },
      ],
    });

    setMockToday(state, today);

    expect(state.get()).toBe(AttendanceStatus.Requesting);
  });

  it("勤怠管理が無効な場合、None を返すこと", () => {
    const state = buildState(
      {
        workDate: "2024-01-10",
        startTime: undefined,
      },
      { attendanceManagementEnabled: false },
    );

    setMockToday(state, "2024-02-01");

    expect(state.get()).toBe(AttendanceStatus.None);
  });

  it("勤怠管理フラグが null の場合、既存の判定ロジックを適用すること", () => {
    const state = buildState(
      {
        workDate: "2024-01-10",
        startTime: undefined,
      },
      { attendanceManagementEnabled: null },
    );

    setMockToday(state, "2024-02-01");

    expect(state.get()).toBe(AttendanceStatus.Error);
  });

  it("過去日の場合、平日エラー判定を維持すること", () => {
    const today = "2024-01-05";
    const pastDate = "2024-01-04";
    const state = buildState({ workDate: pastDate, startTime: undefined });

    setMockToday(state, today);

    expect(state.get()).toBe(AttendanceStatus.Error);
  });

  it("モックした UTC 日時がローカル変換後の勤務日と一致する場合、None を返すこと", () => {
    const workDate = "2024-01-02";
    const state = buildState({ workDate, startTime: undefined });

    // Mock today as 2024-01-01T15:00:00Z (~2024-01-02 00:00+ in many timezones)
    (state as unknown as { today: Dayjs }).today = dayjs(
      "2024-01-01T15:00:00Z",
    );

    // Current implementation compares formatted date strings; if they match, returns None
    expect(state.get()).toBe(AttendanceStatus.None);
  });

  it("スタッフの利用開始日が勤務日より後の場合、None を返すこと", () => {
    const state = buildState(
      { workDate: "2024-01-10" },
      { usageStartDate: "2024-02-01" },
    );

    setMockToday(state, "2024-02-10");

    expect(state.get()).toBe(AttendanceStatus.None);
  });

  it("paidHolidayFlag が true の場合、Ok を返すこと", () => {
    const state = buildState({ workDate: "2024-01-10", paidHolidayFlag: true });

    setMockToday(state, "2024-02-01");

    expect(state.get()).toBe(AttendanceStatus.Ok);
  });

  it("substituteHolidayDate が有効な日付の場合、Ok を返すこと", () => {
    const state = buildState({
      workDate: "2024-01-10",
      substituteHolidayDate: "2024-01-05",
    });

    setMockToday(state, "2024-02-01");

    expect(state.get()).toBe(AttendanceStatus.Ok);
  });

  it("未完了の変更申請がある場合、Requesting を返すこと", () => {
    const state = buildState({
      workDate: "2024-01-10",
      changeRequests: [
        {
          __typename: "AttendanceChangeRequest",
          completed: false,
        },
      ],
    });

    setMockToday(state, "2024-02-01");

    expect(state.get()).toBe(AttendanceStatus.Requesting);
  });

  it("完了済みの変更申請のみの場合、Ok を返すこと", () => {
    const state = buildState({
      workDate: "2024-01-10",
      changeRequests: [
        {
          __typename: "AttendanceChangeRequest",
          completed: true,
        },
      ],
    });

    setMockToday(state, "2024-02-01");

    expect(state.get()).toBe(AttendanceStatus.Ok);
  });

  it("週末で始業・終業時刻が未入力の場合、None を返すこと", () => {
    const state = buildState({
      workDate: "2024-01-06", // Saturday
      startTime: "",
      endTime: "",
    });

    setMockToday(state, "2024-01-10");

    expect(state.get()).toBe(AttendanceStatus.None);
  });

  it("週末で始業・終業時刻が入力済みの場合、Ok を返すこと", () => {
    const state = buildState({ workDate: "2024-01-07" }); // Sunday

    setMockToday(state, "2024-01-10");

    expect(state.get()).toBe(AttendanceStatus.Ok);
  });

  it("平日で startTime が未入力の場合、Error を返すこと", () => {
    const state = buildState({
      workDate: "2024-01-09",
      startTime: undefined,
      endTime: "18:00",
    });

    setMockToday(state, "2024-01-10");

    expect(state.get()).toBe(AttendanceStatus.Error);
  });

  it("平日で endTime が未入力の場合、Error を返すこと", () => {
    const state = buildState({
      workDate: "2024-01-09",
      startTime: "09:00",
      endTime: undefined,
    });

    setMockToday(state, "2024-01-10");

    expect(state.get()).toBe(AttendanceStatus.Error);
  });

  it("シフト勤務でみなし休日の場合、None を返すこと", () => {
    const state = buildState(
      {
        workDate: "2024-01-09",
        isDeemedHoliday: true,
      },
      { workType: "shift" },
    );

    setMockToday(state, "2024-01-10");

    expect(state.get()).toBe(AttendanceStatus.None);
  });

  it("シフト勤務の場合、週末でも平日扱いで判定すること", () => {
    const state = buildState(
      {
        workDate: "2024-01-06", // Saturday
        startTime: undefined,
      },
      { workType: "shift" },
    );

    setMockToday(state, "2024-01-10");

    expect(state.get()).toBe(AttendanceStatus.Error);
  });

  it("非シフト勤務で休日カレンダー登録がある場合、None を返すこと", () => {
    const state = new AttendanceState(
      { ...baseStaff, workType: "weekday" },
      { ...baseAttendance, workDate: "2024-01-10" },
      [
        {
          __typename: "HolidayCalendar",
          id: "h1",
          holidayDate: "2024-01-10",
          name: "祝日",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
        },
      ],
      [],
    );

    setMockToday(state, "2024-02-01");

    expect(state.get()).toBe(AttendanceStatus.None);
  });

  it("非シフト勤務で会社休日登録がある場合、None を返すこと", () => {
    const state = new AttendanceState(
      { ...baseStaff, workType: "weekday" },
      { ...baseAttendance, workDate: "2024-01-10" },
      [],
      [
        {
          __typename: "CompanyHolidayCalendar",
          id: "c1",
          holidayDate: "2024-01-10",
          name: "会社休日",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
        },
      ],
    );

    setMockToday(state, "2024-02-01");

    expect(state.get()).toBe(AttendanceStatus.None);
  });

  it("非シフト勤務では変更申請より休日判定を優先すること", () => {
    const state = new AttendanceState(
      { ...baseStaff, workType: "weekday" },
      {
        ...baseAttendance,
        workDate: "2024-02-11",
        changeRequests: [
          {
            __typename: "AttendanceChangeRequest",
            completed: false,
          },
        ],
      },
      [
        {
          __typename: "HolidayCalendar",
          id: "h1",
          holidayDate: "2024-02-11",
          name: "祝日",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
        },
      ],
      [],
    );

    setMockToday(state, "2024-03-01");

    expect(state.get()).toBe(AttendanceStatus.None);
  });

  it("substituteHolidayDate が不正かつ startTime が未入力の場合、Error を返すこと", () => {
    const state = buildState({
      workDate: "2024-03-05",
      substituteHolidayDate: "not-a-date",
      startTime: undefined,
    });

    setMockToday(state, "2024-03-06");

    expect(state.get()).toBe(AttendanceStatus.Error);
  });

  it("変更申請があっても利用開始日が勤務日より後の場合、None を返すこと", () => {
    const state = buildState(
      {
        workDate: "2024-04-01",
        changeRequests: [
          {
            __typename: "AttendanceChangeRequest",
            completed: false,
          },
        ],
      },
      { usageStartDate: "2024-05-01" },
    );

    setMockToday(state, "2024-05-10");

    expect(state.get()).toBe(AttendanceStatus.None);
  });

  it("シフト勤務で未完了の変更申請がある場合、遅刻・勤務判定より先に Requesting を返すこと", () => {
    const state = buildState(
      {
        workDate: "2024-06-10",
        startTime: undefined,
        changeRequests: [
          {
            __typename: "AttendanceChangeRequest",
            completed: false,
          },
        ],
      },
      { workType: "shift" },
    );

    setMockToday(state, "2024-06-20");

    expect(state.get()).toBe(AttendanceStatus.Requesting);
  });
});
