import { Stack, Typography } from "@mui/material";
import { useContext } from "react";

import { getWorkTypeLabel } from "@/entities/staff/lib/workTypeOptions";
import { AttendanceEditContext } from "@/features/attendance/edit/model/AttendanceEditProvider";

import { Label } from "@/features/attendance/edit/ui/mobile/Label";

export default function WorkTypeItemMobile() {
  const { staff } = useContext(AttendanceEditContext);

  const workTypeValue = (staff as unknown as Record<string, unknown>)
    .workType as string | null | undefined;

  const label = getWorkTypeLabel(workTypeValue);

  if (!label) return null;

  return (
    <Stack direction="column" spacing={0.5}>
      <Label>■ 勤務形態</Label>
      <Typography variant="body1">{label}</Typography>
    </Stack>
  );
}
