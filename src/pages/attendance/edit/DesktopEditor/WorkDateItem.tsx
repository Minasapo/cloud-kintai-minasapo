import WorkDateItem from "@features/attendance/edit/ui/items/WorkDateItem";
import { useContext } from "react";

import { AttendanceEditContext } from "../AttendanceEditProvider";
import MoveDateItem from "../MoveDateItem";

export default function WorkDateItemWrapper() {
  const { workDate } = useContext(AttendanceEditContext);
  if (!workDate) return null;
  return (
    <WorkDateItem workDate={workDate} MoveDateItemComponent={MoveDateItem} />
  );
}
