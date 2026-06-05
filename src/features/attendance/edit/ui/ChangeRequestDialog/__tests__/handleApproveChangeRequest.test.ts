import { createMockAttendance } from "@shared/test-utils";

import handleApproveChangeRequest from "../handleApproveChangeRequest";

describe("handleApproveChangeRequest", () => {
  it("欠勤フラグを変更リクエストから承認入力へ反映する", async () => {
    const attendance = createMockAttendance({
      absentFlag: false,
      changeRequests: [
        {
          __typename: "AttendanceChangeRequest",
          absentFlag: true,
          completed: false,
        },
      ],
    });
    const updateAttendance = jest.fn().mockResolvedValue(attendance);

    await handleApproveChangeRequest(attendance, updateAttendance, undefined);

    expect(updateAttendance).toHaveBeenCalledWith(
      expect.objectContaining({
        absentFlag: true,
      }),
    );
  });
});
