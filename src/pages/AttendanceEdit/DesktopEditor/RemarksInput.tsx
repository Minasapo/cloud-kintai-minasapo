import { useContext } from "react";

import RemarksItem from "@/components/attendance_editor/items/RemarksItem";

import { AttendanceEditContext } from "../AttendanceEditProvider";

export default function RemarksInput() {
  const { changeRequests } = useContext(AttendanceEditContext);

  if (!changeRequests) return null;

  return <RemarksItem />;
}
