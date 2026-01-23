import { Stack, Typography } from "@mui/material";
import { useContext } from "react";

import { getWorkTypeLabel } from "@/entities/staff/lib/workTypeOptions";
import { AttendanceEditContext } from "@/features/attendance/edit/model/AttendanceEditProvider";

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
