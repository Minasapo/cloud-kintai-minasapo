import { AttendanceTime } from "@entities/attendance/lib/AttendanceTime";
import { CLOCK_CORRECTION_CHECK_OUT_LABEL } from "@entities/workflow/lib/workflowLabels";
import {
  Attendance,
  CreateAttendanceInput,
  GetWorkflowQuery,
  UpdateAttendanceInput,
} from "@shared/api/graphql/types";
import dayjs from "dayjs";

type WorkflowData = NonNullable<GetWorkflowQuery["getWorkflow"]>;

export type StaffLike = {
  id: string;
  cognitoUserId?: string | null;
  familyName?: string | null;
  givenName?: string | null;
};

export type AttendanceQueryTrigger = (arg: {
  staffId: string;
  workDate: string;
}) => { unwrap: () => Promise<Attendance | null> };

export type CreateAttendanceTrigger = (
  input: CreateAttendanceInput
) => { unwrap: () => Promise<Attendance> };

export type UpdateAttendanceTrigger = (
  input: UpdateAttendanceInput
) => { unwrap: () => Promise<Attendance> };

export class WorkflowApprovalUserError extends Error {}

export type PaidLeaveProcessResult =
  | { kind: "updated" }
  | { kind: "skipped"; reason: "missing_period" | "invalid_period" };

export const processPaidLeaveApprovalAttendance = async ({
  workflow,
  staffs,
  getStartTime,
  getEndTime,
  getLunchRestStartTime,
  getLunchRestEndTime,
  getAttendanceByStaffAndDate,
  createAttendance,
  updateAttendance,
}: {
  workflow: WorkflowData;
  staffs: StaffLike[];
  getStartTime: () => dayjs.Dayjs;
  getEndTime: () => dayjs.Dayjs;
  getLunchRestStartTime: () => dayjs.Dayjs;
  getLunchRestEndTime: () => dayjs.Dayjs;
  getAttendanceByStaffAndDate: AttendanceQueryTrigger;
  createAttendance: CreateAttendanceTrigger;
  updateAttendance: UpdateAttendanceTrigger;
}): Promise<PaidLeaveProcessResult> => {
  const startDateStr = workflow.overTimeDetails?.startTime ?? null;
  const endDateStr = workflow.overTimeDetails?.endTime ?? null;

  if (!startDateStr || !endDateStr) {
    return { kind: "skipped", reason: "missing_period" };
  }

  const start = dayjs(startDateStr);
  const end = dayjs(endDateStr);

  if (!start.isValid() || !end.isValid()) {
    return { kind: "skipped", reason: "invalid_period" };
  }

  const applicantStaff = staffs.find((staff) => staff.id === workflow.staffId);
  const targetStaffId = applicantStaff?.cognitoUserId || workflow.staffId;

  const stdStartTime = getStartTime().format("HH:mm");
  const stdEndTime = getEndTime().format("HH:mm");
  const stdLunchStartTime = getLunchRestStartTime().format("HH:mm");
  const stdLunchEndTime = getLunchRestEndTime().format("HH:mm");
  const dayCount = end.diff(start, "day") + 1;

  for (let i = 0; i < dayCount; i++) {
    const targetDay = start.add(i, "day");
    const workDate = targetDay.format("YYYY-MM-DD");

    const buildIso = (time: string) => {
      const [hour, minute] = time.split(":").map(Number);
      return targetDay
        .hour(hour || 0)
        .minute(minute || 0)
        .second(0)
        .millisecond(0)
        .toISOString();
    };

    const input: CreateAttendanceInput = {
      staffId: targetStaffId,
      workDate,
      startTime: buildIso(stdStartTime),
      endTime: buildIso(stdEndTime),
      goDirectlyFlag: false,
      returnDirectlyFlag: false,
      absentFlag: false,
      paidHolidayFlag: true,
      specialHolidayFlag: false,
      rests: [
        {
          startTime: buildIso(stdLunchStartTime),
          endTime: buildIso(stdLunchEndTime),
        },
      ],
      hourlyPaidHolidayTimes: [],
    };

    const existingAttendance = await getAttendanceByStaffAndDate({
      staffId: targetStaffId,
      workDate,
    }).unwrap();

    if (existingAttendance) {
      await updateAttendance({
        id: existingAttendance.id,
        staffId: targetStaffId,
        workDate,
        startTime: input.startTime,
        endTime: input.endTime,
        goDirectlyFlag: input.goDirectlyFlag,
        returnDirectlyFlag: input.returnDirectlyFlag,
        absentFlag: input.absentFlag,
        paidHolidayFlag: input.paidHolidayFlag,
        specialHolidayFlag: input.specialHolidayFlag,
        rests: input.rests,
        hourlyPaidHolidayTimes: input.hourlyPaidHolidayTimes,
        revision: existingAttendance.revision,
      }).unwrap();
    } else {
      await createAttendance(input).unwrap();
    }
  }

  return { kind: "updated" };
};

