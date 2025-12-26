import {
  DuplicateAttendanceInfo,
  useLazyGetAttendanceByStaffAndDateQuery,
} from "@entities/attendance/api/attendanceApi";
import { Attendance } from "@shared/api/graphql/types";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { useCallback, useEffect, useRef, useState } from "react";

import { AttendanceDate } from "@/lib/AttendanceDate";

import useStaffs from "../useStaffs/useStaffs";

dayjs.extend(isBetween);

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

/**
 * 年月をキーとするロード済み月データの管理
 */
interface MonthlyAttendanceData {
  attendanceList: AttendanceDaily[];
  duplicateAttendances: DuplicateAttendanceDaily[];
  loadedAt: number;
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

  // 複数月のデータをキャッシュ（年月をキーとする）
  const monthlyDataCache = useRef<Record<string, MonthlyAttendanceData>>({});

  const { staffs, loading: staffLoading, error: staffError } = useStaffs();
  const [triggerGetAttendance] = useLazyGetAttendanceByStaffAndDateQuery();

  /**
   * 年月をYYYY-MMフォーマットで取得
   */
  const getMonthKey = useCallback((dateStr: string) => {
    return dayjs(dateStr).format("YYYY-MM");
  }, []);

  /**
   * 指定日付から月の最初の日を取得
   */
  const getFirstDayOfMonth = useCallback((dateStr: string) => {
    return dayjs(dateStr).startOf("month").format(AttendanceDate.DataFormat);
  }, []);

  /**
   * 指定月のデータをロード（複数月対応）
   * まだロードされていない月があれば追加ロード
   */
  const loadAttendanceDataByMonth = useCallback(
    async (targetDate: string) => {
      const monthKey = getMonthKey(targetDate);
      const firstDayOfMonth = getFirstDayOfMonth(targetDate);
      const lastDayOfMonth = dayjs(targetDate)
        .endOf("month")
        .format(AttendanceDate.DataFormat);

      // キャッシュに存在するかチェック
      if (monthlyDataCache.current[monthKey]) {
        const cached = monthlyDataCache.current[monthKey];
        setAttendanceDailyList(cached.attendanceList);
        setDuplicateAttendances(cached.duplicateAttendances);
        return;
      }

      // キャッシュにないので新たにロード
      setLoading(true);
      setError(null);

      try {
        const duplicateBuffer: DuplicateAttendanceDaily[] = [];

        const results = await Promise.all(
          staffs.map(
            async ({ cognitoUserId, givenName, familyName, sortKey }) => {
              const response = await triggerGetAttendance({
                staffId: cognitoUserId,
                workDate: firstDayOfMonth,
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
                // 月範囲内のみを対象
                if (
                  dayjs(dup.workDate).isBetween(
                    dayjs(firstDayOfMonth),
                    dayjs(lastDayOfMonth),
                    null,
                    "[]"
                  )
                ) {
                  duplicateBuffer.push({
                    staffId: cognitoUserId,
                    staffName: `${familyName} ${givenName}`.trim(),
                    workDate: dup.workDate,
                    ids: dup.ids,
                  });
                }
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

        // キャッシュに保存
        monthlyDataCache.current[monthKey] = {
          attendanceList: results,
          duplicateAttendances: duplicateBuffer,
          loadedAt: Date.now(),
        };

        setAttendanceDailyList(results);
        setDuplicateAttendances(duplicateBuffer);
      } catch (e: Error | unknown) {
        const error = e instanceof Error ? e : new Error(String(e));
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [staffs, triggerGetAttendance, getMonthKey, getFirstDayOfMonth]
  );

  // 初期化：当月と前月を自動ロード
  useEffect(() => {
    if (staffLoading || staffError) return;
    if (staffs.length === 0) return;

    // 当月と前月をロード
    const now = dayjs();
    const currentMonth = now.format(AttendanceDate.DataFormat);
    const previousMonth = now
      .subtract(1, "month")
      .format(AttendanceDate.DataFormat);

    // staffsが変わった場合はキャッシュをクリア
    monthlyDataCache.current = {};

    (async () => {
      try {
        // 前月をロード
        await loadAttendanceDataByMonth(previousMonth);
        // 当月をロード
        await loadAttendanceDataByMonth(currentMonth);
      } catch (e) {
        console.error("Failed to load initial attendance data", e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staffs.length, staffLoading, staffError]);

  return {
    loading,
    error,
    attendanceDailyList,
    duplicateAttendances,
    loadAttendanceDataByMonth,
  };
}
