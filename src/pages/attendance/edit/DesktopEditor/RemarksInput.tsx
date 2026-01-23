import RemarksItem from "@features/attendance/edit/ui/items/RemarksItem";
import { useContext } from "react";

import { AttendanceEditContext } from "../AttendanceEditProvider";

export default function RemarksInput() {
  const { changeRequests } = useContext(AttendanceEditContext);

  if (!changeRequests) return null;

  return <RemarksItem />;
}
