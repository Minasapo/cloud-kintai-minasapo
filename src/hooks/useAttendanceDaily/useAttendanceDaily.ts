import {
  DuplicateAttendanceInfo,
  useLazyGetAttendanceByStaffAndDateQuery,
} from "@entities/attendance/api/attendanceApi";
import { Attendance } from "@shared/api/graphql/types";
import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";

import { AttendanceDate } from "@/lib/AttendanceDate";

import useStaffs from "../useStaffs/useStaffs";

export interface AttendanceDaily {
  sub: string;
  givenName: string;
  familyName: string;
  sortKey: string;
  attendance: Attendance | null;
}

export interface DuplicateAttendanceDaily {
  staffId: string;
  staffName: string;
  workDate: string;
  ids: string[];
}

export default function useAttendanceDaily() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [attendanceDailyList, setAttendanceDailyList] = useState<
    AttendanceDaily[]
  >([]);
  const [duplicateAttendances, setDuplicateAttendances] = useState<
    DuplicateAttendanceDaily[]
  >([]);

  const { staffs, loading: staffLoading, error: staffError } = useStaffs();
  const [triggerGetAttendance] = useLazyGetAttendanceByStaffAndDateQuery();

  const now = dayjs();
  const workDate = now.format(AttendanceDate.DataFormat);

  const fetchAllByWorkDate = useCallback(
    async (targetDate: string) => {
      const duplicateBuffer: DuplicateAttendanceDaily[] = [];

      const results = await Promise.all(
        staffs.map(
          async ({ cognitoUserId, givenName, familyName, sortKey }) => {
            const response = await triggerGetAttendance({
              staffId: cognitoUserId,
              workDate: targetDate,
            });

            if (response.error) {
              throw response.error as Error;
            }

            const attendance =
              "data" in response ? response.data ?? null : null;

            const duplicates = (
              (
                response as {
                  meta?: { duplicates?: DuplicateAttendanceInfo[] };
                }
              ).meta?.duplicates ?? []
            ).filter((d) => d.ids.length > 1 || d.ids.length === 1);

            duplicates.forEach((dup) => {
              duplicateBuffer.push({
                staffId: cognitoUserId,
                staffName: `${familyName} ${givenName}`.trim(),
                workDate: dup.workDate,
                ids: dup.ids,
              });
            });

            return {
              sub: cognitoUserId,
              givenName,
              familyName,
              attendance,
              sortKey: sortKey || "",
            } as AttendanceDaily;
          }
        )
      );

      setAttendanceDailyList(results);
      setDuplicateAttendances(duplicateBuffer);
      return results;
    },
    [staffs, triggerGetAttendance]
  );

  useEffect(() => {
    if (staffLoading || staffError) return;
    if (staffs.length === 0) return;

    setLoading(true);
    setError(null);
    fetchAllByWorkDate(workDate)
      .catch((e: Error) => {
        setError(e);
        throw e;
      })
      .finally(() => {
        setLoading(false);
      });
  }, [staffs, staffLoading, staffError, workDate, fetchAllByWorkDate]);

  return {
    loading,
    error,
    attendanceDailyList,
    duplicateAttendances,
    fetchAllByWorkDate,
  };
}
