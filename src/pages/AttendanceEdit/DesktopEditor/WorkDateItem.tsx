import { useContext } from "react";

import WorkDateItem from "@/components/attendance_editor/items/WorkDateItem";

import { AttendanceEditContext } from "../AttendanceEditProvider";
import MoveDateItem from "../MoveDateItem";

export default function WorkDateItemWrapper() {
  const { workDate } = useContext(AttendanceEditContext);
  if (!workDate) return null;
  return (
    <WorkDateItem workDate={workDate} MoveDateItemComponent={MoveDateItem} />
  );
}
