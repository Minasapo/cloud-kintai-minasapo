import { useLazyGetAttendanceByStaffAndDateQuery } from "@entities/attendance/api/attendanceApi";
import { AttendanceDateTime } from "@entities/attendance/lib/AttendanceDateTime";
import fetchStaff from "@entities/staff/model/useStaff/fetchStaff";
import { mappingStaffRole, StaffType } from "@entities/staff/model/useStaffs/useStaffs";
import { AttendanceEditInputs, defaultValues, HourlyPaidHolidayTimeInputs, RestInputs, } from "@features/attendance/edit/model/common";
import { Attendance, AttendanceHistory } from "@shared/api/graphql/types";
import { createLogger } from "@shared/lib/logger";
import { pushNotification } from "@shared/lib/store/notificationSlice";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { UseFormReset, UseFormSetValue, } from "react-hook-form";
import { useDispatch } from "react-redux";

import * as MESSAGE_CODE from "@/errors";

const logger = createLogger("AttendanceRecord");
const ATTENDANCE_RECORD_ERROR_MESSAGE = MESSAGE_CODE.E02001;

type ReplaceFn<T> = (value: T[]) => void;
type UseAttendanceRecordParams = {
    targetStaffId?: string;
    targetWorkDate?: string;
    readOnly?: boolean;
    setValue: UseFormSetValue<AttendanceEditInputs>;
    reset: UseFormReset<AttendanceEditInputs>;
    restReplace: ReplaceFn<RestInputs>;
    hourlyPaidHolidayTimeReplace: ReplaceFn<HourlyPaidHolidayTimeInputs>;
};
type FetchStaffResult = Awaited<ReturnType<typeof fetchStaff>>;
const mapFetchedStaffToStaffType = (staff: FetchStaffResult): StaffType => ({
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
});
const hasSameStaffSnapshot = (next: StaffType | null | undefined, prev: StaffType | null | undefined) => {
    if (!next || !prev) {
        return false;
    }
    return (
        next.id === prev.id &&
        next.updatedAt === prev.updatedAt &&
        next.status === prev.status &&
        next.role === prev.role &&
        next.mailAddress === prev.mailAddress
    );
};

function applyHistoryToForm(
    sortedHistories: AttendanceHistory[],
    index: number,
    setValue: UseFormSetValue<AttendanceEditInputs>,
    restReplace: ReplaceFn<RestInputs>,
    hourlyPaidHolidayTimeReplace: ReplaceFn<HourlyPaidHolidayTimeInputs>,
) {
    if (!sortedHistories || !sortedHistories[index]) return false;
    const h = sortedHistories[index];
    setValue("startTime", h.startTime ?? "");
    setValue("endTime", h.endTime ?? "");
    setValue("goDirectlyFlag", h.goDirectlyFlag ?? false);
    setValue("returnDirectlyFlag", h.returnDirectlyFlag ?? false);
    setValue("paidHolidayFlag", h.paidHolidayFlag ?? false);
    setValue("specialHolidayFlag", h.specialHolidayFlag ?? false);
    setValue("remarks", h.remarks ?? "");
    setValue("substituteHolidayDate", h.substituteHolidayDate ?? undefined);
    const rests: RestInputs[] = h.rests
        ? h.rests
            .filter((r): r is NonNullable<typeof r> => r !== null)
            .map((r) => ({
                startTime: r.startTime ?? null,
                endTime: r.endTime ?? null,
            }))
        : [];
    restReplace(rests);
    const hourly: HourlyPaidHolidayTimeInputs[] = h.hourlyPaidHolidayTimes
        ? h.hourlyPaidHolidayTimes
            .filter((r): r is NonNullable<typeof r> => r !== null)
            .map((r) => ({
                startTime: r.startTime ?? null,
                endTime: r.endTime ?? null,
            }))
        : [];
    hourlyPaidHolidayTimeReplace(hourly);
    return true;
}

/**
 * Builds the complete form values from attendance data, merging in the
 * specified history entry when available. This enables a single reset() call
 * on attendance load instead of the previous pattern of reset() followed by
 * multiple setValue() calls, eliminating the redundant dual-effect path.
 */
