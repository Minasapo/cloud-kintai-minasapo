import { Attendance } from "@shared/api/graphql/types";
import { formatISOToTimeOr } from "@shared/lib/time";
import dayjs from "dayjs";

export type ConfirmFieldRow = {
  label: string;
  value: (record: Attendance) => string;
  render: (record: Attendance) => string;
};

export function buildConfirmFieldRows(): ConfirmFieldRow[] {
  const formatTime = (value?: string | null) => formatISOToTimeOr(value);
  const formatDate = (value?: string | null) =>
    value ? dayjs(value).format("YYYY/MM/DD") : "-";
  const formatBool = (value?: boolean | null) => (value ? "○" : "-");
  const formatRests = (rests?: Attendance["rests"]) => {
    const items = (rests ?? []).filter(Boolean).map((rest) => {
      const start = formatISOToTimeOr(rest?.startTime);
      const end = formatISOToTimeOr(rest?.endTime);
      return `${start}-${end}`;
    });
    return items.length ? items.join(" / ") : "-";
  };
  const formatHourlyTimes = (
    hourlyTimes?: Attendance["hourlyPaidHolidayTimes"],
  ) => {
    const items = (hourlyTimes ?? []).filter(Boolean).map((time) => {
      const start = formatISOToTimeOr(time?.startTime);
      const end = formatISOToTimeOr(time?.endTime);
      return `${start}-${end}`;
    });
    return items.length ? items.join(" / ") : "-";
  };
  const formatChangeRequests = (
    changeRequests?: Attendance["changeRequests"],
  ) => {
    const items = (changeRequests ?? []).filter(Boolean).map((request, idx) => {
      const start = formatISOToTimeOr(request?.startTime);
      const end = formatISOToTimeOr(request?.endTime);
      const completed = request?.completed ? "済" : "未";
      return `#${idx + 1}: ${start}-${end} / ${completed}`;
    });
    return items.length ? items.join(" | ") : "-";
  };
  const row = (label: string, value: (record: Attendance) => string) => ({
    label,
    value,
    render: value,
  });

  return [
    row("対象日", (record) =>
      record.workDate ? formatDate(record.workDate) : "-",
    ),
    row("スタッフID", (record) => record.staffId || "-"),
    row("出勤", (record) => formatTime(record.startTime)),
    row("退勤", (record) => formatTime(record.endTime)),
    row("直行", (record) => formatBool(record.goDirectlyFlag)),
    row("直帰", (record) => formatBool(record.returnDirectlyFlag)),
    row("欠勤", (record) => formatBool(record.absentFlag)),
    row("休憩", (record) => formatRests(record.rests)),
    row("時間有休", (record) =>
      formatHourlyTimes(record.hourlyPaidHolidayTimes),
    ),
    row("備考", (record) => record.remarks || "-"),
    row("有給", (record) => formatBool(record.paidHolidayFlag)),
    row("特別休暇", (record) => formatBool(record.specialHolidayFlag)),
    row("指定休日", (record) => formatBool(record.isDeemedHoliday)),
    row("時間有休(時間)", (record) =>
      typeof record.hourlyPaidHolidayHours === "number"
        ? `${record.hourlyPaidHolidayHours}h`
        : "-",
    ),
    row("振替日", (record) => formatDate(record.substituteHolidayDate)),
    row("変更申請", (record) => formatChangeRequests(record.changeRequests)),
    row("改訂番号", (record) =>
      typeof record.revision === "number" ? `${record.revision}` : "-",
    ),
    row("作成日時", (record) =>
      record.createdAt
        ? dayjs(record.createdAt).format("YYYY/MM/DD HH:mm")
        : "-",
    ),
    row("更新日時", (record) =>
      record.updatedAt
        ? dayjs(record.updatedAt).format("YYYY/MM/DD HH:mm")
        : "-",
    ),
    row("ID", (record) => record.id || "-"),
  ];
}