export type ClockCorrectionProcessResult = { kind: "updated" | "created" };

export const processClockCorrectionApprovalAttendance = async ({
  workflow,
  staffs,
  getAttendanceByStaffAndDate,
  createAttendance,
  updateAttendance,
}: {
  workflow: WorkflowData;
  staffs: StaffLike[];
  getAttendanceByStaffAndDate: AttendanceQueryTrigger;
  createAttendance: CreateAttendanceTrigger;
  updateAttendance: UpdateAttendanceTrigger;
}): Promise<ClockCorrectionProcessResult> => {
  const overtimeDetails = workflow.overTimeDetails;
  const isClockOutCorrection =
    overtimeDetails?.reason === CLOCK_CORRECTION_CHECK_OUT_LABEL;
  const targetTime = isClockOutCorrection
    ? overtimeDetails?.endTime || overtimeDetails?.startTime
    : overtimeDetails?.startTime;

  const applicantStaff = staffs.find((staff) => staff.id === workflow.staffId);
  const targetStaffId = applicantStaff?.cognitoUserId || workflow.staffId;

  const validationErrors: string[] = [];
  const timeLabel = isClockOutCorrection ? "退勤" : "出勤";

  if (!targetStaffId) {
    validationErrors.push("修正対象のstaffId が null/undefined");
  }
  if (!overtimeDetails?.date) {
    validationErrors.push("overtimeDetails.date が null/undefined");
  }
  if (!targetTime) {
    validationErrors.push("対象の時刻が null/undefined");
  }
  if (overtimeDetails?.date && !/^\d{4}-\d{2}-\d{2}$/.test(overtimeDetails.date)) {
    validationErrors.push(
      `workDate が正しい形式ではありません: "${overtimeDetails.date}" (YYYY-MM-DD の形式が必要)`
    );
  }
  if (targetTime && !/^\d{2}:\d{2}$/.test(targetTime)) {
    validationErrors.push(
      `${timeLabel}時刻が正しい形式ではありません: "${targetTime}" (HH:mm の形式が必要)`
    );
  }

  if (validationErrors.length > 0) {
    throw new WorkflowApprovalUserError(
      `勤怠データの作成に失敗しました: ${validationErrors.join(", ")}`
    );
  }

  let attendanceTimeIso: string;
  try {
    const attendanceTime = new AttendanceTime(targetTime!, overtimeDetails!.date);
    attendanceTimeIso = attendanceTime.toAPI();
  } catch {
    throw new WorkflowApprovalUserError(
      "時刻の形式が正しくありません。勤怠データを作成できません。"
    );
  }

  const createInput: CreateAttendanceInput = {
    staffId: targetStaffId,
    workDate: overtimeDetails!.date,
    startTime: isClockOutCorrection ? null : attendanceTimeIso,
    endTime: isClockOutCorrection ? attendanceTimeIso : null,
    goDirectlyFlag: false,
    returnDirectlyFlag: false,
    absentFlag: false,
    paidHolidayFlag: false,
    specialHolidayFlag: false,
    rests: [],
    hourlyPaidHolidayTimes: [],
  };

  const existingAttendance = await getAttendanceByStaffAndDate({
    staffId: createInput.staffId,
    workDate: createInput.workDate,
  }).unwrap();

  if (isClockOutCorrection && !existingAttendance) {
    throw new WorkflowApprovalUserError(
      "対応する出勤打刻がありません。先に出勤打刻を登録してください。"
    );
  }

  if (!existingAttendance) {
    await createAttendance(createInput).unwrap();
    return { kind: "created" };
  }

  await updateAttendance({
    id: existingAttendance.id,
    staffId: createInput.staffId,
    workDate: createInput.workDate,
    startTime: isClockOutCorrection
      ? existingAttendance.startTime || createInput.startTime
      : createInput.startTime,
    endTime: isClockOutCorrection
      ? createInput.endTime
      : existingAttendance.endTime ?? createInput.endTime,
    goDirectlyFlag: existingAttendance.goDirectlyFlag ?? createInput.goDirectlyFlag,
    returnDirectlyFlag:
      existingAttendance.returnDirectlyFlag ?? createInput.returnDirectlyFlag,
    absentFlag: existingAttendance.absentFlag ?? createInput.absentFlag,
    paidHolidayFlag: existingAttendance.paidHolidayFlag ?? createInput.paidHolidayFlag,
    specialHolidayFlag:
      existingAttendance.specialHolidayFlag ?? createInput.specialHolidayFlag,
    rests: existingAttendance.rests ?? createInput.rests,
    hourlyPaidHolidayTimes:
      existingAttendance.hourlyPaidHolidayTimes ?? createInput.hourlyPaidHolidayTimes,
    revision: existingAttendance.revision,
  }).unwrap();

  return { kind: "updated" };
};
