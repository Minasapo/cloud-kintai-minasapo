import { type UpdateAttendanceMutationArg } from "@entities/attendance/api/attendanceApi";
import { Attendance } from "@shared/api/graphql/types";

export default async function handleRejectChangeRequest(
  attendance: Attendance | null,
  updateAttendance: (input: UpdateAttendanceMutationArg) => Promise<Attendance>,
  comment: string | undefined
) {
  if (!attendance || !attendance.changeRequests) {
    throw new Error("attendance or attendance.changeRequests is null");
  }

  const changeRequests = attendance.changeRequests.filter(
    (item): item is NonNullable<typeof item> => item !== null
  );

  return updateAttendance({
    id: attendance.id,
    staffId: attendance.staffId,
    workDate: attendance.workDate,
    changeRequests: changeRequests.map((changeRequest) => ({
      startTime: changeRequest.startTime,
      endTime: changeRequest.endTime,
      goDirectlyFlag: changeRequest.goDirectlyFlag,
      returnDirectlyFlag: changeRequest.returnDirectlyFlag,
      rests: changeRequest.rests
        ? changeRequest.rests
            .filter((item): item is NonNullable<typeof item> => item !== null)
            .map((item) => ({
              startTime: item.startTime,
              endTime: item.endTime,
            }))
        : [],
      remarks: changeRequest.remarks,
      paidHolidayFlag: changeRequest.paidHolidayFlag,
      completed: true,
      comment,
    })),
    revision: attendance.revision,
    logContext: {
      action: "attendance.request.reject",
      details: {
        comment: comment ?? null,
      },
    },
  }).catch((e: Error) => {
    throw e;
  });
}
