import { useContext } from "react";

import { AttendanceEditContext } from "@/features/attendance/edit/model/AttendanceEditProvider";
import MoveDateItem from "../MoveDateItem";
import { Label } from "@/features/attendance/edit/ui/mobile/Label";

export function WorkDateItem() {
  const { workDate } = useContext(AttendanceEditContext);

  if (!workDate) return null;

  return (
    <>
      <Label>■ 勤務日</Label>
      <MoveDateItem workDate={workDate} />
    </>
  );
}
