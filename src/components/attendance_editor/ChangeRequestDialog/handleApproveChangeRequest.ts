import { Attendance, UpdateAttendanceInput } from "../../../API";

export default async function handleApproveChangeRequest(
  attendance: Attendance | null,
  updateAttendance: (input: UpdateAttendanceInput) => Promise<Attendance>,
  comment: string | undefined
) {
  if (!attendance || !attendance.changeRequests) {
    throw new Error("attendance or attendance.changeRequests is null");
  }

  const changeRequests = attendance.changeRequests.filter(
    (item): item is NonNullable<typeof item> => item !== null
  );
  const targetChangeRequest = changeRequests[0];

  return updateAttendance({
    id: attendance.id,
    staffId: attendance.staffId,
    workDate: attendance.workDate,
    startTime:
      targetChangeRequest.startTime && targetChangeRequest.startTime !== ""
        ? targetChangeRequest.startTime
        : attendance.startTime,
    endTime:
      targetChangeRequest.endTime && targetChangeRequest.endTime !== ""
        ? targetChangeRequest.endTime
        : attendance.endTime,
    goDirectlyFlag:
      targetChangeRequest.goDirectlyFlag ?? attendance.goDirectlyFlag,
    returnDirectlyFlag:
      targetChangeRequest.returnDirectlyFlag ?? attendance.returnDirectlyFlag,
    remarks:
      targetChangeRequest.remarks && targetChangeRequest.remarks !== ""
        ? targetChangeRequest.remarks
        : attendance.remarks,
    rests: targetChangeRequest.rests
      ? targetChangeRequest.rests
          .filter((item): item is NonNullable<typeof item> => item !== null)
          .map((item) => ({
            startTime: item.startTime,
            endTime: item.endTime,
          }))
      : attendance.rests,
    paidHolidayFlag:
      targetChangeRequest.paidHolidayFlag ?? attendance.paidHolidayFlag,
    substituteHolidayDate:
      targetChangeRequest.substituteHolidayDate ??
      attendance.substituteHolidayDate,
    hourlyPaidHolidayTimes: targetChangeRequest.hourlyPaidHolidayTimes
      ? targetChangeRequest.hourlyPaidHolidayTimes
          .filter((item): item is NonNullable<typeof item> => item !== null)
          .map((item) => ({
            startTime: item.startTime,
            endTime: item.endTime,
          }))
      : attendance.hourlyPaidHolidayTimes,
    hourlyPaidHolidayHours:
      targetChangeRequest.hourlyPaidHolidayHours ??
      attendance.hourlyPaidHolidayHours,
    specialHolidayFlag:
      targetChangeRequest.specialHolidayFlag ?? attendance.specialHolidayFlag,
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
      hourlyPaidHolidayTimes: changeRequest.hourlyPaidHolidayTimes
        ? changeRequest.hourlyPaidHolidayTimes
            .filter((item): item is NonNullable<typeof item> => item !== null)
            .map((item) => ({
              startTime: item.startTime,
              endTime: item.endTime,
            }))
        : [],
      hourlyPaidHolidayHours: changeRequest.hourlyPaidHolidayHours,
      remarks: changeRequest.remarks,
      paidHolidayFlag: changeRequest.paidHolidayFlag,
      specialHolidayFlag: changeRequest.specialHolidayFlag,
      completed: true,
      comment,
    })),
    revision: attendance.revision,
  }).catch((e: Error) => {
    throw e;
  });
}
