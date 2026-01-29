import { Typography } from "@mui/material";
import { useContext } from "react";

import { AttendanceEditContext } from "@/features/attendance/edit/model/AttendanceEditProvider";
import { Label } from "@/features/attendance/edit/ui/mobile/Label";

export function StaffNameItem() {
  const { staff } = useContext(AttendanceEditContext);

  if (!staff) {
    return null;
  }

  return (
    <>
      <Label>■ スタッフ</Label>
      <Typography variant="body1">
        {`${staff.familyName} ${staff.givenName}`}
      </Typography>
    </>
  );
}
