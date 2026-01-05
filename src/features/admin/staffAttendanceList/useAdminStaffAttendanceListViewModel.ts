import { useAppDispatchV2 } from "@app/hooks";
import {
  type DuplicateAttendanceInfo,
  useListAttendancesByDateRangeQuery,
  useUpdateAttendanceMutation,
} from "@entities/attendance/api/attendanceApi";
import {
  useGetCompanyHolidayCalendarsQuery,
  useGetHolidayCalendarsQuery,
} from "@entities/calendar/api/calendarApi";
import {
  Attendance,
  CloseDate,
  CompanyHolidayCalendar,
  HolidayCalendar,
  Staff,
  UpdateAttendanceInput,
} from "@shared/api/graphql/types";
import dayjs, { Dayjs } from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";

import * as MESSAGE_CODE from "@/errors";
import {
  AttendanceRowVariant,
  getAttendanceRowVariant,
} from "@/features/attendance/list/getAttendanceRowClassName";
import useCloseDates from "@/hooks/useCloseDates/useCloseDates";
import fetchStaff from "@/hooks/useStaff/fetchStaff";
import { mappingStaffRole, StaffType } from "@/hooks/useStaffs/useStaffs";
import { ChangeRequest } from "@/lib/ChangeRequest";
import { setSnackbarError } from "@/lib/reducers/snackbarReducer";

import type { PendingAttendanceControls } from "./components/PendingAttendanceSection";
import { useAdminAttendanceChangeRequests } from "./useAdminAttendanceChangeRequests";

export type AdminStaffAttendanceListViewModel = ReturnType<
  typeof useAdminStaffAttendanceListViewModel
>;

