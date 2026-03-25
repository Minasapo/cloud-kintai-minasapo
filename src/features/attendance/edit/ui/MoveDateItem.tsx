import "@/shared/lib/dayjs-locale";

import dayjs from "dayjs";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { AttendanceDate } from "@/entities/attendance/lib/AttendanceDate";
import { WorkDateInput } from "@/features/attendance/edit/ui/moveDateItemParts";
import {
  applyWorkDateValue,
  buildAttendanceEditPath,
} from "@/features/attendance/edit/ui/moveDateItemUtils";

export default function MoveDateItem({
  staffId,
  workDate,
}: {
  staffId?: string;
  workDate: dayjs.Dayjs | null;
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedDate, setSelectedDate] = useState(
    workDate?.format("YYYY-MM-DD") ?? "",
  );

  if (!workDate) {
    return null;
  }
  const defaultDateValue = workDate.format("YYYY-MM-DD");

  const isAdmin = Boolean(staffId);
  const format = isAdmin
    ? AttendanceDate.DatePickerFormat
    : AttendanceDate.DisplayFormat;
  const buildPath = (date: dayjs.Dayjs) => {
    return buildAttendanceEditPath({
      date,
      isAdmin,
      staffId,
      searchParams,
      queryParamFormat: AttendanceDate.QueryParamFormat,
    });
  };

  return (
    <div className="flex items-center gap-2">
      <WorkDateInput
        key={defaultDateValue}
        defaultValue={defaultDateValue}
        ariaLabel={format}
        onChange={(value) => setSelectedDate(value)}
      />
      <button
        type="button"
        disabled={!selectedDate}
        className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-[10px] border border-emerald-500/25 bg-emerald-50 px-4 text-sm font-semibold text-emerald-700 transition hover:border-emerald-500/40 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() =>
          applyWorkDateValue({
            value: selectedDate,
            navigate,
            buildPath,
          })
        }
      >
        移動
      </button>
    </div>
  );
}