function buildFormValuesFromAttendanceAndHistory(
    attendance: Attendance,
    sortedHistories: AttendanceHistory[],
    index: number,
): AttendanceEditInputs {
    const initTags: string[] = [];
    if (attendance.paidHolidayFlag) initTags.push("有給休暇");
    if (attendance.specialHolidayFlag) initTags.push("特別休暇");
    if (attendance.absentFlag) initTags.push("欠勤");
    const rests = attendance.rests
        ? attendance.rests
            .filter((item): item is NonNullable<typeof item> => item !== null)
            .map((item) => ({ startTime: item.startTime, endTime: item.endTime }))
        : [];
    const hourlyPaidHolidayTimes = attendance.hourlyPaidHolidayTimes
        ? attendance.hourlyPaidHolidayTimes
            .filter((item): item is NonNullable<typeof item> => item !== null)
            .map((item) => ({ startTime: item.startTime, endTime: item.endTime }))
        : [];
    const histories = attendance.histories
        ? attendance.histories.filter((item): item is NonNullable<typeof item> => item !== null)
        : [];
    const changeRequests = attendance.changeRequests
        ? attendance.changeRequests.filter((item): item is NonNullable<typeof item> => item !== null)
        : [];
    const base: AttendanceEditInputs = {
        workDate: attendance.workDate,
        startTime: attendance.startTime,
        isDeemedHoliday: attendance.isDeemedHoliday ?? false,
        specialHolidayFlag: attendance.specialHolidayFlag ?? false,
        endTime: attendance.endTime,
        remarks: attendance.remarks || "",
        remarkTags: initTags,
        goDirectlyFlag: attendance.goDirectlyFlag || false,
        returnDirectlyFlag: attendance.returnDirectlyFlag || false,
        paidHolidayFlag: attendance.paidHolidayFlag || false,
        absentFlag: attendance.absentFlag || false,
        substituteHolidayDate: attendance.substituteHolidayDate,
        revision: attendance.revision,
        rests,
        hourlyPaidHolidayTimes,
        histories,
        changeRequests,
    };
    if (!sortedHistories.length || !sortedHistories[index]) {
        return base;
    }
    const h = sortedHistories[index];
    return {
        ...base,
        startTime: h.startTime ?? "",
        endTime: h.endTime ?? "",
        goDirectlyFlag: h.goDirectlyFlag ?? false,
        returnDirectlyFlag: h.returnDirectlyFlag ?? false,
        paidHolidayFlag: h.paidHolidayFlag ?? false,
        specialHolidayFlag: h.specialHolidayFlag ?? false,
        remarks: h.remarks ?? "",
        substituteHolidayDate: h.substituteHolidayDate ?? undefined,
        rests: h.rests
            ? h.rests
                .filter((r): r is NonNullable<typeof r> => r !== null)
                .map((r) => ({ startTime: r.startTime ?? null, endTime: r.endTime ?? null }))
            : [],
        hourlyPaidHolidayTimes: h.hourlyPaidHolidayTimes
            ? h.hourlyPaidHolidayTimes
                .filter((r): r is NonNullable<typeof r> => r !== null)
                .map((r) => ({ startTime: r.startTime ?? null, endTime: r.endTime ?? null }))
            : [],
    };
}

