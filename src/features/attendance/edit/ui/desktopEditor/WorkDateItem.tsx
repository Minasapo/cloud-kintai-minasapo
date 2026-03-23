import WorkDateItem from "@features/attendance/edit/ui/items/WorkDateItem";

import { useAttendanceEditData } from "@/features/attendance/edit/model/AttendanceEditProvider";

import MoveDateItem from "../MoveDateItem";

export default function WorkDateItemWrapper() {
  const { workDate } = useAttendanceEditData();
  if (!workDate) return null;
  return (
    <WorkDateItem workDate={workDate} MoveDateItemComponent={MoveDateItem} />
  );
}
