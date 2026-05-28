import {
  buildRevisionCondition,
  isConditionalCheckFailed,
} from "@shared/api/graphql/concurrency";
import { upsertAttendanceByStaffAndDate as upsertAttendanceByStaffAndDateDocument } from "@shared/api/graphql/documents/customMutations";
import { deleteAttendance as deleteAttendanceDocument } from "@shared/api/graphql/documents/mutations";
import { getAttendance } from "@shared/api/graphql/documents/queries";
import { buildListAndItemTags } from "@shared/api/graphql/tagBuilder";
import type {
  Attendance,
  CreateAttendanceInput,
  CreateAttendanceMutation,
  GetAttendanceQuery,
  UpdateAttendanceInput,
  UpdateAttendanceMutation,
} from "@shared/api/graphql/types";

import { E02004 } from "@/errors";

import {
  buildAttendanceCacheId,
  buildAttendanceRecordId,
  buildDuplicateConflictError,
  buildRevisionConflictError,
  buildStaffWorkDateKey,
  canFallbackToClientUpsert,
  extractErrorText,
  fetchAttendancesByStaffDate,
  mapUpsertActionToLogAction,
  runCreateAttendanceMutation,
  runUpdateAttendanceMutation,
} from "./attendanceApi.helpers";
import { attendanceApiWithQueries } from "./attendanceApi.queries";
import { dispatchDuplicateWarning, writeAttendanceOperationLog } from "./attendanceApi.shared";
import type {
  AttendanceBaseQuery,
  AttendanceOperationLogContext,
  AttendanceQueryError,
  AttendanceUpsertAction,
  AttendanceWriteInputExtras,
  CreateAttendanceMutationArg,
  DeleteAttendanceMutationArg,
  UpdateAttendanceMutationArg,
  UpsertAttendanceByStaffAndDateInput,
  UpsertAttendanceByStaffAndDateMutation,
} from "./attendanceApi.types";

// ─── Private helper types ────────────────────────────────────────────────────

type LoadByStaffDateFn = () => Promise<
  { attendance: Attendance | null } | { error: AttendanceQueryError }
>;

type ApplyUpsertUpdateCtx = {
  staffId: string;
  workDate: string;
  action: AttendanceUpsertAction;
  occurredAt: string;
  idempotencyKey: string;
  logContext: AttendanceOperationLogContext | undefined;
  input: CreateAttendanceInput;
  load: LoadByStaffDateFn;
};

// ─── Private helper functions ─────────────────────────────────────────────────

const resolveUpsertField = <K extends keyof CreateAttendanceInput>(
  input: CreateAttendanceInput,
  key: K,
  fallback: UpdateAttendanceInput[K],
): UpdateAttendanceInput[K] =>
  Object.prototype.hasOwnProperty.call(input, key)
    ? (input[key] as unknown as UpdateAttendanceInput[K])
    : fallback;

const applyUpsertUpdate = async (
  sourceAttendance: Attendance,
  baseQuery: AttendanceBaseQuery,
  ctx: ApplyUpsertUpdateCtx,
  hasRetried = false,
): Promise<{ data: Attendance } | { error: AttendanceQueryError }> => {
  const { staffId, workDate, action, occurredAt, idempotencyKey, logContext, input, load } = ctx;
  const expectedRevision = sourceAttendance.revision ?? 1;

  const updatePayload: UpdateAttendanceInput & AttendanceWriteInputExtras = {
    id: sourceAttendance.id,
    staffId,
    workDate,
    startTime: resolveUpsertField(input, "startTime", sourceAttendance.startTime),
    endTime: resolveUpsertField(input, "endTime", sourceAttendance.endTime),
    goDirectlyFlag: resolveUpsertField(input, "goDirectlyFlag", sourceAttendance.goDirectlyFlag),
    returnDirectlyFlag: resolveUpsertField(input, "returnDirectlyFlag", sourceAttendance.returnDirectlyFlag),
    absentFlag: resolveUpsertField(input, "absentFlag", sourceAttendance.absentFlag),
    rests: resolveUpsertField(input, "rests", sourceAttendance.rests),
    hourlyPaidHolidayTimes: resolveUpsertField(input, "hourlyPaidHolidayTimes", sourceAttendance.hourlyPaidHolidayTimes),
    remarks: resolveUpsertField(input, "remarks", sourceAttendance.remarks),
    paidHolidayFlag: resolveUpsertField(input, "paidHolidayFlag", sourceAttendance.paidHolidayFlag),
    specialHolidayFlag: resolveUpsertField(input, "specialHolidayFlag", sourceAttendance.specialHolidayFlag),
    isDeemedHoliday: resolveUpsertField(input, "isDeemedHoliday", sourceAttendance.isDeemedHoliday),
    hourlyPaidHolidayHours: resolveUpsertField(input, "hourlyPaidHolidayHours", sourceAttendance.hourlyPaidHolidayHours),
    substituteHolidayDate: resolveUpsertField(input, "substituteHolidayDate", sourceAttendance.substituteHolidayDate),
    changeRequests: resolveUpsertField(input, "changeRequests", sourceAttendance.changeRequests),
    revision: expectedRevision + 1,
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
    await writeAttendanceOperationLog({
      action: mapUpsertActionToLogAction(action),
      attendance: updatedAttendance,
      before: sourceAttendance,
      logContext,
      metadata: { occurredAt, idempotencyKey, source: "client_upsert_update" },
    });
    return { data: updatedAttendance };
  }

  const message = extractErrorText(updateResult.error);
  if (!isConditionalCheckFailed(message) || hasRetried) {
    if (isConditionalCheckFailed(message)) {
      return { error: buildRevisionConflictError(sourceAttendance.id, expectedRevision) };
    }
    return { error: updateResult.error as AttendanceQueryError };
  }

  const reloaded = await load();
  if ("error" in reloaded) {
    return { error: reloaded.error };
  }
  if (!reloaded.attendance) {
    return { error: { message: "Failed to reload attendance during upsert" } };
  }
  return applyUpsertUpdate(reloaded.attendance, baseQuery, ctx, true);
};

