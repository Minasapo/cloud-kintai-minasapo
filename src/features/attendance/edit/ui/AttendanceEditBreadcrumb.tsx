import dayjs from "dayjs";
import { useContext } from "react";

import { AttendanceDate } from "@/entities/attendance/lib/AttendanceDate";
import { AttendanceEditContext } from "@/features/attendance/edit/model/AttendanceEditProvider";
import Link from "@/shared/ui/link/Link";

const MONTH_QUERY_KEY = "month";

export default function AttendanceEditBreadcrumb() {
  const { workDate } = useContext(AttendanceEditContext);

  if (!workDate) return null;

  const month =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get(MONTH_QUERY_KEY)
      : null;
  const attendanceListHref = month
    ? `/attendance/list?${new URLSearchParams({
        [MONTH_QUERY_KEY]: month,
      }).toString()}`
    : "/attendance/list";

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <Link
        href={attendanceListHref}
        className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
      >
        <span aria-hidden="true" className="text-base leading-none">
          ←
        </span>
        <span>勤怠一覧に戻る</span>
      </Link>
      <div className="inline-flex w-fit items-center rounded-full bg-slate-900/5 px-3 py-1.5 text-xs font-semibold tracking-[0.08em] text-slate-600">
        {dayjs(workDate).format(AttendanceDate.DisplayFormat)}
      </div>
    </div>
  );
}
