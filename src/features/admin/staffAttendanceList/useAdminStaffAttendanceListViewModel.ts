import { useAppDispatchV2 } from "@app/hooks";
import {
  useListRecentAttendancesQuery,
  useUpdateAttendanceMutation,
} from "@entities/attendance/api/attendanceApi";
import {
  useGetCompanyHolidayCalendarsQuery,
  useGetHolidayCalendarsQuery,
} from "@entities/calendar/api/calendarApi";
import {
  Attendance,
  CompanyHolidayCalendar,
  HolidayCalendar,
  Staff,
  UpdateAttendanceInput,
} from "@shared/api/graphql/types";
import { useCallback, useEffect, useMemo, useState } from "react";

import * as MESSAGE_CODE from "@/errors";
import {
  AttendanceRowVariant,
  getAttendanceRowVariant,
} from "@/features/attendance/list/getAttendanceRowClassName";
import fetchStaff from "@/hooks/useStaff/fetchStaff";
import { mappingStaffRole, StaffType } from "@/hooks/useStaffs/useStaffs";
import { ChangeRequest } from "@/lib/ChangeRequest";
import { setSnackbarError } from "@/lib/reducers/snackbarReducer";

import { useAdminAttendanceChangeRequests } from "./useAdminAttendanceChangeRequests";

export type AdminStaffAttendanceListViewModel = ReturnType<
  typeof useAdminStaffAttendanceListViewModel
>;

