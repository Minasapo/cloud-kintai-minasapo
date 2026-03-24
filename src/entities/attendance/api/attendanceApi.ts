import { createApi } from "@reduxjs/toolkit/query/react";
import { upsertAttendanceByStaffAndDate as upsertAttendanceByStaffAndDateDocument } from "@shared/api/graphql/documents/customMutations";
import {
  createAttendance,
  deleteAttendance as deleteAttendanceDocument,
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

import { AttendanceDate } from "@/entities/attendance/lib/AttendanceDate";
import { AttendanceDateTime } from "@/entities/attendance/lib/AttendanceDateTime";
import { E02004 } from "@/errors";
import {
  buildRevisionCondition,
  isConditionalCheckFailed,
} from "@/shared/api/graphql/concurrency";

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

export const ATTENDANCE_DUPLICATE_CONFLICT = "ATTENDANCE_DUPLICATE_CONFLICT";
export const ATTENDANCE_REVISION_CONFLICT = "ATTENDANCE_REVISION_CONFLICT";

export type AttendanceUpsertAction =
  | "clock_in"
  | "clock_out"
  | "go_directly"
  | "return_directly"
  | "rest_start"
  | "rest_end"
  | "manual";

export type UpsertAttendanceByStaffAndDateInput = {
  input: CreateAttendanceInput;
  action: AttendanceUpsertAction;
  occurredAt: string;
  idempotencyKey: string;
};

type UpsertAttendanceByStaffAndDateMutation = {
  upsertAttendanceByStaffAndDate?: Attendance | null;
};

// 重複データ警告を通知するカスタムイベント
const dispatchDuplicateWarning = (message: string) => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("attendance-duplicate-warning", {
        detail: { message },
      }),
    );
  }
};

const nonNullable = <T>(value: T | null | undefined): value is T =>
  value !== null && value !== undefined;

// Exported for testing
export const sanitizeRests = (
  rests?: Array<{
    startTime?: string | null;
    endTime?: string | null;
  } | null> | null,
): RestInput[] =>
  rests?.filter(nonNullable).map(({ startTime, endTime }) => ({
    startTime: startTime ?? undefined,
    endTime: endTime ?? undefined,
  })) ?? [];

// Exported for testing
export const sanitizeHourlyPaidHolidayTimes = (
  hourlyTimes?: Array<{
    startTime?: string | null;
    endTime?: string | null;
  } | null> | null,
): HourlyPaidHolidayTimeInput[] =>
  hourlyTimes
    ?.filter(nonNullable)
    .reduce<HourlyPaidHolidayTimeInput[]>((acc, { startTime, endTime }) => {
      if (startTime && endTime) {
        acc.push({ startTime, endTime });
      }

      return acc;
    }, []) ?? [];

// Exported for testing
export const buildAttendanceHistoryInput = (
  attendance: Attendance,
  createdAt: string,
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
    attendance.hourlyPaidHolidayTimes ?? [],
  ),
  remarks: attendance.remarks,
  paidHolidayFlag: attendance.paidHolidayFlag,
  specialHolidayFlag: attendance.specialHolidayFlag,
  hourlyPaidHolidayHours: attendance.hourlyPaidHolidayHours,
  substituteHolidayDate: attendance.substituteHolidayDate,
  createdAt,
});

