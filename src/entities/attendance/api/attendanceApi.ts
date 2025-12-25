import { createApi } from "@reduxjs/toolkit/query/react";
import {
  createAttendance,
  updateAttendance,
} from "@shared/api/graphql/documents/mutations";
import {
  attendancesByStaffId,
  getAttendance,
} from "@shared/api/graphql/documents/queries";
import { graphqlBaseQuery } from "@shared/api/graphql/graphqlBaseQuery";
import type {
  Attendance,
  AttendanceHistory,
  AttendanceHistoryInput,
  AttendancesByStaffIdQuery,
  CreateAttendanceInput,
  CreateAttendanceMutation,
  GetAttendanceQuery,
  HourlyPaidHolidayTimeInput,
  RestInput,
  UpdateAttendanceInput,
  UpdateAttendanceMutation,
} from "@shared/api/graphql/types";
import dayjs from "dayjs";

import { AttendanceDate } from "@/lib/AttendanceDate";
import { AttendanceDateTime } from "@/lib/AttendanceDateTime";
import { E02004 } from "@/errors";

// 重複データの詳細情報
export type DuplicateAttendanceInfo = {
  workDate: string;
  ids: string[];
  staffId?: string;
};

// 警告情報を含むレスポンス型
export type AttendanceListResponse = {
  attendances: Attendance[];
  warnings?: string[];
  duplicates?: DuplicateAttendanceInfo[];
};

// 重複データ警告を通知するカスタムイベント
const dispatchDuplicateWarning = (message: string) => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("attendance-duplicate-warning", {
        detail: { message },
      })
    );
  }
};

const nonNullable = <T>(value: T | null | undefined): value is T =>
  value !== null && value !== undefined;

const sanitizeRests = (
  rests?: Array<{
    startTime?: string | null;
    endTime?: string | null;
  } | null> | null
): RestInput[] =>
  rests?.filter(nonNullable).map(({ startTime, endTime }) => ({
    startTime: startTime ?? undefined,
    endTime: endTime ?? undefined,
  })) ?? [];

const sanitizeHourlyPaidHolidayTimes = (
  hourlyTimes?: Array<{
    startTime?: string | null;
    endTime?: string | null;
  } | null> | null
): HourlyPaidHolidayTimeInput[] =>
  hourlyTimes
    ?.filter(nonNullable)
    .reduce<HourlyPaidHolidayTimeInput[]>((acc, { startTime, endTime }) => {
      if (startTime && endTime) {
        acc.push({ startTime, endTime });
      }

      return acc;
    }, []) ?? [];

const buildAttendanceHistoryInput = (
  attendance: Attendance,
  createdAt: string
): AttendanceHistoryInput => ({
  staffId: attendance.staffId,
  workDate: attendance.workDate,
  startTime: attendance.startTime,
  endTime: attendance.endTime,
  goDirectlyFlag: attendance.goDirectlyFlag,
  absentFlag: attendance.absentFlag,
  returnDirectlyFlag: attendance.returnDirectlyFlag,
  rests: sanitizeRests(attendance.rests ?? []),
  hourlyPaidHolidayTimes: sanitizeHourlyPaidHolidayTimes(
    attendance.hourlyPaidHolidayTimes ?? []
  ),
  remarks: attendance.remarks,
  paidHolidayFlag: attendance.paidHolidayFlag,
  specialHolidayFlag: attendance.specialHolidayFlag,
  hourlyPaidHolidayHours: attendance.hourlyPaidHolidayHours,
  substituteHolidayDate: attendance.substituteHolidayDate,
  createdAt,
});

const cloneExistingHistory = (
  history: AttendanceHistory
): AttendanceHistoryInput => ({
  staffId: history.staffId,
  workDate: history.workDate,
  startTime: history.startTime,
  endTime: history.endTime,
  goDirectlyFlag: history.goDirectlyFlag,
  absentFlag: history.absentFlag,
  returnDirectlyFlag: history.returnDirectlyFlag,
  rests: sanitizeRests(history.rests ?? []),
  hourlyPaidHolidayTimes: sanitizeHourlyPaidHolidayTimes(
    history.hourlyPaidHolidayTimes ?? []
  ),
  remarks: history.remarks,
  paidHolidayFlag: history.paidHolidayFlag,
  specialHolidayFlag: history.specialHolidayFlag,
  hourlyPaidHolidayHours: history.hourlyPaidHolidayHours,
  substituteHolidayDate: history.substituteHolidayDate,
  createdAt: history.createdAt,
});

