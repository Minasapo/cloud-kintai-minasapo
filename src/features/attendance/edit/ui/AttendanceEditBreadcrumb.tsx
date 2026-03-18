import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { Box, Typography } from "@mui/material";
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
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1,
        width: "fit-content",
        maxWidth: "100%",
        borderRadius: "9999px",
        border: "1px solid rgba(148,163,184,0.18)",
        bgcolor: "rgba(255,255,255,0.82)",
        px: 1.5,
        py: 0.75,
      }}
    >
      <Link
        href={attendanceListHref}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          color: "inherit",
          textDecoration: "none",
          minWidth: 0,
        }}
      >
        <ArrowBackRoundedIcon sx={{ fontSize: 18, color: "#475569" }} />
        <Typography
          sx={{
            fontSize: "0.9rem",
            fontWeight: 600,
            color: "#0f172a",
            whiteSpace: "nowrap",
          }}
        >
          勤怠一覧に戻る
        </Typography>
      </Link>
      <Typography
        sx={{
          color: "#94a3b8",
          fontSize: "0.85rem",
          whiteSpace: "nowrap",
        }}
      >
        {dayjs(workDate).format(AttendanceDate.DisplayFormat)}
      </Typography>
    </Box>
  );
}
