import {
  clockInAction,
  restStartAction,
} from "@/entities/attendance/lib/actions/attendanceActions";

describe("attendanceActions workDate guard", () => {
  it("clockInAction creates a new record when cached attendance is for another workDate", async () => {
    const createAttendance = jest.fn().mockResolvedValue({ id: "created" });
    const updateAttendance = jest.fn().mockResolvedValue({ id: "updated" });

    await clockInAction({
      attendance: {
        id: "existing",
        staffId: "staff-1",
        workDate: "2026-03-22",
      } as never,
      staffId: "staff-1",
      workDate: "2026-03-23",
      startTime: "2026-03-23T00:00:00.000Z",
      createAttendance,
      updateAttendance,
    });

    expect(createAttendance).toHaveBeenCalledTimes(1);
    expect(updateAttendance).not.toHaveBeenCalled();
  });

  it("restStartAction updates only when attendance workDate matches", async () => {
    const createAttendance = jest.fn().mockResolvedValue({ id: "created" });
    const updateAttendance = jest.fn().mockResolvedValue({ id: "updated" });

    await restStartAction({
      attendance: {
        id: "existing",
        staffId: "staff-1",
        workDate: "2026-03-22",
        startTime: "2026-03-22T00:00:00.000Z",
        rests: [],
      } as never,
      staffId: "staff-1",
      workDate: "2026-03-23",
      time: "2026-03-23T01:00:00.000Z",
      createAttendance,
      updateAttendance,
    });

    expect(createAttendance).toHaveBeenCalledTimes(1);
    expect(updateAttendance).not.toHaveBeenCalled();
  });
});