const buildAttendanceForList = (
  targetDate: string,
  matchAttendance?: Attendance | null
): Attendance => ({
  __typename: "Attendance",
  id: matchAttendance?.id ?? "",
  staffId: matchAttendance?.staffId ?? "",
  workDate: targetDate,
  startTime: matchAttendance?.startTime ?? "",
  endTime: matchAttendance?.endTime ?? "",
  absentFlag: matchAttendance?.absentFlag ?? false,
  goDirectlyFlag: matchAttendance?.goDirectlyFlag ?? false,
  returnDirectlyFlag: matchAttendance?.returnDirectlyFlag ?? false,
  rests: matchAttendance?.rests ?? [],
  remarks: matchAttendance?.remarks ?? "",
  paidHolidayFlag: matchAttendance?.paidHolidayFlag ?? false,
  specialHolidayFlag: matchAttendance?.specialHolidayFlag ?? false,
  isDeemedHoliday: matchAttendance?.isDeemedHoliday ?? false,
  substituteHolidayDate: matchAttendance?.substituteHolidayDate,
  changeRequests: matchAttendance?.changeRequests
    ? matchAttendance.changeRequests.filter(nonNullable)
    : [],
  createdAt: matchAttendance?.createdAt ?? "",
  updatedAt: matchAttendance?.updatedAt ?? "",
});

const buildAttendanceCacheId = (staffId: string, workDate: string) =>
  `${staffId}:${workDate}`;

