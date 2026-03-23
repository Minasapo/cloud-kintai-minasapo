import "@/shared/lib/dayjs-locale";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import dayjs from "dayjs";
import { useNavigate, useSearchParams } from "react-router-dom";

import { AttendanceDate } from "@/entities/attendance/lib/AttendanceDate";

const MONTH_QUERY_KEY = "month";

export default function MoveDateItem({
  staffId,
  workDate,
}: {
  staffId?: string;
  workDate: dayjs.Dayjs | null;
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const today = dayjs();

  if (!workDate) {
    return null;
  }

  const isAdmin = Boolean(staffId);
  const format = isAdmin
    ? AttendanceDate.DatePickerFormat
    : AttendanceDate.DisplayFormat;
  const buildPath = (date: dayjs.Dayjs) => {
    const formatted = date.format(AttendanceDate.QueryParamFormat);
    if (isAdmin) {
      return `/admin/attendances/edit/${formatted}/${staffId}`;
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set(MONTH_QUERY_KEY, date.startOf("month").format("YYYY-MM"));
    return `/attendance/${formatted}/edit?${nextParams.toString()}`;
  };

  return (
    <div className="flex items-center gap-4">
      <div>
        <button
          type="button"
          onClick={() => {
            const prevDate = workDate.add(-1, "day");
            navigate(buildPath(prevDate));
          }}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
        >
          <ArrowBackIcon />
        </button>
      </div>
      <input
        type="date"
        value={workDate.format("YYYY-MM-DD")}
        aria-label={format}
        onChange={(e) => {
          if (!e.target.value) return;
          const date = dayjs(e.target.value);
          if (date.isValid()) {
            navigate(buildPath(date));
          }
        }}
        className="rounded-[16px] border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
      />
      <div>
        <button
          type="button"
          disabled={!isAdmin && workDate.isSame(today, "day")}
          onClick={() => {
            const nextDate = workDate.add(1, "day");
            navigate(buildPath(nextDate));
          }}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowForwardIcon />
        </button>
      </div>
    </div>
  );
}