export const useAdminStaffAttendanceListViewModel = (staffId?: string) => {
  const dispatch = useAppDispatchV2();
  const [staff, setStaff] = useState<Staff | undefined | null>(undefined);

  const {
    data: holidayCalendars = [],
    isLoading: isHolidayCalendarsLoading,
    isFetching: isHolidayCalendarsFetching,
    error: holidayCalendarsError,
  } = useGetHolidayCalendarsQuery();

  const {
    data: companyHolidayCalendars = [],
    isLoading: isCompanyHolidayCalendarsLoading,
    isFetching: isCompanyHolidayCalendarsFetching,
    error: companyHolidayCalendarsError,
  } = useGetCompanyHolidayCalendarsQuery();

  const calendarLoading =
    isHolidayCalendarsLoading ||
    isHolidayCalendarsFetching ||
    isCompanyHolidayCalendarsLoading ||
    isCompanyHolidayCalendarsFetching;

  const shouldFetchAttendances = Boolean(staffId);
  const {
    data: attendancesData,
    isLoading: isAttendancesInitialLoading,
    isFetching: isAttendancesFetching,
    isUninitialized: isAttendancesUninitialized,
    error: attendancesError,
    refetch: refetchAttendances,
  } = useListRecentAttendancesQuery(
    { staffId: staffId ?? "" },
    { skip: !shouldFetchAttendances }
  );

  const attendances = attendancesData ?? [];
  const attendanceLoading =
    !shouldFetchAttendances ||
    isAttendancesInitialLoading ||
    isAttendancesFetching ||
    isAttendancesUninitialized;

  const [updateAttendanceMutation] = useUpdateAttendanceMutation();

  useEffect(() => {
    if (!staffId) return;

    fetchStaff(staffId)
      .then(setStaff)
      .catch(() => {
        dispatch(setSnackbarError(MESSAGE_CODE.E00001));
      });
  }, [staffId, dispatch]);

  useEffect(() => {
    if (attendancesError) {
      dispatch(setSnackbarError(MESSAGE_CODE.E02001));
    }
  }, [attendancesError, dispatch]);

  useEffect(() => {
    if (holidayCalendarsError || companyHolidayCalendarsError) {
      console.error(holidayCalendarsError ?? companyHolidayCalendarsError);
      dispatch(setSnackbarError(MESSAGE_CODE.E00001));
    }
  }, [holidayCalendarsError, companyHolidayCalendarsError, dispatch]);

  const staffForMail = useMemo<StaffType | null>(() => {
    if (!staff) return null;
    return {
      id: staff.id,
      cognitoUserId: staff.cognitoUserId,
      familyName: staff.familyName,
      givenName: staff.givenName,
      mailAddress: staff.mailAddress,
      owner: staff.owner ?? false,
      role: mappingStaffRole(staff.role),
      enabled: staff.enabled,
      status: staff.status,
      createdAt: staff.createdAt,
      updatedAt: staff.updatedAt,
      usageStartDate: staff.usageStartDate,
      notifications: staff.notifications,
      workType: staff.workType,
      sortKey: staff.sortKey,
      developer: (staff as unknown as Record<string, unknown>).developer as
        | boolean
        | undefined,
      approverSetting: staff.approverSetting ?? null,
      approverSingle: staff.approverSingle ?? null,
      approverMultiple: staff.approverMultiple ?? null,
      approverMultipleMode: staff.approverMultipleMode ?? null,
      shiftGroup: staff.shiftGroup ?? null,
    } satisfies StaffType;
  }, [staff]);

  const pendingAttendances = useMemo(() => {
    return attendances.filter(
      (attendance) =>
        new ChangeRequest(attendance.changeRequests).getUnapprovedCount() > 0
    );
  }, [attendances]);

  const changeRequestHooks = useAdminAttendanceChangeRequests({
    staffId,
    staff,
    staffForMail,
    pendingAttendances,
    refetchAttendances,
    updateAttendance: (input: UpdateAttendanceInput) =>
      updateAttendanceMutation(input).unwrap(),
  });

  const changeRequestControls = useMemo(
    () => ({
      quickViewAttendance: changeRequestHooks.quickViewAttendance,
      quickViewChangeRequest: changeRequestHooks.quickViewChangeRequest,
      quickViewOpen: changeRequestHooks.quickViewOpen,
      handleOpenQuickView: changeRequestHooks.handleOpenQuickView,
      handleCloseQuickView: changeRequestHooks.handleCloseQuickView,
      selectedAttendanceIds: changeRequestHooks.selectedAttendanceIds,
      isAttendanceSelected: changeRequestHooks.isAttendanceSelected,
      toggleAttendanceSelection: changeRequestHooks.toggleAttendanceSelection,
      toggleSelectAllPending: changeRequestHooks.toggleSelectAllPending,
      bulkApproving: changeRequestHooks.bulkApproving,
      canBulkApprove: changeRequestHooks.canBulkApprove,
      handleBulkApprove: changeRequestHooks.handleBulkApprove,
    }),
    [changeRequestHooks]
  );

  const getTableRowVariant = useCallback(
    (
      attendance: Attendance,
      holidayList: HolidayCalendar[] = holidayCalendars,
      companyHolidayList: CompanyHolidayCalendar[] = companyHolidayCalendars
    ): AttendanceRowVariant => {
      if (staff?.workType === "shift" && attendance.isDeemedHoliday) {
        return "sunday";
      }

      if (staff?.workType === "shift") {
        return "default";
      }

      return getAttendanceRowVariant(
        attendance,
        holidayList,
        companyHolidayList
      );
    },
    [staff, holidayCalendars, companyHolidayCalendars]
  );

  const getBadgeContent = useCallback((attendance: Attendance) => {
    return new ChangeRequest(attendance.changeRequests).getUnapprovedCount();
  }, []);

  return {
    staff,
    holidayCalendars,
    companyHolidayCalendars,
    calendarLoading,
    attendances,
    attendanceLoading,
    pendingAttendances,
    changeRequestControls,
    getTableRowVariant,
    getBadgeContent,
  } satisfies {
    staff: Staff | undefined | null;
    holidayCalendars: HolidayCalendar[];
    companyHolidayCalendars: CompanyHolidayCalendar[];
    calendarLoading: boolean;
    attendances: Attendance[];
    attendanceLoading: boolean;
    pendingAttendances: Attendance[];
    changeRequestControls: ReturnType<typeof useAdminAttendanceChangeRequests>;
    getTableRowVariant: (
      attendance: Attendance,
      holidayList?: HolidayCalendar[],
      companyHolidayList?: CompanyHolidayCalendar[]
    ) => AttendanceRowVariant;
    getBadgeContent: (attendance: Attendance) => number;
  };
};
