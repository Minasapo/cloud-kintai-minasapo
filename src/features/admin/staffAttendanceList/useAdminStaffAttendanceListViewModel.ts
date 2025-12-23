import { useAppDispatchV2 } from "@app/hooks";
import {
  useListRecentAttendancesQuery,
  useUpdateAttendanceMutation,
} from "@entities/attendance/api/attendanceApi";
import {
  useGetCompanyHolidayCalendarsQuery,
  useGetHolidayCalendarsQuery,
} from "@entities/calendar/api/calendarApi";
import handleApproveChangeRequest from "@features/attendance/edit/ChangeRequestDialog/handleApproveChangeRequest";
import {
  Attendance,
  AttendanceChangeRequest,
  CompanyHolidayCalendar,
  HolidayCalendar,
  Staff,
  UpdateAttendanceInput,
} from "@shared/api/graphql/types";
import { useCallback, useEffect, useMemo, useState } from "react";

import * as MESSAGE_CODE from "@/errors";
import { getAttendanceRowClassName } from "@/features/attendance/list/getAttendanceRowClassName";
import createOperationLogData from "@/hooks/useOperationLog/createOperationLogData";
import fetchStaff from "@/hooks/useStaff/fetchStaff";
import { mappingStaffRole, StaffType } from "@/hooks/useStaffs/useStaffs";
import { ChangeRequest } from "@/lib/ChangeRequest";
import { GenericMailSender } from "@/lib/mail/GenericMailSender";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/lib/reducers/snackbarReducer";

export type AdminStaffAttendanceListViewModel = ReturnType<
  typeof useAdminStaffAttendanceListViewModel
>;

