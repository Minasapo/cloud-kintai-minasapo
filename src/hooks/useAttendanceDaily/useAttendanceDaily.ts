import { useLazyGetAttendanceByStaffAndDateQuery } from "@entities/attendance/api/attendanceApi";
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

export default function useAttendanceDaily() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [attendanceDailyList, setAttendanceDailyList] = useState<
    AttendanceDaily[]
  >([]);

  const { staffs, loading: staffLoading, error: staffError } = useStaffs();
  const [triggerGetAttendance] = useLazyGetAttendanceByStaffAndDateQuery();

  const now = dayjs();
  const workDate = now.format(AttendanceDate.DataFormat);

  const fetchAllByWorkDate = useCallback(
    async (targetDate: string) => {
      const results = await Promise.all(
        staffs.map(
          async ({ cognitoUserId, givenName, familyName, sortKey }) => {
            const attendance = await triggerGetAttendance({
              staffId: cognitoUserId,
              workDate: targetDate,
            }).unwrap();

            return {
              sub: cognitoUserId,
              givenName,
              familyName,
              attendance: attendance ?? null,
              sortKey: sortKey || "",
            } as AttendanceDaily;
          }
        )
      );

      setAttendanceDailyList(results);
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
    fetchAllByWorkDate,
  };
}
