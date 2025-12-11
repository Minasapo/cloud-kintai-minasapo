import { Stack, Typography } from "@mui/material";
import { useContext } from "react";

import { getWorkTypeLabel } from "@/pages/admin/AdminStaff/workTypeOptions";
import { AttendanceEditContext } from "@/pages/attendance/edit/AttendanceEditProvider";

export default function WorkTypeItem() {
  const { staff } = useContext(AttendanceEditContext);

  if (!staff) {
    return null;
  }

  const workTypeValue = (staff as unknown as Record<string, unknown>)
    .workType as string | null | undefined;

  const label = getWorkTypeLabel(workTypeValue);

  if (!label) return null;

  return (
    <Stack direction="row" alignItems="center">
      <Typography variant="body1" sx={{ fontWeight: "bold", width: "150px" }}>
        勤務形態
      </Typography>
      <Typography variant="body1">{label}</Typography>
    </Stack>
  );
}
