import { Breadcrumbs, Typography } from "@mui/material";
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
    <Breadcrumbs>
      <Link href="/">
        TOP
      </Link>
      <Link href={attendanceListHref}>
        勤怠一覧
      </Link>
      <Typography color="text.primary">
        {dayjs(workDate).format(AttendanceDate.DisplayFormat)}
      </Typography>
    </Breadcrumbs>
  );
}
