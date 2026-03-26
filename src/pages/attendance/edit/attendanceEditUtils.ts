import { AttendanceEditInputs } from "@/features/attendance/edit/model/common";

const KNOWN_REMARK_TAGS = ["有給休暇", "特別休暇", "欠勤"] as const;

export const buildChangeRequestPayload = (data: AttendanceEditInputs) => ({
  startTime: data.startTime,
  endTime: data.endTime,
  goDirectlyFlag: data.goDirectlyFlag,
  returnDirectlyFlag: data.returnDirectlyFlag,
  remarks: data.remarks,
  specialHolidayFlag: data.specialHolidayFlag,
  paidHolidayFlag: data.paidHolidayFlag,
  substituteHolidayDate: data.substituteHolidayDate,
  staffComment: data.staffComment,
  rests: (data.rests || []).map((rest) => ({
    startTime: rest.startTime,
    endTime: rest.endTime,
  })),
  hourlyPaidHolidayTimes:
    data.hourlyPaidHolidayTimes?.map((item) => ({
      startTime: item.startTime ?? "",
      endTime: item.endTime ?? "",
    })) ?? [],
});

export const normalizeTimeRanges = <
  T extends
    | {
        startTime?: string | null | undefined;
        endTime?: string | null | undefined;
      }
    | null,
>(
  items: T[] | null | undefined,
) =>
  items
    ? items
        .filter((item): item is Exclude<T, null> => item !== null)
        .map((item) => ({
          startTime: item.startTime ?? null,
          endTime: item.endTime ?? null,
        }))
    : [];

export const splitRemarks = (remarks: string | null | undefined) => {
  const lines = (remarks || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const tags: string[] = [];
  const others: string[] = [];

  lines.forEach((line) => {
    if (KNOWN_REMARK_TAGS.includes(line as (typeof KNOWN_REMARK_TAGS)[number])) {
      tags.push(line);
    } else {
      others.push(line);
    }
  });

  return {
    tags,
    remarks: others.join("\n"),
  };
};
