import "./AttendanceEditBackNavigation.scss";

import { useSearchParams } from "react-router-dom";

import { useAttendanceEditData } from "@/features/attendance/edit/model/AttendanceEditProvider";
import Link from "@/shared/ui/link/Link";

const MONTH_QUERY_KEY = "month";

const buildAttendanceListHref = (month: string | null) =>
  month
    ? `/attendance/list?${new URLSearchParams({
        [MONTH_QUERY_KEY]: month,
      }).toString()}`
    : "/attendance/list";

export function AttendanceEditBackNavigation() {
  const { workDate } = useAttendanceEditData();
  const [searchParams] = useSearchParams();
  const attendanceListHref = buildAttendanceListHref(
    searchParams.get(MONTH_QUERY_KEY),
  );

  if (!workDate) return null;

  return (
    <div className="attendance-edit-back-navigation">
      <Link
        href={attendanceListHref}
        className="attendance-edit-back-navigation__link"
      >
        <span
          aria-hidden="true"
          className="attendance-edit-back-navigation__arrow"
        >
          ←
        </span>
        <span>勤怠一覧に戻る</span>
      </Link>
    </div>
  );
}

export default AttendanceEditBackNavigation;