// ─── Query function implementations ───────────────────────────────────────────

const deleteAttendanceQueryFn = async (
  { id, logContext }: DeleteAttendanceMutationArg,
  baseQuery: AttendanceBaseQuery,
): Promise<{ data: Attendance } | { error: AttendanceQueryError }> => {
  const result = await baseQuery({
    document: deleteAttendanceDocument,
    variables: { input: { id } },
  });
  if (result.error) {
    return { error: result.error };
  }
  const data = result.data as { deleteAttendance?: Attendance | null } | null;
  const deleted = data?.deleteAttendance;
  if (!deleted) {
    return { error: { message: "Failed to delete attendance" } };
  }
  await writeAttendanceOperationLog({
    action: "attendance.delete",
    attendance: deleted,
    before: deleted,
    logContext,
  });
  return { data: deleted };
};

const createAttendanceQueryFn = async (
  arg: CreateAttendanceMutationArg,
  baseQuery: AttendanceBaseQuery,
): Promise<{ data: Attendance } | { error: AttendanceQueryError }> => {
  const { logContext, ...input } = arg;
  const { attendances: existingAttendances, error: existingError } =
    await fetchAttendancesByStaffDate(baseQuery, input.staffId, input.workDate);

  if (existingError) {
    return { error: existingError };
  }

  if (existingAttendances.length > 1) {
    const ids = existingAttendances.map((a) => a.id).filter(Boolean);
    dispatchDuplicateWarning(E02004);
    return { error: buildDuplicateConflictError(input.staffId, input.workDate, ids) };
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
        await fetchAttendancesByStaffDate(baseQuery, input.staffId, input.workDate);
      if (reloadError) {
        return { error: reloadError };
      }
      if (reloadedAttendances.length > 0) {
        return {
          error: buildDuplicateConflictError(
            input.staffId,
            input.workDate,
            reloadedAttendances.map((a) => a.id).filter(Boolean),
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

  await writeAttendanceOperationLog({
    action: "attendance.create",
    attendance: createdAttendance,
    before: null,
    logContext,
  });

  return { data: createdAttendance };
};

const upsertAttendanceByStaffAndDateQueryFn = async (
  { input, action, occurredAt, idempotencyKey, logContext }: UpsertAttendanceByStaffAndDateInput,
  baseQuery: AttendanceBaseQuery,
): Promise<{ data: Attendance } | { error: AttendanceQueryError }> => {
  const { staffId, workDate } = input;
  if (!staffId || !workDate) {
    return {
      error: { message: "Upsert input requires both staffId and workDate (YYYY-MM-DD)" },
    };
  }

  const loadByStaffDate: LoadByStaffDateFn = async () => {
    const loaded = await fetchAttendancesByStaffDate(baseQuery, staffId, workDate);
    if (loaded.error) {
      return { error: loaded.error };
    }
    if (loaded.attendances.length > 1) {
      dispatchDuplicateWarning(E02004);
      return {
        error: buildDuplicateConflictError(
          staffId,
          workDate,
          loaded.attendances.map((a) => a.id).filter(Boolean),
        ),
      };
    }
    return { attendance: loaded.attendances[0] ?? null };
  };

  const initialLoad = await loadByStaffDate();
  if ("error" in initialLoad) {
    return { error: initialLoad.error };
  }
  const previousAttendance = initialLoad.attendance;

  const serverUpsertResult = await baseQuery({
    document: upsertAttendanceByStaffAndDateDocument,
    variables: { input: { ...input, staffId, workDate, action, occurredAt, idempotencyKey } },
  });
  if (!serverUpsertResult.error) {
    const data = serverUpsertResult.data as UpsertAttendanceByStaffAndDateMutation | null;
    const upserted = data?.upsertAttendanceByStaffAndDate;
    if (upserted) {
      await writeAttendanceOperationLog({
        action: mapUpsertActionToLogAction(action),
        attendance: upserted,
        before: previousAttendance,
        logContext,
        metadata: { occurredAt, idempotencyKey, source: "server_upsert" },
      });
      return { data: upserted };
    }
  } else if (!canFallbackToClientUpsert(serverUpsertResult.error)) {
    return { error: serverUpsertResult.error as AttendanceQueryError };
  }

  const upsertCreatePayload: CreateAttendanceInput & AttendanceWriteInputExtras = {
    ...input,
    id: buildAttendanceRecordId(staffId, workDate),
    revision: 1,
    staffWorkDateKey: buildStaffWorkDateKey(staffId, workDate),
  };

  const applyCtx: ApplyUpsertUpdateCtx = {
    staffId,
    workDate,
    action,
    occurredAt,
    idempotencyKey,
    logContext,
    input,
    load: loadByStaffDate,
  };

  if (previousAttendance) {
    return applyUpsertUpdate(previousAttendance, baseQuery, applyCtx);
  }

  const createResult = await runCreateAttendanceMutation(baseQuery, upsertCreatePayload);

  if (!createResult.error) {
    const created = (createResult.data as CreateAttendanceMutation | null)?.createAttendance;
    if (!created) {
      return { error: { message: "Failed to create attendance" } };
    }
    await writeAttendanceOperationLog({
      action: mapUpsertActionToLogAction(action),
      attendance: created,
      before: null,
      logContext,
      metadata: { occurredAt, idempotencyKey, source: "client_upsert_create" },
    });
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

  return applyUpsertUpdate(reloaded.attendance, baseQuery, applyCtx, true);
};

const updateAttendanceQueryFn = async (
  arg: UpdateAttendanceMutationArg,
  baseQuery: AttendanceBaseQuery,
): Promise<{ data: Attendance } | { error: AttendanceQueryError }> => {
  const { logContext, ...input } = arg;
  const loadCurrentAttendance = async (): Promise<
    { currentAttendance: Attendance } | { error: AttendanceQueryError }
  > => {
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
    return { currentAttendance };
  };

  const loaded = await loadCurrentAttendance();
  if ("error" in loaded) {
    return { error: loaded.error };
  }

  let currentAttendance = loaded.currentAttendance;
  let expectedRevision = input.revision ?? currentAttendance.revision ?? 1;
  let hasRetried = false;

  while (true) {
    const currentRevision = currentAttendance.revision ?? 1;
    if (expectedRevision !== currentRevision) {
      if (hasRetried) {
        return { error: buildRevisionConflictError(input.id, currentRevision) };
      }
      expectedRevision = currentRevision;
      hasRetried = true;
    }

    const payload: UpdateAttendanceInput & AttendanceWriteInputExtras = {
      ...input,
      revision: expectedRevision + 1,
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
      await writeAttendanceOperationLog({
        action: "attendance.update",
        attendance: updatedAttendance,
        before: currentAttendance,
        logContext,
      });
      return { data: updatedAttendance };
    }

    const message = extractErrorText(result.error);
    if (!isConditionalCheckFailed(message) || hasRetried) {
      if (isConditionalCheckFailed(message)) {
        return { error: buildRevisionConflictError(input.id, expectedRevision) };
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
};

// ─── RTK Query endpoint definitions ───────────────────────────────────────────

export const attendanceApi = attendanceApiWithQueries.injectEndpoints({
  endpoints: (builder) => ({
    deleteAttendance: builder.mutation<Attendance, DeleteAttendanceMutationArg>({
      async queryFn(arg, _queryApi, _extraOptions, baseQuery) {
        return deleteAttendanceQueryFn(arg, baseQuery);
      },
      invalidatesTags: ["Attendance"],
    }),
    createAttendance: builder.mutation<Attendance, CreateAttendanceMutationArg>({
      async queryFn(arg, _queryApi, _extraOptions, baseQuery) {
        return createAttendanceQueryFn(arg, baseQuery);
      },
      invalidatesTags: (result) =>
        buildListAndItemTags(
          "Attendance",
          result ? [result] : undefined,
          (r) => r.id || buildAttendanceCacheId(r.staffId, r.workDate),
        ),
    }),
    upsertAttendanceByStaffAndDate: builder.mutation<
      Attendance,
      UpsertAttendanceByStaffAndDateInput
    >({
      async queryFn(arg, _queryApi, _extraOptions, baseQuery) {
        return upsertAttendanceByStaffAndDateQueryFn(arg, baseQuery);
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
            id: result.id || buildAttendanceCacheId(result.staffId, result.workDate),
          },
        ];
      },
    }),
    updateAttendance: builder.mutation<Attendance, UpdateAttendanceMutationArg>({
      async queryFn(arg, _queryApi, _extraOptions, baseQuery) {
        return updateAttendanceQueryFn(arg, baseQuery);
      },
      onQueryStarted: async (_input, { dispatch, queryFulfilled, getState }) => {
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
                  const index = draft.findIndex((a) => a.id === updatedAttendance.id);
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
            id: result.id || buildAttendanceCacheId(result.staffId, result.workDate),
          },
        ];
      },
    }),
  }),
});

export const {
  useCreateAttendanceMutation,
  useUpsertAttendanceByStaffAndDateMutation,
  useUpdateAttendanceMutation,
  useDeleteAttendanceMutation,
} = attendanceApi;