export const attendanceApi = createApi({
  reducerPath: "attendanceApi",
  baseQuery: graphqlBaseQuery(),
  tagTypes: ["Attendance"],
  endpoints: (builder) => ({
    getAttendanceByStaffAndDate: builder.query<
      Attendance | null,
      { staffId: string; workDate: string }
    >({
      async queryFn(
        { staffId, workDate },
        _queryApi,
        _extraOptions,
        baseQuery
      ) {
        const attendances: Attendance[] = [];
        const duplicateDetails: DuplicateAttendanceInfo[] = [];
        const duplicateWarnings: string[] = [];
        let nextToken: string | null = null;

        do {
          const result = await baseQuery({
            document: attendancesByStaffId,
            variables: {
              staffId,
              workDate: {
                eq: workDate,
              },
              nextToken,
            },
          });

          if (result.error) {
            return { error: result.error };
          }

          const data = result.data as AttendancesByStaffIdQuery | null;
          const connection = data?.attendancesByStaffId;

          if (!connection) {
            return { error: { message: "Failed to fetch attendance" } };
          }

          attendances.push(...connection.items.filter(nonNullable));

          nextToken = connection.nextToken ?? null;
        } while (nextToken);

        if (attendances.length === 0) {
          return { data: null };
        }

        if (attendances.length > 1) {
          duplicateWarnings.push(E02004);
          duplicateDetails.push({
            workDate,
            ids: attendances.map((attendance) => attendance.id).filter(Boolean),
            staffId,
          });
          // コンソールに警告を出力し、カスタムイベントで通知
          console.warn(E02004);
          dispatchDuplicateWarning(E02004);
        }

        return {
          data: attendances[0],
          meta:
            duplicateWarnings.length > 0
              ? { warnings: duplicateWarnings, duplicates: duplicateDetails }
              : undefined,
        };
      },
      providesTags: (result, _error, arg) => {
        if (!result) {
          return [
            {
              type: "Attendance" as const,
              id: buildAttendanceCacheId(arg.staffId, arg.workDate),
            },
          ];
        }

        return [
          {
            type: "Attendance" as const,
            id: result.id || buildAttendanceCacheId(arg.staffId, arg.workDate),
          },
        ];
      },
    }),
    getAttendanceById: builder.query<Attendance | null, { id: string }>({
      async queryFn({ id }, _queryApi, _extraOptions, baseQuery) {
        const result = await baseQuery({
          document: getAttendance,
          variables: { id },
        });

        if (result.error) {
          return { error: result.error };
        }

        const data = result.data as GetAttendanceQuery | null;
        return { data: data?.getAttendance ?? null };
      },
      providesTags: (result, _error, arg) => [
        {
          type: "Attendance" as const,
          id: result?.id || arg.id,
        },
      ],
    }),
    listRecentAttendances: builder.query<
      AttendanceListResponse,
      { staffId: string; days?: number }
    >({
      async queryFn(
        { staffId, days = 30 },
        _queryApi,
        _extraOptions,
        baseQuery
      ) {
        const safeDays = Math.max(1, days);
        const now = dayjs();
        const dateList = Array.from({ length: safeDays }, (_, index) =>
          now.subtract(index, "day").format(AttendanceDate.DataFormat)
        ).sort();

        const result = await baseQuery({
          document: attendancesByStaffId,
          variables: {
            staffId,
            workDate: {
              between: [dateList[0], dateList[dateList.length - 1]],
            },
          },
        });

        if (result.error) {
          return { error: result.error };
        }

        const data = result.data as AttendancesByStaffIdQuery | null;
        const connection = data?.attendancesByStaffId;

        if (!connection) {
          return { error: { message: "Failed to fetch attendance" } };
        }

        const fetchedAttendances = connection.items.filter(nonNullable);

        const duplicateCheck = new Map<string, Attendance[]>();
        const duplicateWarnings: string[] = [];
        const duplicateDetails: DuplicateAttendanceInfo[] = [];

        fetchedAttendances.forEach((attendance) =>
          duplicateCheck.set(attendance.workDate, [
            ...(duplicateCheck.get(attendance.workDate) ?? []),
            attendance,
          ])
        );

        for (const attendances of duplicateCheck.values()) {
          if (attendances.length > 1) {
            duplicateWarnings.push(E02004);
            duplicateDetails.push({
              workDate: attendances[0]?.workDate ?? "",
              ids: attendances
                .map((attendance) => attendance.id)
                .filter(Boolean),
              staffId,
            });
            dispatchDuplicateWarning(E02004);
          }
        }

        const attendanceList = dateList.map((targetDate) => {
          const matches = duplicateCheck.get(targetDate) ?? [];
          const match = matches[0] ?? null;

          return buildAttendanceForList(targetDate, match);
        });

        return {
          data: {
            attendances: attendanceList,
            warnings:
              duplicateWarnings.length > 0 ? duplicateWarnings : undefined,
            duplicates:
              duplicateDetails.length > 0 ? duplicateDetails : undefined,
          },
        };
      },
      providesTags: (result) => {
        const listTag = { type: "Attendance" as const, id: "LIST" };
        const attendances = result?.attendances ?? [];
        if (!attendances.length) {
          return [listTag];
        }

        return [
          listTag,
          ...attendances.map((attendance) => ({
            type: "Attendance" as const,
            id:
              attendance.id ||
              buildAttendanceCacheId(attendance.staffId, attendance.workDate),
          })),
        ];
      },
    }),
    listRecentAttendancesWithWarnings: builder.query<
      AttendanceListResponse,
      { staffId: string; days?: number }
    >({
      async queryFn(
        { staffId, days = 30 },
        _queryApi,
        _extraOptions,
        baseQuery
      ) {
        const safeDays = Math.max(1, days);
        const now = dayjs();
        const dateList = Array.from({ length: safeDays }, (_, index) =>
          now.subtract(index, "day").format(AttendanceDate.DataFormat)
        ).sort();

        const result = await baseQuery({
          document: attendancesByStaffId,
          variables: {
            staffId,
            workDate: {
              between: [dateList[0], dateList[dateList.length - 1]],
            },
          },
        });

        if (result.error) {
          return { error: result.error };
        }

        const data = result.data as AttendancesByStaffIdQuery | null;
        const connection = data?.attendancesByStaffId;

        if (!connection) {
          return { error: { message: "Failed to fetch attendance" } };
        }

        const fetchedAttendances = connection.items.filter(nonNullable);

        // 重複チェック: 同一日付に複数のレコードがないか確認
        const duplicateCheck = new Map<string, Attendance[]>();
        const duplicateWarnings: string[] = [];
        const duplicateDetails: DuplicateAttendanceInfo[] = [];
        fetchedAttendances.forEach((attendance) => {
          const existing = duplicateCheck.get(attendance.workDate) ?? [];
          existing.push(attendance);
          duplicateCheck.set(attendance.workDate, existing);
        });

        // 重複が見つかった場合、警告メッセージを生成（エラーとしては返さない）
        for (const attendances of duplicateCheck.values()) {
          if (attendances.length > 1) {
            duplicateWarnings.push(E02004);
            duplicateDetails.push({
              workDate: attendances[0]?.workDate ?? "",
              ids: attendances
                .map((attendance) => attendance.id)
                .filter(Boolean),
              staffId,
            });
            // カスタムイベントで通知
            dispatchDuplicateWarning(E02004);
          }
        }

        // 重複があっても最初のレコードを使用してデータを返す
        const attendanceList = dateList.map((targetDate) => {
          const matches = duplicateCheck.get(targetDate) ?? [];
          // 最初のレコードを使用
          const match = matches[0] ?? null;

          return buildAttendanceForList(targetDate, match);
        });

        // 警告がある場合は、警告情報を含めて返す
        return {
          data: {
            attendances: attendanceList,
            warnings:
              duplicateWarnings.length > 0 ? duplicateWarnings : undefined,
            duplicates:
              duplicateDetails.length > 0 ? duplicateDetails : undefined,
          },
        };
      },
      providesTags: (result) => {
        const listTag = { type: "Attendance" as const, id: "LIST" };
        if (!result || !result.attendances) {
          return [listTag];
        }

        return [
          listTag,
          ...result.attendances.map((attendance) => ({
            type: "Attendance" as const,
            id:
              attendance.id ||
              buildAttendanceCacheId(attendance.staffId, attendance.workDate),
          })),
        ];
      },
    }),
    listAttendancesByDateRange: builder.query<
      Attendance[],
      { staffId: string; startDate: string; endDate: string }
    >({
      async queryFn(
        { staffId, startDate, endDate },
        _queryApi,
        _extraOptions,
        baseQuery
      ) {
        const attendances: Attendance[] = [];
        let nextToken: string | null = null;

        do {
          const result = await baseQuery({
            document: attendancesByStaffId,
            variables: {
              staffId,
              workDate: {
                between: [startDate, endDate],
              },
              sortDirection: "ASC",
              nextToken,
            },
          });

          if (result.error) {
            return { error: result.error };
          }

          const data = result.data as AttendancesByStaffIdQuery | null;
          const connection = data?.attendancesByStaffId;

          if (!connection) {
            return { error: { message: "Failed to fetch attendance" } };
          }

          attendances.push(...connection.items.filter(nonNullable));
          nextToken = connection.nextToken ?? null;
        } while (nextToken);

        // 重複チェック: 同一日付に複数のレコードがないか確認
        const duplicateCheck = new Map<string, Attendance[]>();
        const duplicateWarnings: string[] = [];
        const duplicateDetails: DuplicateAttendanceInfo[] = [];
        attendances.forEach((attendance) => {
          const existing = duplicateCheck.get(attendance.workDate) ?? [];
          existing.push(attendance);
          duplicateCheck.set(attendance.workDate, existing);
        });

        // 重複が見つかった場合、警告メッセージを生成（エラーとしては返さない）
        for (const attendancesForDate of duplicateCheck.values()) {
          if (attendancesForDate.length > 1) {
            duplicateWarnings.push(E02004);
            duplicateDetails.push({
              workDate: attendancesForDate[0]?.workDate ?? "",
              ids: attendancesForDate
                .map((attendance) => attendance.id)
                .filter(Boolean),
              staffId,
            });
            // カスタムイベントで通知
            dispatchDuplicateWarning(E02004);
          }
        }

        // 重複があっても最初のレコードだけを返す
        const uniqueAttendances = Array.from(duplicateCheck.values()).map(
          (attendancesForDate) => attendancesForDate[0]
        );

        // 警告がある場合は、meta情報として返す
        if (duplicateWarnings.length > 0) {
          return {
            data: uniqueAttendances,
            meta: {
              warnings: duplicateWarnings,
              duplicates: duplicateDetails,
            },
          };
        }

        return { data: uniqueAttendances };
      },
      providesTags: (result, _error, arg) => {
        const listTag = {
          type: "Attendance" as const,
          id: `RANGE-${arg.startDate}-${arg.endDate}`,
        };

        if (!result) return [listTag];

        return [
          listTag,
          ...result.map((attendance) => ({
            type: "Attendance" as const,
            id:
              attendance.id ||
              buildAttendanceCacheId(attendance.staffId, attendance.workDate),
          })),
        ];
      },
    }),
    createAttendance: builder.mutation<Attendance, CreateAttendanceInput>({
      async queryFn(input, _queryApi, _extraOptions, baseQuery) {
        const payload: CreateAttendanceInput = {
          ...input,
          revision: 1,
        };

        const result = await baseQuery({
          document: createAttendance,
          variables: { input: payload },
        });

        if (result.error) {
          return { error: result.error };
        }

        const data = result.data as CreateAttendanceMutation | null;
        const createdAttendance = data?.createAttendance;

        if (!createdAttendance) {
          return { error: { message: "Failed to create attendance" } };
        }

        return { data: createdAttendance };
      },
      invalidatesTags: (result) => {
        const listTag = { type: "Attendance" as const, id: "LIST" };
        if (!result) {
          return [listTag];
        }

        return [
          listTag,
          {
            type: "Attendance" as const,
            id:
              result.id ||
              buildAttendanceCacheId(result.staffId, result.workDate),
          },
        ];
      },
    }),
    updateAttendance: builder.mutation<Attendance, UpdateAttendanceInput>({
      async queryFn(input, _queryApi, _extraOptions, baseQuery) {
        const currentResult = await baseQuery({
          document: getAttendance,
          variables: { id: input.id },
        });

        if (currentResult.error) {
          return { error: currentResult.error };
        }

        const currentData = currentResult.data as GetAttendanceQuery | null;
        const currentAttendance = currentData?.getAttendance;

        if (!currentAttendance) {
          return { error: { message: "Failed to load current attendance" } };
        }

        const currentRevision = currentAttendance.revision ?? 1;
        const inputRevision = input.revision ?? currentRevision;

        if (currentRevision !== inputRevision) {
          return { error: { message: "Revision mismatch" } };
        }

        const createdAt = new AttendanceDateTime().toISOString();
        const historyFromCurrent = buildAttendanceHistoryInput(
          currentAttendance,
          createdAt
        );

        const existingHistories = currentAttendance.histories
          ? currentAttendance.histories
              .filter(nonNullable)
              .map(cloneExistingHistory)
          : [];

        const payload: UpdateAttendanceInput = {
          ...input,
          revision: inputRevision + 1,
          histories: [...existingHistories, historyFromCurrent],
        };

        const result = await baseQuery({
          document: updateAttendance,
          variables: { input: payload },
        });

        if (result.error) {
          return { error: result.error };
        }

        const data = result.data as UpdateAttendanceMutation | null;
        const updatedAttendance = data?.updateAttendance;

        if (!updatedAttendance) {
          return { error: { message: "Failed to update attendance" } };
        }

        return { data: updatedAttendance };
      },
      invalidatesTags: (result) => {
        const listTag = { type: "Attendance" as const, id: "LIST" };
        if (!result) {
          return [listTag];
        }

        return [
          listTag,
          {
            type: "Attendance" as const,
            id:
              result.id ||
              buildAttendanceCacheId(result.staffId, result.workDate),
          },
        ];
      },
    }),
  }),
});

export const {
  useGetAttendanceByStaffAndDateQuery,
  useLazyGetAttendanceByStaffAndDateQuery,
  useGetAttendanceByIdQuery,
  useLazyGetAttendanceByIdQuery,
  useListAttendancesByDateRangeQuery,
  useListRecentAttendancesQuery,
  useLazyListRecentAttendancesQuery,
  useListRecentAttendancesWithWarningsQuery,
  useCreateAttendanceMutation,
  useUpdateAttendanceMutation,
} = attendanceApi;
