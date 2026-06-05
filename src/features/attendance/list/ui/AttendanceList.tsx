import "./AttendanceList.scss";

import { AuthContext } from "@app/providers/auth/AuthContext";
import { useListAttendancesByDateRangeQuery } from "@entities/attendance/api/attendanceApi";
import { AttendanceDate } from "@entities/attendance/lib/AttendanceDate";
import useCloseDates from "@entities/attendance/model/useCloseDates";
import { useCalendars } from "@entities/calendar/model/useCalendars";
import { Logger } from "@shared/lib/logger";
import { Loader2 } from "lucide-react";
import { useContext, useMemo } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import AttendanceListCard from "./AttendanceListCard";
import { AttendanceListProvider } from "./AttendanceListContext";
import AttendanceListHeader from "./AttendanceListHeader";
import {
  formatDateRangeLabel,
  getAttendanceQueryDateRange,
  getEffectiveDateRange,
} from "./attendanceListUtils";
import DesktopList from "./DesktopList";
import MobileList from "./MobileList/MobileList";
import { useAttendanceListErrorNotifications } from "./useAttendanceListErrorNotifications";
import { useAttendanceSubscription } from "./useAttendanceSubscription";
import { useIsDesktop } from "./useIsDesktop";
import { useMonthQuery } from "./useMonthQuery";
import { useStaffFetch } from "./useStaffFetch";

export default function AttendanceTable() {
  const { cognitoUser } = useContext(AuthContext);
  const isDesktop = useIsDesktop();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const shouldFetchAttendances = Boolean(cognitoUser?.id);
  const { currentMonth, handleMonthChange } = useMonthQuery();
  const {
    holidayCalendars,
    companyHolidayCalendars,
    isLoading: calendarLoading,
    error: calendarsError,
  } = useCalendars();
  const {
    closeDates,
    loading: closeDatesLoading,
    error: closeDatesError,
  } = useCloseDates();
  const effectiveDateRange = useMemo(
    () => getEffectiveDateRange(currentMonth, closeDates),
    [currentMonth, closeDates],
  );
  const attendanceQueryDateRange = useMemo(
    () => getAttendanceQueryDateRange(currentMonth, effectiveDateRange),
    [currentMonth, effectiveDateRange],
  );
  const startDate = attendanceQueryDateRange.start.format(
    AttendanceDate.DataFormat,
  );
  const endDate = attendanceQueryDateRange.end.format(
    AttendanceDate.DataFormat,
  );
  const {
    data: attendances = [],
    isLoading: isAttendancesInitialLoading,
    isFetching: isAttendancesFetching,
    isUninitialized: isAttendancesUninitialized,
    error: attendancesError,
    refetch: refetchAttendances,
  } = useListAttendancesByDateRangeQuery(
    {
      staffId: cognitoUser?.id ?? "",
      startDate,
      endDate,
    },
    {
      skip: !shouldFetchAttendances,
      refetchOnMountOrArgChange: true,
    },
  );
  const attendanceLoading =
    !shouldFetchAttendances ||
    isAttendancesInitialLoading ||
    isAttendancesFetching ||
    isAttendancesUninitialized;

  useAttendanceSubscription({
    currentStaffId: cognitoUser?.id,
    shouldFetchAttendances,
    startDate,
    endDate,
    refetchAttendances,
  });
  const logger = useMemo(
    () => new Logger("AttendanceList", import.meta.env.DEV ? "DEBUG" : "ERROR"),
    [],
  );
  const staff = useStaffFetch({ cognitoUser, logger, dispatch });
  useAttendanceListErrorNotifications({
    attendancesError,
    calendarsError,
    closeDatesError,
    logger,
    dispatch,
  });
  const rangeLabelForDisplay = useMemo(
    () => formatDateRangeLabel(effectiveDateRange),
    [effectiveDateRange],
  );
  if (attendanceLoading || calendarLoading || closeDatesLoading) {
    return (
      <div className="w-full flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }
  const contextValue = {
    attendances,
    staff,
    holidayCalendars,
    companyHolidayCalendars,
    navigate,
    closeDates,
    closeDatesLoading,
    closeDatesError,
    currentMonth,
    effectiveDateRange,
    onMonthChange: handleMonthChange,
  };
  return (
    <AttendanceListProvider value={contextValue}>
      <div className="attendance-list p-4 md:p-8">
        <AttendanceListHeader rangeLabelForDisplay={rangeLabelForDisplay} />

        <AttendanceListCard>
          {isDesktop ? <DesktopList /> : <MobileList />}
        </AttendanceListCard>
      </div>
    </AttendanceListProvider>
  );
}
