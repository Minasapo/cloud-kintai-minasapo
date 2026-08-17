import { useLazyListAttendancesByDateRangeQuery } from "@entities/attendance/api/attendanceApi";
import { useAttendanceDailyFetch } from "@features/attendance/daily-list/model/useAttendanceDailyFetch";
import { renderHook, waitFor } from "@testing-library/react";

jest.mock("@entities/attendance/api/attendanceApi", () => ({
  useLazyListAttendancesByDateRangeQuery: jest.fn(),
}));

const mockTrigger = jest.fn();

const makeAttendance = (overrides: Record<string, unknown> = {}) => ({
  id: "att-1",
  staffId: "staff-1",
  workDate: "2024-01-15",
  startTime: "2024-01-15T09:00:00.000Z",
  endTime: "2024-01-15T19:00:00.000Z",
  ...overrides,
});

const makeRow = (overrides: Record<string, unknown> = {}) => ({
  sub: "staff-1",
  givenName: "太郎",
  familyName: "山田",
  sortKey: "山田太郎",
  attendance: null,
  ...overrides,
});

const defaultParams = {
  attendanceDailyList: [],
  displayDateFormatted: "2024-01-15",
  staffNameMap: { "staff-1": "山田 太郎" },
  scheduledHour: 18,
  scheduledMinute: 0,
  duplicateAttendances: [],
  loading: false,
};