const cloneExistingHistory = (
  history: AttendanceHistory,
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
    history.hourlyPaidHolidayTimes ?? [],
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
  matchAttendance?: Attendance | null,
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

const buildAttendanceRecordId = (staffId: string, workDate: string) =>
  `attendance#${staffId}#${workDate}`;

const buildStaffWorkDateKey = (staffId: string, workDate: string) =>
  `${staffId}#${workDate}`;

type AttendanceQueryError = {
  message: string;
  details?: unknown;
};

type AttendanceWriteInputExtras = {
  staffWorkDateKey?: string;
};

type AttendanceBaseQuery = (arg: {
  document: string;
  variables?: Record<string, unknown>;
  authMode?: string;
}) =>
  | {
      data?: unknown;
      error?: unknown;
    }
  | PromiseLike<{
      data?: unknown;
      error?: unknown;
    }>;

const collectErrorMessages = (value: unknown): string[] => {
  if (!value || typeof value !== "object") {
    return [];
  }

  const messages: string[] = [];
  const record = value as {
    message?: unknown;
    errors?: unknown;
    details?: unknown;
  };

  if (typeof record.message === "string" && record.message.length > 0) {
    messages.push(record.message);
  }

  if (Array.isArray(record.errors)) {
    record.errors.forEach((item) => {
      if (
        item &&
        typeof item === "object" &&
        "message" in item &&
        typeof (item as { message?: unknown }).message === "string"
      ) {
        messages.push((item as { message: string }).message);
      } else if (typeof item === "string") {
        messages.push(item);
      }
    });
  }

  if (record.details) {
    if (typeof record.details === "string") {
      messages.push(record.details);
    } else if (typeof record.details === "object") {
      messages.push(...collectErrorMessages(record.details));
    }
  }

  return messages;
};

const extractErrorText = (error: unknown) => {
  const messages = new Set<string>();
  if (error instanceof Error && error.message) {
    messages.add(error.message);
  }

  collectErrorMessages(error).forEach((message) => {
    if (message) {
      messages.add(message);
    }
  });

  return Array.from(messages).join(" ");
};

const UPSERT_SCHEMA_UNSUPPORTED_PATTERNS = [
  "Cannot query field",
  "FieldUndefined",
  "Unknown type",
  "UnknownType",
  "Validation error",
  "upsertAttendanceByStaffAndDate",
  "UpsertAttendanceByStaffAndDateInput",
  "No resolver",
  "Resolver not found",
  "Cannot return null for non-nullable type",
];

const canFallbackToClientUpsert = (error: unknown) => {
  const serverErrorText = extractErrorText(error);
  return UPSERT_SCHEMA_UNSUPPORTED_PATTERNS.some((pattern) =>
    serverErrorText.includes(pattern),
  );
};

const ATTENDANCE_WRITE_INPUT_UNKNOWN_FIELD_PATTERNS = [
  "contains a field not in 'CreateAttendanceInput'",
  "contains field not in CreateAttendanceInput",
  "not defined for input object type 'CreateAttendanceInput'",
  "contains a field not in 'UpdateAttendanceInput'",
  "contains field not in UpdateAttendanceInput",
  "not defined for input object type 'UpdateAttendanceInput'",
  "contains a field that is not defined for input object type",
  "staffWorkDateKey",
  "Unknown field",
  "FieldUndefined",
  "Validation error of type UndefinedField",
];

const isUnknownAttendanceWriteFieldError = (error: unknown) => {
  const message = extractErrorText(error).toLowerCase();
  return ATTENDANCE_WRITE_INPUT_UNKNOWN_FIELD_PATTERNS.some((pattern) =>
    message.includes(pattern.toLowerCase()),
  );
};

const stripStaffWorkDateKey = <T extends Record<string, unknown>>(input: T): T => {
  if (!Object.prototype.hasOwnProperty.call(input, "staffWorkDateKey")) {
    return input;
  }

  const { staffWorkDateKey: _ignored, ...rest } = input as T & {
    staffWorkDateKey?: unknown;
  };
  return rest as T;
};

const runCreateAttendanceMutation = async (
  baseQuery: AttendanceBaseQuery,
  input: CreateAttendanceInput & AttendanceWriteInputExtras,
) => {
  const result = await baseQuery({
    document: createAttendance,
    variables: { input },
  });

  if (!result.error || !isUnknownAttendanceWriteFieldError(result.error)) {
    return result;
  }

  return baseQuery({
    document: createAttendance,
    variables: { input: stripStaffWorkDateKey(input) },
  });
};

const runUpdateAttendanceMutation = async (
  baseQuery: AttendanceBaseQuery,
  input: UpdateAttendanceInput & AttendanceWriteInputExtras,
  condition?: Record<string, unknown>,
) => {
  const result = await baseQuery({
    document: updateAttendance,
    variables: {
      input,
      condition,
    },
  });

  if (!result.error || !isUnknownAttendanceWriteFieldError(result.error)) {
    return result;
  }

  return baseQuery({
    document: updateAttendance,
    variables: {
      input: stripStaffWorkDateKey(input),
      condition,
    },
  });
};

const buildDuplicateConflictError = (
  staffId: string,
  workDate: string,
  ids: string[],
) => ({
  message: E02004,
  details: {
    code: ATTENDANCE_DUPLICATE_CONFLICT,
    staffId,
    workDate,
    ids,
  },
});

const buildRevisionConflictError = (attendanceId: string, revision: number) => ({
  message: "Attendance revision conflict",
  details: {
    code: ATTENDANCE_REVISION_CONFLICT,
    attendanceId,
    revision,
  },
});

const fetchAttendancesByStaffDate = async (
  baseQuery: AttendanceBaseQuery,
  staffId: string,
  workDate: string,
) => {
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
      return {
        error: result.error as AttendanceQueryError,
        attendances: [] as Attendance[],
      };
    }

    const data = result.data as AttendancesByStaffIdQuery | null;
    const connection = data?.attendancesByStaffId;
    if (!connection) {
      return {
        error: { message: "Failed to fetch attendance" },
        attendances: [] as Attendance[],
      };
    }

    attendances.push(...connection.items.filter(nonNullable));
    nextToken = connection.nextToken ?? null;
  } while (nextToken);

  return { attendances };
};

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
        baseQuery,
      ) {
        const { attendances, error } = await fetchAttendancesByStaffDate(
          baseQuery,
          staffId,
          workDate,
        );
        if (error) {
          return { error };
        }

        if (attendances.length === 0) {
          return { data: null };
        }

        if (attendances.length > 1) {
          const duplicateIds = attendances
            .map((attendance) => attendance.id)
            .filter(Boolean);
          dispatchDuplicateWarning(E02004);
          return {
            error: buildDuplicateConflictError(staffId, workDate, duplicateIds),
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
    deleteAttendance: builder.mutation<Attendance, { id: string }>({
      async queryFn({ id }, _queryApi, _extraOptions, baseQuery) {
        const result = await baseQuery({
          document: deleteAttendanceDocument,
          variables: { input: { id } },
        });
        if (result.error) {
          return { error: result.error };
        }
        const data = result.data as {
          deleteAttendance?: Attendance | null;
        } | null;
        const deleted = data?.deleteAttendance;
        if (!deleted) {
          return { error: { message: "Failed to delete attendance" } };
        }
        return { data: deleted };
      },
      invalidatesTags: ["Attendance"],
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
        baseQuery,
      ) {
        const safeDays = Math.max(1, days);
        const now = dayjs();
        const dateList = Array.from({ length: safeDays }, (_, index) =>
          now.subtract(index, "day").format(AttendanceDate.DataFormat),
        ).toSorted();

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
        const duplicateDetails: DuplicateAttendanceInfo[] = [];

        fetchedAttendances.forEach((attendance) =>
          duplicateCheck.set(attendance.workDate, [
            ...(duplicateCheck.get(attendance.workDate) ?? []),
            attendance,
          ]),
        );

        for (const attendances of duplicateCheck.values()) {
          if (attendances.length > 1) {
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

        if (duplicateDetails.length > 0) {
          return {
            error: {
              message: E02004,
              details: {
                code: ATTENDANCE_DUPLICATE_CONFLICT,
                staffId,
                duplicates: duplicateDetails,
              },
            },
          };
        }

        const attendanceList = dateList.map((targetDate) => {
          const matches = duplicateCheck.get(targetDate) ?? [];
          const match = matches[0] ?? null;

          return buildAttendanceForList(targetDate, match);
        });

        return {
          data: {
            attendances: attendanceList,
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
        baseQuery,
      ) {
        const safeDays = Math.max(1, days);
        const now = dayjs();
        const dateList = Array.from({ length: safeDays }, (_, index) =>
          now.subtract(index, "day").format(AttendanceDate.DataFormat),
        ).toSorted();

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
        const duplicateDetails: DuplicateAttendanceInfo[] = [];
        fetchedAttendances.forEach((attendance) => {
          const existing = duplicateCheck.get(attendance.workDate) ?? [];
          existing.push(attendance);
          duplicateCheck.set(attendance.workDate, existing);
        });

        // 重複が見つかった場合、警告メッセージを生成（エラーとしては返さない）
        for (const attendances of duplicateCheck.values()) {
          if (attendances.length > 1) {
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

        if (duplicateDetails.length > 0) {
          return {
            error: {
              message: E02004,
              details: {
                code: ATTENDANCE_DUPLICATE_CONFLICT,
                staffId,
                duplicates: duplicateDetails,
              },
            },
          };
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
        baseQuery,
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
        const duplicateDetails: DuplicateAttendanceInfo[] = [];
        attendances.forEach((attendance) => {
          const existing = duplicateCheck.get(attendance.workDate) ?? [];
          existing.push(attendance);
          duplicateCheck.set(attendance.workDate, existing);
        });

        // 重複が見つかった場合、警告メッセージを生成（エラーとしては返さない）
        for (const attendancesForDate of duplicateCheck.values()) {
          if (attendancesForDate.length > 1) {
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

        if (duplicateDetails.length > 0) {
          return {
            error: {
              message: E02004,
              details: {
                code: ATTENDANCE_DUPLICATE_CONFLICT,
                staffId,
                duplicates: duplicateDetails,
              },
            },
          };
        }

        return { data: attendances };
      },
      providesTags: (_result, _error, arg) => [
        { type: "Attendance" as const, id: "LIST" },
        {
          type: "Attendance" as const,
          id: `RANGE-${arg.staffId}-${arg.startDate}-${arg.endDate}`,
        },
      ],
    }),
    createAttendance: builder.mutation<Attendance, CreateAttendanceInput>({
      async queryFn(input, _queryApi, _extraOptions, baseQuery) {
        const { attendances: existingAttendances, error: existingError } =
          await fetchAttendancesByStaffDate(baseQuery, input.staffId, input.workDate);

        if (existingError) {
          return { error: existingError };
        }

        if (existingAttendances.length > 1) {
          const ids = existingAttendances
            .map((attendance) => attendance.id)
            .filter(Boolean);
          dispatchDuplicateWarning(E02004);
          return {
            error: buildDuplicateConflictError(input.staffId, input.workDate, ids),
          };
        }

        if (existingAttendances.length === 1) {
          return {
            error: buildDuplicateConflictError(input.staffId, input.workDate, [
              existingAttendances[0].id,
            ]),
          };
        }

        const payload: CreateAttendanceInput & AttendanceWriteInputExtras = {
          ...input,
          id: buildAttendanceRecordId(input.staffId, input.workDate),
          revision: 1,
          staffWorkDateKey: buildStaffWorkDateKey(input.staffId, input.workDate),
        };

        const result = await runCreateAttendanceMutation(baseQuery, payload);

        if (result.error) {
          const message = extractErrorText(result.error);
          if (isConditionalCheckFailed(message)) {
            const { attendances: reloadedAttendances, error: reloadError } =
              await fetchAttendancesByStaffDate(
                baseQuery,
                input.staffId,
                input.workDate,
              );
            if (reloadError) {
              return { error: reloadError };
            }

            if (reloadedAttendances.length > 0) {
              return {
                error: buildDuplicateConflictError(
                  input.staffId,
                  input.workDate,
                  reloadedAttendances
                    .map((attendance) => attendance.id)
                    .filter(Boolean),
                ),
              };
            }
          }
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
    upsertAttendanceByStaffAndDate: builder.mutation<
      Attendance,
      UpsertAttendanceByStaffAndDateInput
    >({
      async queryFn(
        { input, action, occurredAt, idempotencyKey },
        _queryApi,
        _extraOptions,
        baseQuery,
      ) {
        const { staffId, workDate } = input;
        if (!staffId || !workDate) {
          return {
            error: {
              message:
                "Upsert input requires both staffId and workDate (YYYY-MM-DD)",
            },
          };
        }

        const serverUpsertResult = await baseQuery({
          document: upsertAttendanceByStaffAndDateDocument,
          variables: {
            input: {
              ...input,
              staffId,
              workDate,
              action,
              occurredAt,
              idempotencyKey,
            },
          },
        });
        if (!serverUpsertResult.error) {
          const data =
            serverUpsertResult.data as UpsertAttendanceByStaffAndDateMutation | null;
          const upserted = data?.upsertAttendanceByStaffAndDate;
          if (upserted) {
            return { data: upserted };
          }
        } else {
          if (!canFallbackToClientUpsert(serverUpsertResult.error)) {
            return { error: serverUpsertResult.error as AttendanceQueryError };
          }
        }

        const upsertCreatePayload: CreateAttendanceInput &
          AttendanceWriteInputExtras = {
          ...input,
          id: buildAttendanceRecordId(staffId, workDate),
          revision: 1,
          staffWorkDateKey: buildStaffWorkDateKey(staffId, workDate),
        };

        const loadByStaffDate = async (): Promise<
          | { attendance: Attendance | null }
          | { error: AttendanceQueryError }
        > => {
          const loaded = await fetchAttendancesByStaffDate(
            baseQuery,
            staffId,
            workDate,
          );
          if (loaded.error) {
            return { error: loaded.error };
          }

          if (loaded.attendances.length > 1) {
            dispatchDuplicateWarning(E02004);
            return {
              error: buildDuplicateConflictError(
                staffId,
                workDate,
                loaded.attendances
                  .map((attendance) => attendance.id)
                  .filter(Boolean),
              ),
            };
          }

          return { attendance: loaded.attendances[0] ?? null };
        };

        const resolveInputField = <K extends keyof CreateAttendanceInput>(
          key: K,
          fallback: UpdateAttendanceInput[K],
        ): UpdateAttendanceInput[K] =>
          Object.prototype.hasOwnProperty.call(input, key)
            ? (input[key] as unknown as UpdateAttendanceInput[K])
            : fallback;

        const applyUpdate = async (
          sourceAttendance: Attendance,
          hasRetried = false,
        ): Promise<
          { data: Attendance } | { error: AttendanceQueryError }
        > => {
          const expectedRevision = sourceAttendance.revision ?? 1;
          const createdAt = new AttendanceDateTime().toISOString();
          const historyFromCurrent = buildAttendanceHistoryInput(
            sourceAttendance,
            createdAt,
          );
          const existingHistories = sourceAttendance.histories
            ? sourceAttendance.histories
                .filter(nonNullable)
                .map(cloneExistingHistory)
            : [];

          const updatePayload: UpdateAttendanceInput &
            AttendanceWriteInputExtras = {
            id: sourceAttendance.id,
            staffId,
            workDate,
            startTime: resolveInputField("startTime", sourceAttendance.startTime),
            endTime: resolveInputField("endTime", sourceAttendance.endTime),
            goDirectlyFlag: resolveInputField(
              "goDirectlyFlag",
              sourceAttendance.goDirectlyFlag,
            ),
            returnDirectlyFlag: resolveInputField(
              "returnDirectlyFlag",
              sourceAttendance.returnDirectlyFlag,
            ),
            absentFlag: resolveInputField("absentFlag", sourceAttendance.absentFlag),
            rests: resolveInputField("rests", sourceAttendance.rests),
            hourlyPaidHolidayTimes: resolveInputField(
              "hourlyPaidHolidayTimes",
              sourceAttendance.hourlyPaidHolidayTimes,
            ),
            remarks: resolveInputField("remarks", sourceAttendance.remarks),
            paidHolidayFlag: resolveInputField(
              "paidHolidayFlag",
              sourceAttendance.paidHolidayFlag,
            ),
            specialHolidayFlag: resolveInputField(
              "specialHolidayFlag",
              sourceAttendance.specialHolidayFlag,
            ),
            isDeemedHoliday: resolveInputField(
              "isDeemedHoliday",
              sourceAttendance.isDeemedHoliday,
            ),
            hourlyPaidHolidayHours: resolveInputField(
              "hourlyPaidHolidayHours",
              sourceAttendance.hourlyPaidHolidayHours,
            ),
            substituteHolidayDate: resolveInputField(
              "substituteHolidayDate",
              sourceAttendance.substituteHolidayDate,
            ),
            changeRequests: resolveInputField(
              "changeRequests",
              sourceAttendance.changeRequests,
            ),
            systemComments: resolveInputField(
              "systemComments",
              sourceAttendance.systemComments,
            ),
            revision: expectedRevision + 1,
            histories: [...existingHistories, historyFromCurrent],
            staffWorkDateKey: buildStaffWorkDateKey(staffId, workDate),
          };

          const updateResult = await runUpdateAttendanceMutation(
            baseQuery,
            updatePayload,
            buildRevisionCondition(expectedRevision),
          );

          if (!updateResult.error) {
            const data = updateResult.data as UpdateAttendanceMutation | null;
            const updatedAttendance = data?.updateAttendance;
            if (!updatedAttendance) {
              return { error: { message: "Failed to update attendance" } };
            }
            return { data: updatedAttendance };
          }

          const message = extractErrorText(updateResult.error);
          if (!isConditionalCheckFailed(message) || hasRetried) {
            if (isConditionalCheckFailed(message)) {
              return {
                error: buildRevisionConflictError(
                  sourceAttendance.id,
                  expectedRevision,
                ),
              };
            }
            return { error: updateResult.error as AttendanceQueryError };
          }

          const reloaded = await loadByStaffDate();
          if ("error" in reloaded) {
            return { error: reloaded.error };
          }
          if (!reloaded.attendance) {
            return {
              error: { message: "Failed to reload attendance during upsert" },
            };
          }
          return applyUpdate(reloaded.attendance, true);
        };

        const loaded = await loadByStaffDate();
        if ("error" in loaded) {
          return { error: loaded.error };
        }

        if (loaded.attendance) {
          return await applyUpdate(loaded.attendance);
        }

        const createResult = await runCreateAttendanceMutation(
          baseQuery,
          upsertCreatePayload,
        );

        if (!createResult.error) {
          const created = (createResult.data as CreateAttendanceMutation | null)
            ?.createAttendance;
          if (!created) {
            return { error: { message: "Failed to create attendance" } };
          }
          return { data: created };
        }

        const createErrorMessage = extractErrorText(createResult.error);
        if (!isConditionalCheckFailed(createErrorMessage)) {
          return { error: createResult.error as AttendanceQueryError };
        }

        const reloaded = await loadByStaffDate();
        if ("error" in reloaded) {
          return { error: reloaded.error };
        }
        if (!reloaded.attendance) {
          return { error: createResult.error as AttendanceQueryError };
        }

        return await applyUpdate(reloaded.attendance, true);
      },
      invalidatesTags: (result, _error, arg) => {
        const listTag = { type: "Attendance" as const, id: "LIST" };
        if (!result) {
          return [
            listTag,
            {
              type: "Attendance" as const,
              id: buildAttendanceCacheId(arg.input.staffId, arg.input.workDate),
            },
          ];
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
        const loadCurrentAttendance = async () => {
          const currentResult = await baseQuery({
            document: getAttendance,
            variables: { id: input.id },
          });

          if (currentResult.error) {
            return { error: currentResult.error as { message: string } };
          }

          const currentData = currentResult.data as GetAttendanceQuery | null;
          const currentAttendance = currentData?.getAttendance;

          if (!currentAttendance) {
            return {
              error: { message: "Failed to load current attendance" } as const,
            };
          }

          return { currentAttendance };
        };

        const loaded = await loadCurrentAttendance();
        if ("error" in loaded) {
          return { error: loaded.error };
        }

        let currentAttendance = loaded.currentAttendance;
        let expectedRevision = input.revision ?? (currentAttendance.revision ?? 1);
        let hasRetried = false;

        while (true) {
          const currentRevision = currentAttendance.revision ?? 1;
          if (expectedRevision !== currentRevision) {
            if (hasRetried) {
              return {
                error: buildRevisionConflictError(input.id, currentRevision),
              };
            }
            expectedRevision = currentRevision;
            hasRetried = true;
          }

          const createdAt = new AttendanceDateTime().toISOString();
          const historyFromCurrent = buildAttendanceHistoryInput(
            currentAttendance,
            createdAt,
          );

          const existingHistories = currentAttendance.histories
            ? currentAttendance.histories
                .filter(nonNullable)
                .map(cloneExistingHistory)
            : [];

          const payload: UpdateAttendanceInput & AttendanceWriteInputExtras = {
            ...input,
            revision: expectedRevision + 1,
            histories: [...existingHistories, historyFromCurrent],
            staffWorkDateKey: buildStaffWorkDateKey(
              currentAttendance.staffId,
              currentAttendance.workDate,
            ),
          };

          const result = await runUpdateAttendanceMutation(
            baseQuery,
            payload,
            buildRevisionCondition(expectedRevision),
          );

          if (!result.error) {
            const data = result.data as UpdateAttendanceMutation | null;
            const updatedAttendance = data?.updateAttendance;
            if (!updatedAttendance) {
              return { error: { message: "Failed to update attendance" } };
            }
            return { data: updatedAttendance };
          }

          const message = extractErrorText(result.error);
          if (!isConditionalCheckFailed(message) || hasRetried) {
            if (isConditionalCheckFailed(message)) {
              return {
                error: buildRevisionConflictError(input.id, expectedRevision),
              };
            }
            return { error: result.error };
          }

          const latest = await loadCurrentAttendance();
          if ("error" in latest) {
            return { error: latest.error };
          }

          currentAttendance = latest.currentAttendance;
          expectedRevision = currentAttendance.revision ?? 1;
          hasRetried = true;
        }
      },
      onQueryStarted: async (
        _input,
        { dispatch, queryFulfilled, getState },
      ) => {
        try {
          const { data: updatedAttendance } = await queryFulfilled;
          const { workDate, staffId } = updatedAttendance;

          type ApiCacheState = {
            attendanceApi?: {
              queries?: Record<
                string,
                | {
                    endpointName?: string;
                    originalArgs?: unknown;
                    status?: string;
                  }
                | undefined
              >;
            };
          };

          const queries = (getState() as ApiCacheState).attendanceApi?.queries;
          if (!queries) return;

          for (const queryEntry of Object.values(queries)) {
            if (
              !queryEntry ||
              queryEntry.endpointName !== "listAttendancesByDateRange" ||
              queryEntry.status !== "fulfilled"
            ) {
              continue;
            }

            const args = queryEntry.originalArgs as {
              staffId: string;
              startDate: string;
              endDate: string;
            };

            if (
              args.staffId !== staffId ||
              workDate < args.startDate ||
              workDate > args.endDate
            ) {
              continue;
            }

            dispatch(
              attendanceApi.util.updateQueryData(
                "listAttendancesByDateRange",
                args,
                (draft) => {
                  const index = draft.findIndex(
                    (a) => a.id === updatedAttendance.id,
                  );
                  if (index !== -1) {
                    Object.assign(draft[index], updatedAttendance);
                  }
                },
              ),
            );
          }
        } catch {
          // mutation failed, no cache update needed
        }
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
  useLazyListAttendancesByDateRangeQuery,
  useListRecentAttendancesQuery,
  useLazyListRecentAttendancesQuery,
  useListRecentAttendancesWithWarningsQuery,
  useCreateAttendanceMutation,
  useUpsertAttendanceByStaffAndDateMutation,
  useUpdateAttendanceMutation,
  useDeleteAttendanceMutation,
} = attendanceApi;