export const useAttendanceRecord = ({ targetStaffId, targetWorkDate, readOnly, setValue, reset, restReplace, hourlyPaidHolidayTimeReplace }: UseAttendanceRecordParams) => {
    const dispatch = useDispatch();
    const [triggerGetAttendance, { data: attendanceData }] = useLazyGetAttendanceByStaffAndDateQuery();
    const attendance = attendanceData ?? null;
    const hasAttendanceFetched = attendanceData !== undefined;
    const [staff, setStaff] = useState<StaffType | undefined | null>(undefined);
    const [workDate, setWorkDate] = useState<dayjs.Dayjs | null>(null);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [historiesLoading, setHistoriesLoading] = useState(false);
    const staffCacheRef = useRef<Map<string, StaffType | null>>(new Map());
    const staffRequestIdRef = useRef(0);
    const attendanceRequestIdRef = useRef(0);
    const sortedHistories = useMemo<AttendanceHistory[]>(() => {
        if (!attendance?.histories)
            return [];
        return attendance.histories
            .filter((item): item is NonNullable<typeof item> => item !== null)
            .toSorted((a, b) => dayjs(b.createdAt).isBefore(dayjs(a.createdAt)) ? -1 : 1) as AttendanceHistory[];
    }, [attendance?.histories]);

    // Kept in sync with sortedHistories every render so that applyHistory can
    // read the latest value without listing sortedHistories as a dependency.
    // This prevents the historyIndex effect from re-running on every attendance load.
    const sortedHistoriesRef = useRef<AttendanceHistory[]>([]);
    sortedHistoriesRef.current = sortedHistories;

    const notifyRecordError = useCallback((context: string, error: unknown) => {
        logger.error(context, error);
        dispatch(pushNotification({
            tone: "error",
            message: ATTENDANCE_RECORD_ERROR_MESSAGE,
        }));
    }, [dispatch]);

    // Reads sortedHistories via ref so it does not need sortedHistories in its
    // dependency array; the historyIndex effect will therefore not fire merely
    // because attendance data was (re)loaded.
    const applyHistory = useCallback((index: number) => {
        try {
            return applyHistoryToForm(
                sortedHistoriesRef.current,
                index,
                setValue,
                restReplace,
                hourlyPaidHolidayTimeReplace,
            );
        }
        catch (error) {
            notifyRecordError("Failed to apply history to form", error);
            return false;
        }
    }, [setValue, restReplace, hourlyPaidHolidayTimeReplace, notifyRecordError]);

    // Attendance data loaded or refetched → single atomic form initialization.
    // Combines attendance base fields and history[0] in one reset() call,
    // replacing the previous pattern of two separate effects (one calling
    // initFormFromAttendance and another calling applyHistory) that both ran
    // on every attendance load.
    useEffect(() => {
        if (!attendance) return;
        setWorkDate(AttendanceDateTime.convertToDayjs(attendance.workDate));
        reset(buildFormValuesFromAttendanceAndHistory(attendance, sortedHistoriesRef.current, 0));
        setHistoryIndex(0);
    }, [attendance, reset]);

    // History index changed by the user → apply the selected history entry.
    // sortedHistories is accessed via ref so this effect fires only on explicit
    // historyIndex or readOnly changes, not on attendance (re)loads.
    useEffect(() => {
        const histories = sortedHistoriesRef.current;
        if (histories.length === 0) return;
        const resolvedIndex = readOnly
            ? 0
            : Math.min(Math.max(historyIndex, 0), histories.length - 1);
        if (resolvedIndex !== historyIndex) {
            setHistoryIndex(resolvedIndex);
            return;
        }
        applyHistory(resolvedIndex);
    }, [historyIndex, readOnly, applyHistory]);

    useEffect(() => {
        if (!targetStaffId) {
            setStaff(null);
            return;
        }
        const requestId = staffRequestIdRef.current + 1;
        staffRequestIdRef.current = requestId;
        if (staffCacheRef.current.has(targetStaffId)) {
            setStaff(staffCacheRef.current.get(targetStaffId) ?? null);
        }
        else {
            setStaff(undefined);
        }
        fetchStaff(targetStaffId)
            .then((res) => {
                if (staffRequestIdRef.current !== requestId) {
                    return;
                }
                const nextStaff = mapFetchedStaffToStaffType(res);
                const prevStaff = staffCacheRef.current.get(targetStaffId) ?? null;
                staffCacheRef.current.set(targetStaffId, nextStaff);
                if (hasSameStaffSnapshot(nextStaff, prevStaff)) {
                    return;
                }
                setStaff(nextStaff);
            })
            .catch((error) => {
                logger.error(`Failed to fetch staff with ID ${targetStaffId}`, error);
                if (staffRequestIdRef.current !== requestId) {
                    return;
                }
                staffCacheRef.current.delete(targetStaffId);
                setStaff(null);
                dispatch(pushNotification({
                    tone: "error",
                    message: ATTENDANCE_RECORD_ERROR_MESSAGE,
                }));
            });
    }, [dispatch, targetStaffId]);

    useEffect(() => {
        if (!staff || !targetStaffId || !targetWorkDate)
            return;
        setWorkDate(AttendanceDateTime.convertToDayjs(targetWorkDate));
        const requestId = attendanceRequestIdRef.current + 1;
        attendanceRequestIdRef.current = requestId;
        setHistoriesLoading(true);
        triggerGetAttendance({
            staffId: staff.cognitoUserId,
            workDate: new AttendanceDateTime()
                .setDateString(targetWorkDate)
                .toDataFormat(),
        })
            .unwrap()
            .then((result) => {
                if (attendanceRequestIdRef.current !== requestId) {
                    return;
                }
                if (!result) {
                    reset({
                        ...defaultValues,
                        workDate: new AttendanceDateTime()
                            .setDateString(targetWorkDate)
                            .toDataFormat(),
                        histories: [],
                        changeRequests: [],
                        revision: undefined,
                    });
                }
            })
            .catch((error) => {
                if (attendanceRequestIdRef.current !== requestId) {
                    return;
                }
                notifyRecordError("Failed to fetch attendance", error);
            })
            .finally(() => {
                if (attendanceRequestIdRef.current === requestId) {
                    setHistoriesLoading(false);
                }
            });
    }, [
        staff,
        targetStaffId,
        targetWorkDate,
        triggerGetAttendance,
        notifyRecordError,
        reset,
    ]);

    const refetchAttendance = useCallback(async () => {
        if (!staff || !targetWorkDate)
            return;
        setHistoriesLoading(true);
        try {
            await triggerGetAttendance({
                staffId: staff.cognitoUserId,
                workDate: new AttendanceDateTime()
                    .setDateString(targetWorkDate)
                    .toDataFormat(),
            }).unwrap();
        }
        catch (error) {
            notifyRecordError("Failed to refetch attendance after update", error);
        }
        finally {
            setHistoriesLoading(false);
        }
    }, [staff, targetWorkDate, triggerGetAttendance, notifyRecordError]);
    return {
        attendance,
        staff,
        workDate,
        historiesLoading,
        sortedHistories,
        historyIndex,
        setHistoryIndex,
        applyHistory,
        refetchAttendance,
        hasAttendanceFetched,
    };
};