describe("useAttendanceDailyFetch", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (
      useLazyListAttendancesByDateRangeQuery as jest.Mock
    ).mockReturnValue([mockTrigger]);
    mockTrigger.mockReturnValue({
      unwrap: () => Promise.resolve([]),
    });
  });

  it("attendanceDailyList が空の場合、各マップを空で返すこと", () => {
    const { result } = renderHook(() =>
      useAttendanceDailyFetch(defaultParams),
    );

    expect(result.current.attendanceMap).toEqual({});
    expect(result.current.attendanceLoadingMap).toEqual({});
    expect(result.current.attendanceErrorMap).toEqual({});
  });

  it("attendanceDailyList の各スタッフに対して trigger を呼ぶこと", async () => {
    const rows = [makeRow()];
    renderHook(() =>
      useAttendanceDailyFetch({ ...defaultParams, attendanceDailyList: rows }),
    );

    await waitFor(() => expect(mockTrigger).toHaveBeenCalled());

    expect(mockTrigger).toHaveBeenCalledWith(
      expect.objectContaining({
        staffId: "staff-1",
        startDate: "2024-01-01",
        endDate: "2024-01-31",
      }),
    );
  });

  it("取得した勤怠を attendanceMap に格納すること", async () => {
    const attendance = makeAttendance();
    mockTrigger.mockReturnValue({
      unwrap: () => Promise.resolve([attendance]),
    });

    const rows = [makeRow()];
    const { result } = renderHook(() =>
      useAttendanceDailyFetch({ ...defaultParams, attendanceDailyList: rows }),
    );

    await waitFor(() =>
      expect(result.current.attendanceMap["staff-1"]).toHaveLength(1),
    );

    expect(result.current.attendanceMap["staff-1"][0].workDate).toBe(
      "2024-01-15",
    );
    expect(result.current.attendanceLoadingMap["staff-1"]).toBe(false);
  });

  it("取得に失敗した場合、error を設定すること", async () => {
    mockTrigger.mockReturnValue({
      unwrap: () => Promise.reject(new Error("API error")),
    });

    const rows = [makeRow()];
    const { result } = renderHook(() =>
      useAttendanceDailyFetch({ ...defaultParams, attendanceDailyList: rows }),
    );

    await waitFor(() =>
      expect(result.current.attendanceErrorMap["staff-1"]).toBeTruthy(),
    );

    expect(result.current.attendanceErrorMap["staff-1"]?.message).toBe(
      "API error",
    );
    expect(result.current.attendanceLoadingMap["staff-1"]).toBe(false);
  });

  it("エラーレスポンスの重複情報を処理すること", async () => {
    const dupError = {
      details: {
        duplicates: [
          {
            workDate: "2024-01-15",
            ids: ["att-1", "att-2"],
            staffId: "staff-1",
          },
        ],
      },
    };
    mockTrigger.mockReturnValue({
      unwrap: () => Promise.reject(dupError),
    });

    const rows = [makeRow()];
    const { result } = renderHook(() =>
      useAttendanceDailyFetch({ ...defaultParams, attendanceDailyList: rows }),
    );

    await waitFor(() =>
      expect(result.current.duplicateSummaryMap["staff-1"]).toBeDefined(),
    );

    expect(result.current.duplicateSummaryMap["staff-1"]).toHaveLength(1);
    expect(result.current.duplicateSummaryMap["staff-1"][0].workDate).toBe(
      "2024-01-15",
    );
  });

  it("sub が重複している場合、スタッフ取得を重複実行しないこと", async () => {
    const rows = [makeRow(), makeRow()]; // same sub "staff-1" twice
    renderHook(() =>
      useAttendanceDailyFetch({ ...defaultParams, attendanceDailyList: rows }),
    );

    await waitFor(() => expect(mockTrigger).toHaveBeenCalled());

    // Should only be called once due to Set deduplication
    expect(mockTrigger).toHaveBeenCalledTimes(1);
  });

  describe("getAttendanceForDisplayDate", () => {
    it("displayDate に一致する勤怠を attendanceMap から返すこと", async () => {
      const attendance = makeAttendance({ workDate: "2024-01-15" });
      mockTrigger.mockReturnValue({
        unwrap: () => Promise.resolve([attendance]),
      });

      const rows = [makeRow()];
      const { result } = renderHook(() =>
        useAttendanceDailyFetch({
          ...defaultParams,
          attendanceDailyList: rows,
        }),
      );

      await waitFor(() =>
        expect(result.current.attendanceMap["staff-1"]).toBeTruthy(),
      );

      const found = result.current.getAttendanceForDisplayDate(
        rows[0] as ReturnType<typeof makeRow>,
      );
      expect(found?.workDate).toBe("2024-01-15");
    });

    it("attendanceMap に一致がなく日付が一致する場合、row.attendance を返すこと", () => {
      const attendance = makeAttendance({ workDate: "2024-01-15" });
      const row = makeRow({ attendance });
      const list = [row];

      const { result } = renderHook(() =>
        useAttendanceDailyFetch({
          ...defaultParams,
          attendanceDailyList: list,
        }),
      );

      const found = result.current.getAttendanceForDisplayDate(
        row as ReturnType<typeof makeRow>,
      );
      expect(found?.workDate).toBe("2024-01-15");
    });

    it("row.attendance の日付が displayDate と一致しない場合、null を返すこと", () => {
      const attendance = makeAttendance({ workDate: "2024-01-10" });
      const row = makeRow({ attendance });
      const list = [row];

      const { result } = renderHook(() =>
        useAttendanceDailyFetch({
          ...defaultParams,
          displayDateFormatted: "2024-01-15",
          attendanceDailyList: list,
        }),
      );

      const found = result.current.getAttendanceForDisplayDate(
        row as ReturnType<typeof makeRow>,
      );
      expect(found).toBeNull();
    });

    it("row.attendance が null かつ map に一致がない場合、null を返すこと", () => {
      const row = makeRow({ attendance: null });
      const list = [row];

      const { result } = renderHook(() =>
        useAttendanceDailyFetch({
          ...defaultParams,
          displayDateFormatted: "2024-01-15",
          attendanceDailyList: list,
        }),
      );

      const found = result.current.getAttendanceForDisplayDate(
        row as ReturnType<typeof makeRow>,
      );
      expect(found).toBeNull();
    });
  });

  describe("overtimeMinutesMap", () => {
    it("終業時刻が所定終了時刻を超える場合、残業時間を計算すること", async () => {
      // scheduledHour=18:00, endTime=19:00 → 60 min overtime
      const attendance = makeAttendance({
        workDate: "2024-01-15",
        endTime: "2024-01-15T19:00:00.000Z",
      });
      mockTrigger.mockReturnValue({
        unwrap: () => Promise.resolve([attendance]),
      });

      const rows = [makeRow()];
      const { result } = renderHook(() =>
        useAttendanceDailyFetch({
          ...defaultParams,
          attendanceDailyList: rows,
          scheduledHour: 18,
          scheduledMinute: 0,
        }),
      );

      await waitFor(() =>
        expect(result.current.overtimeMinutesMap["staff-1"]).toBeDefined(),
      );

      expect(result.current.overtimeMinutesMap["staff-1"]).toBeGreaterThan(0);
    });

    it("終業時刻が所定終了時刻以前の場合、残業時間 0 を返すこと", async () => {
      // scheduledHour=18:00, endTime=17:00 local → 0 min overtime
      const attendance = makeAttendance({
        workDate: "2024-01-15",
        endTime: "2024-01-15T17:00:00",
      });
      mockTrigger.mockReturnValue({
        unwrap: () => Promise.resolve([attendance]),
      });

      const rows = [makeRow()];
      const { result } = renderHook(() =>
        useAttendanceDailyFetch({
          ...defaultParams,
          attendanceDailyList: rows,
          scheduledHour: 18,
          scheduledMinute: 0,
        }),
      );

      await waitFor(() =>
        expect(result.current.attendanceMap["staff-1"]).toBeTruthy(),
      );

      expect(result.current.overtimeMinutesMap["staff-1"]).toBe(0);
    });
  });

  describe("mergedDuplicateAttendances", () => {
    it("duplicateAttendances と summaryDuplicateList を横断して重複排除すること", async () => {
      const dupError = {
        details: {
          duplicates: [
            {
              workDate: "2024-01-15",
              ids: ["att-1", "att-2"],
              staffId: "staff-1",
            },
          ],
        },
      };
      mockTrigger.mockReturnValue({
        unwrap: () => Promise.reject(dupError),
      });

      const externalDup = {
        staffId: "staff-1",
        staffName: "山田 太郎",
        workDate: "2024-01-15",
        ids: ["att-1", "att-2"],
      };

      const rows = [makeRow()];
      const { result } = renderHook(() =>
        useAttendanceDailyFetch({
          ...defaultParams,
          attendanceDailyList: rows,
          duplicateAttendances: [externalDup],
        }),
      );

      await waitFor(() =>
        expect(result.current.duplicateSummaryMap["staff-1"]).toBeDefined(),
      );

      expect(result.current.mergedDuplicateAttendances).toHaveLength(1);
    });

    it("loading=true の場合、空配列を返すこと", () => {
      const { result } = renderHook(() =>
        useAttendanceDailyFetch({
          ...defaultParams,
          loading: true,
          duplicateAttendances: [
            {
              staffId: "staff-1",
              staffName: "山田 太郎",
              workDate: "2024-01-15",
              ids: ["att-1", "att-2"],
            },
          ],
        }),
      );

      expect(result.current.mergedDuplicateAttendances).toHaveLength(0);
    });
  });

  describe("duplicateInfoByStaff", () => {
    it("重複情報を staffId ごとにグルーピングすること", async () => {
      const dupError = {
        details: {
          duplicates: [
            {
              workDate: "2024-01-15",
              ids: ["att-1", "att-2"],
              staffId: "staff-1",
            },
          ],
        },
      };
      mockTrigger.mockReturnValue({
        unwrap: () => Promise.reject(dupError),
      });

      const rows = [makeRow()];
      const { result } = renderHook(() =>
        useAttendanceDailyFetch({
          ...defaultParams,
          attendanceDailyList: rows,
        }),
      );

      await waitFor(() =>
        expect(result.current.duplicateSummaryMap["staff-1"]).toBeDefined(),
      );

      expect(result.current.duplicateInfoByStaff["staff-1"]).toHaveLength(1);
    });
  });
});
