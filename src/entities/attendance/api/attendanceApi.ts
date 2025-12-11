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
          const ids = attendances.map((attendance) => attendance.id).join(", ");
          return {
            error: {
              message: `Multiple attendances found with IDs: ${ids}`,
            },
          };
        }

        return { data: attendances[0] };
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
    listRecentAttendances: builder.query<
      Attendance[],
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

        return {
          data: dateList.map((targetDate) => {
            const match = fetchedAttendances.find(
              (attendance) => attendance.workDate === targetDate
            );

            return buildAttendanceForList(targetDate, match ?? null);
          }),
        };
      },
      providesTags: (result) => {
        const listTag = { type: "Attendance" as const, id: "LIST" };
        if (!result) {
          return [listTag];
        }

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
  useListRecentAttendancesQuery,
  useLazyListRecentAttendancesQuery,
  useCreateAttendanceMutation,
  useUpdateAttendanceMutation,
} = attendanceApi;
