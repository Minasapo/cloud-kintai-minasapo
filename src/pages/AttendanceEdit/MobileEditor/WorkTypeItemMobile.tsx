import { Stack, Typography } from "@mui/material";
import { useContext } from "react";

import { getWorkTypeLabel } from "@/pages/admin/AdminStaff/workTypeOptions";
import { AttendanceEditContext } from "@/pages/AttendanceEdit/AttendanceEditProvider";

import { Label } from "./Label";

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