export const useAdminStaffAttendanceListViewModel = (
  staffId?: string,
  currentMonth?: Dayjs
) => {
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

  const {
    closeDates,
    loading: closeDatesLoading,
    error: closeDatesError,
  } = useCloseDates();

  // カレンダー表示月の初期データは前月と当月の2ヶ月分を取得
  const dateRange = useMemo(() => {
    const month = currentMonth ?? dayjs().startOf("month");
    // 前月の月初から当月の月末までを取得
    const startDate = month.subtract(1, "month").startOf("month");
    const endDate = month.endOf("month");
    return {
      startDate: startDate.format("YYYY-MM-DD"),
      endDate: endDate.format("YYYY-MM-DD"),
    };
  }, [currentMonth]);

  const shouldFetchAttendances = Boolean(staffId);
  const queryResult = useListAttendancesByDateRangeQuery(
    {
      staffId: staffId ?? "",
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    },
    { skip: !shouldFetchAttendances }
  );

  const {
    data: attendancesData,
    isLoading: isAttendancesInitialLoading,
    isFetching: isAttendancesFetching,
    isUninitialized: isAttendancesUninitialized,
    error: attendancesError,
    refetch: refetchAttendances,
  } = queryResult;

  // 取得したデータから日付ごとのマップを作成
  const attendanceMap = useMemo(() => {
    const map = new Map<string, Attendance[]>();
    (attendancesData ?? []).forEach((attendance) => {
      const existing = map.get(attendance.workDate) ?? [];
      existing.push(attendance);
      map.set(attendance.workDate, existing);
    });
    return map;
  }, [attendancesData]);

  // 日付範囲内のすべての日付に対してAttendanceを生成（空の日も含む）
  const attendances: Attendance[] = useMemo(() => {
    const result: Attendance[] = [];
    const start = dayjs(dateRange.startDate);
    const end = dayjs(dateRange.endDate);
    let current = start;

    while (current.isBefore(end) || current.isSame(end, "day")) {
      const dateStr = current.format("YYYY-MM-DD");
      const matches = attendanceMap.get(dateStr) ?? [];

      if (matches.length > 0) {
        // 実際のデータがある場合は最初のレコードを使用
        result.push(matches[0]);
      } else {
        // データがない場合は空のAttendanceを生成
        result.push({
          __typename: "Attendance",
          id: "",
          staffId: staffId ?? "",
          workDate: dateStr,
          startTime: "",
          endTime: "",
          absentFlag: false,
          goDirectlyFlag: false,
          returnDirectlyFlag: false,
          rests: [],
          remarks: "",
          paidHolidayFlag: false,
          specialHolidayFlag: false,
          isDeemedHoliday: false,
          substituteHolidayDate: null,
          changeRequests: [],
          createdAt: "",
          updatedAt: "",
        });
      }

      current = current.add(1, "day");
    }

    return result;
  }, [attendancesData, attendanceMap, dateRange, staffId]);

  // 重複チェック
  const duplicateAttendances: DuplicateAttendanceInfo[] = useMemo(() => {
    const duplicates: DuplicateAttendanceInfo[] = [];

    attendanceMap.forEach((matches, workDate) => {
      if (matches.length > 1) {
        duplicates.push({
          workDate,
          ids: matches.map((a) => a.id).filter(Boolean),
          staffId: staffId ?? "",
        });
      }
    });

    return duplicates;
  }, [attendanceMap, staffId]);

  const attendanceLoading =
    (!shouldFetchAttendances ||
      isAttendancesInitialLoading ||
      isAttendancesFetching ||
      isAttendancesUninitialized) &&
    !attendancesError;

  const [updateAttendanceMutation] = useUpdateAttendanceMutation();

  useEffect(() => {
    if (!staffId) return;

    fetchStaff(staffId)
      .then(setStaff)
      .catch(() => {
        // staffの取得に失敗しても、勤怠データがあれば表示できるように警告として扱う
        setStaff(null);
        dispatch(
          setSnackbarError(
            "スタッフ情報の取得に失敗しましたが、勤怠データは表示されます。(エラーコード: E00001)"
          )
        );
      });
  }, [staffId, dispatch]);

  useEffect(() => {
    if (attendancesError) {
      // エラーメッセージから重複データエラー（E02004）かどうかを判定
      const errorMessage =
        typeof attendancesError === "object" &&
        attendancesError !== null &&
        "message" in attendancesError
          ? (attendancesError as { message?: string }).message
          : undefined;

      // 重複データエラーの場合は詳細なエラーメッセージを表示
      if (errorMessage && errorMessage.includes("E02004")) {
        dispatch(setSnackbarError(errorMessage));
      } else {
        // その他のエラーの場合は汎用的なエラーメッセージを表示
        dispatch(setSnackbarError(MESSAGE_CODE.E02001));
      }
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
      (attendance: Attendance) =>
        new ChangeRequest(attendance.changeRequests).getUnapprovedCount() > 0
    );
  }, [attendances]);

  const changeRequestControls = useAdminAttendanceChangeRequests({
    staffId,
    staff,
    staffForMail,
    pendingAttendances,
    refetchAttendances,
    updateAttendance: (input: UpdateAttendanceInput) =>
      updateAttendanceMutation(input).unwrap(),
  });

  const pendingAttendanceControls = useMemo<PendingAttendanceControls>(
    () => ({
      selectedAttendanceIds: changeRequestControls.selectedAttendanceIds,
      isAttendanceSelected: changeRequestControls.isAttendanceSelected,
      toggleAttendanceSelection:
        changeRequestControls.toggleAttendanceSelection,
      toggleSelectAll: changeRequestControls.toggleSelectAllPending,
      bulkApproving: changeRequestControls.bulkApproving,
      canBulkApprove: changeRequestControls.canBulkApprove,
      onBulkApprove: changeRequestControls.handleBulkApprove,
      onOpenQuickView: changeRequestControls.handleOpenQuickView,
    }),
    [
      changeRequestControls.selectedAttendanceIds,
      changeRequestControls.isAttendanceSelected,
      changeRequestControls.toggleAttendanceSelection,
      changeRequestControls.toggleSelectAllPending,
      changeRequestControls.bulkApproving,
      changeRequestControls.canBulkApprove,
      changeRequestControls.handleBulkApprove,
      changeRequestControls.handleOpenQuickView,
    ]
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
    closeDates,
    closeDatesLoading,
    closeDatesError,
    attendances,
    duplicateAttendances,
    attendanceLoading,
    attendancesError,
    pendingAttendances,
    changeRequestControls,
    pendingAttendanceControls,
    getTableRowVariant,
    getBadgeContent,
  } satisfies {
    staff: Staff | undefined | null;
    holidayCalendars: HolidayCalendar[];
    companyHolidayCalendars: CompanyHolidayCalendar[];
    calendarLoading: boolean;
    closeDates: CloseDate[];
    closeDatesLoading: boolean;
    closeDatesError: Error | null;
    attendances: Attendance[];
    duplicateAttendances: typeof duplicateAttendances;
    attendanceLoading: boolean;
    attendancesError: unknown;
    pendingAttendances: Attendance[];
    changeRequestControls: ReturnType<typeof useAdminAttendanceChangeRequests>;
    pendingAttendanceControls: PendingAttendanceControls;
    getTableRowVariant: (
      attendance: Attendance,
      holidayList?: HolidayCalendar[],
      companyHolidayList?: CompanyHolidayCalendar[]
    ) => AttendanceRowVariant;
    getBadgeContent: (attendance: Attendance) => number;
  };
};
