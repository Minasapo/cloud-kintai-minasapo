import "./styles.scss";

import { useAttendanceListContext } from "../AttendanceListContext";
import ErrorStatusAlert from "./ErrorStatusAlert";
import MobileCalendar from "./MobileCalendar";
import { hasErrorOrLateInMonth } from "./mobileListStatus";

export default function MobileList() {
  const context = useAttendanceListContext();
  const hasErrorStatus = hasErrorOrLateInMonth(context);

  return (
    <div className="pb-2 md:hidden">
      {hasErrorStatus && <ErrorStatusAlert />}
      <MobileCalendar />
    </div>
  );
}
