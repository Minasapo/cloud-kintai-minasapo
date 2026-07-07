import { useLazyListAttendancesByDateRangeQuery } from "@entities/attendance/api/attendanceApi";
import { usePendingAttendanceMap } from "@features/attendance/daily-list/model/usePendingAttendanceMap";
import { renderHook, waitFor } from "@testing-library/react";

jest.mock("@entities/attendance/api/attendanceApi", () => ({
  useLazyListAttendancesByDateRangeQuery: jest.fn(),
}));

const mockTrigger = jest.fn();

const makeRow = (overrides: Record<string, unknown> = {}) => ({
  sub: "staff-1",
  givenName: "太郎",
  familyName: "山田",
  sortKey: "山田太郎",
  attendance: null,
  ...overrides,
});

describe("usePendingAttendanceMap", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useLazyListAttendancesByDateRangeQuery as jest.Mock).mockReturnValue([
      mockTrigger,
    ]);
    mockTrigger.mockReturnValue({
      unwrap: () => Promise.resolve([]),
    });
  });

  it("前月から当月末までの範囲で取得する", async () => {
    renderHook(() =>
      usePendingAttendanceMap({
        attendanceDailyList: [makeRow()],
        baseDate: "2024-02-15",
      }),
    );

    await waitFor(() => expect(mockTrigger).toHaveBeenCalled());

    expect(mockTrigger).toHaveBeenCalledWith({
      staffId: "staff-1",
      startDate: "2024-01-01",
      endDate: "2024-02-29",
    });
  });

  it("取得結果をスタッフ単位の map に保持する", async () => {
    const attendance = {
      id: "att-1",
      staffId: "staff-1",
      workDate: "2024-01-15",
      changeRequests: [],
    };
    mockTrigger.mockReturnValue({
      unwrap: () => Promise.resolve([attendance]),
    });

    const { result } = renderHook(() =>
      usePendingAttendanceMap({
        attendanceDailyList: [makeRow()],
        baseDate: "2024-02-15",
      }),
    );

    await waitFor(() =>
      expect(result.current["staff-1"]?.[0]?.workDate).toBe("2024-01-15"),
    );
  });

  it("一部のスタッフ取得に失敗しても成功分は保持する", async () => {
    mockTrigger.mockImplementation(({ staffId }: { staffId: string }) => ({
      unwrap: () =>
        staffId === "staff-1"
          ? Promise.resolve([{ id: "att-1", workDate: "2024-01-15" }])
          : Promise.reject(new Error("API error")),
    }));

    const { result } = renderHook(() =>
      usePendingAttendanceMap({
        attendanceDailyList: [
          makeRow({ sub: "staff-1" }),
          makeRow({ sub: "staff-2", givenName: "花子", familyName: "佐藤" }),
        ],
        baseDate: "2024-02-15",
      }),
    );

    await waitFor(() => expect(result.current["staff-1"]?.length).toBe(1));

    expect(result.current["staff-2"]).toBeUndefined();
  });
});