export const useAdminStaffAttendanceListViewModel = (staffId?: string) => {
  const dispatch = useAppDispatchV2();
  const [staff, setStaff] = useState<Staff | undefined | null>(undefined);
  const [quickViewAttendance, setQuickViewAttendance] =
    useState<Attendance | null>(null);
  const [quickViewChangeRequest, setQuickViewChangeRequest] =
    useState<AttendanceChangeRequest | null>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [selectedAttendanceIds, setSelectedAttendanceIds] = useState<string[]>(
    []
  );
  const [bulkApproving, setBulkApproving] = useState(false);

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

  const getPendingChangeRequest = useCallback((attendance: Attendance) => {
    return new ChangeRequest(attendance.changeRequests).getFirstUnapproved();
  }, []);

  const handleOpenQuickView = useCallback(
    (attendance: Attendance) => {
      const pendingRequest = getPendingChangeRequest(attendance);
      if (!pendingRequest) return;

      setQuickViewAttendance(attendance);
      setQuickViewChangeRequest(pendingRequest);
      setQuickViewOpen(true);
    },
    [getPendingChangeRequest]
  );

  const handleCloseQuickView = useCallback(() => {
    setQuickViewOpen(false);
    setQuickViewAttendance(null);
    setQuickViewChangeRequest(null);
  }, []);

  const isAttendanceSelected = useCallback(
    (attendanceId: string) => selectedAttendanceIds.includes(attendanceId),
    [selectedAttendanceIds]
  );

  const toggleAttendanceSelection = useCallback((attendanceId: string) => {
    setSelectedAttendanceIds((prev) => {
      if (prev.includes(attendanceId)) {
        return prev.filter((id) => id !== attendanceId);
      }
      return [...prev, attendanceId];
    });
  }, []);

  const toggleSelectAllPending = useCallback(() => {
    if (pendingAttendances.length === 0) return;
    setSelectedAttendanceIds((prev) => {
      if (prev.length === pendingAttendances.length) {
        return [];
      }
      return pendingAttendances.map((attendance) => attendance.id);
    });
  }, [pendingAttendances]);

  const handleBulkApprove = useCallback(async () => {
    if (
      selectedAttendanceIds.length === 0 ||
      !staffId ||
      !staff ||
      !staffForMail
    ) {
      return;
    }

    const targetAttendances = pendingAttendances.filter((attendance) =>
      selectedAttendanceIds.includes(attendance.id)
    );
    if (targetAttendances.length === 0) return;

    let mailErrorOccurred = false;
    setBulkApproving(true);
    try {
      for (const attendance of targetAttendances) {
        // eslint-disable-next-line no-await-in-loop
        const updatedAttendance = await handleApproveChangeRequest(
          attendance,
          (input: UpdateAttendanceInput) =>
            updateAttendanceMutation(input).unwrap(),
          undefined
        );

        try {
          new GenericMailSender(
            staffForMail,
            updatedAttendance
          ).approveChangeRequest(undefined);
        } catch (mailError) {
          console.error(
            "Failed to send approval notification mail:",
            mailError
          );
          mailErrorOccurred = true;
        }

        // eslint-disable-next-line no-await-in-loop
        await createOperationLogData({
          staffId: staffForMail.id,
          action: "approve_change_request",
          resource: "attendance",
          resourceId: updatedAttendance.id,
          timestamp: new Date().toISOString(),
          details: JSON.stringify({
            workDate: updatedAttendance.workDate,
            applicantStaffId: updatedAttendance.staffId,
            result: "approved",
            comment: null,
            bulk: true,
          }),
        }).catch((error) => {
          console.error("Failed to create operation log:", error);
        });
      }

      dispatch(setSnackbarSuccess(MESSAGE_CODE.S04006));
      setSelectedAttendanceIds([]);
      await refetchAttendances();
      if (mailErrorOccurred) {
        dispatch(setSnackbarError(MESSAGE_CODE.E00002));
      }
    } catch (error) {
      console.error("Bulk approve failed", error);
      dispatch(setSnackbarError(MESSAGE_CODE.E04006));
    } finally {
      setBulkApproving(false);
    }
  }, [
    dispatch,
    refetchAttendances,
    pendingAttendances,
    selectedAttendanceIds,
    staff,
    staffForMail,
    staffId,
    updateAttendanceMutation,
  ]);

  useEffect(() => {
    setSelectedAttendanceIds((prev) =>
      prev.filter((id) =>
        pendingAttendances.some((attendance) => attendance.id === id)
      )
    );
  }, [pendingAttendances]);

  const getTableRowClassName = useCallback(
    (
      attendance: Attendance,
      holidayList: HolidayCalendar[] = holidayCalendars,
      companyHolidayList: CompanyHolidayCalendar[] = companyHolidayCalendars
    ) => {
      if (staff?.workType === "shift" && attendance.isDeemedHoliday) {
        return "table-row--sunday";
      }

      if (staff?.workType === "shift") {
        return "table-row--default";
      }

      return getAttendanceRowClassName(
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

  const canBulkApprove = Boolean(staffForMail);

  return {
    staff,
    holidayCalendars,
    companyHolidayCalendars,
    calendarLoading,
    attendances,
    attendanceLoading,
    pendingAttendances,
    quickViewAttendance,
    quickViewChangeRequest,
    quickViewOpen,
    handleOpenQuickView,
    handleCloseQuickView,
    selectedAttendanceIds,
    isAttendanceSelected,
    toggleAttendanceSelection,
    toggleSelectAllPending,
    bulkApproving,
    canBulkApprove,
    handleBulkApprove,
    getTableRowClassName,
    getBadgeContent,
  } satisfies {
    staff: Staff | undefined | null;
    holidayCalendars: HolidayCalendar[];
    companyHolidayCalendars: CompanyHolidayCalendar[];
    calendarLoading: boolean;
    attendances: Attendance[];
    attendanceLoading: boolean;
    pendingAttendances: Attendance[];
    quickViewAttendance: Attendance | null;
    quickViewChangeRequest: AttendanceChangeRequest | null;
    quickViewOpen: boolean;
    handleOpenQuickView: (attendance: Attendance) => void;
    handleCloseQuickView: () => void;
    selectedAttendanceIds: string[];
    isAttendanceSelected: (attendanceId: string) => boolean;
    toggleAttendanceSelection: (attendanceId: string) => void;
    toggleSelectAllPending: () => void;
    bulkApproving: boolean;
    canBulkApprove: boolean;
    handleBulkApprove: () => Promise<void> | void;
    getTableRowClassName: (
      attendance: Attendance,
      holidayList?: HolidayCalendar[],
      companyHolidayList?: CompanyHolidayCalendar[]
    ) => string;
    getBadgeContent: (attendance: Attendance) => number;
  };
};
