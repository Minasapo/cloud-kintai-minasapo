import { createApi } from "@reduxjs/toolkit/query/react";
import { updateShiftRequest } from "@shared/api/graphql/documents/mutations";
import {
  listShiftRequests,
  shiftRequestsByStaffId,
} from "@shared/api/graphql/documents/queries";
import { graphqlBaseQuery } from "@shared/api/graphql/graphqlBaseQuery";
import type {
  ListShiftRequestsQuery,
  ModelShiftRequestConditionInput,
  ModelShiftRequestFilterInput,
  ShiftRequest,
  ShiftRequestsByStaffIdQuery,
  ShiftRequestsByStaffIdQueryVariables,
  UpdateShiftRequestInput,
  UpdateShiftRequestMutation,
} from "@shared/api/graphql/types";

export type ShiftRequestsQueryArgs = {
  staffIds: string[];
  targetMonth: string;
};

export type ShiftRequestQueryArgs = {
  staffId: string;
  targetMonth: string;
};

export type UpdateShiftRequestPayload = {
  input: UpdateShiftRequestInput;
  condition?: ModelShiftRequestConditionInput | null;
};

export type BatchUpdateShiftCellsArgs = {
  updates: UpdateShiftRequestPayload[];
};

export type BatchUpdateShiftCellsResult = {
  updatedRequests: ShiftRequest[];
  errors: Array<{ index: number; message: string }>;
};

type ShiftRequestTag = {
  type: "ShiftRequest";
  id: string;
};

type ShiftCollaborationTag = {
  type: "ShiftCollaboration";
  id: string;
};

export const nonNullable = <T>(value: T | null | undefined): value is T =>
  value !== null && value !== undefined;

export const buildShiftRequestTagId = (request: { id?: string | null }) =>
  request.id ?? "unknown";

export const buildShiftRequestsFilter = ({
  staffIds,
  targetMonth,
}: ShiftRequestsQueryArgs): ModelShiftRequestFilterInput => {
  if (staffIds.length === 0) {
    return { targetMonth: { eq: targetMonth } };
  }

  if (staffIds.length === 1) {
    return {
      staffId: { eq: staffIds[0] },
      targetMonth: { eq: targetMonth },
    };
  }

  return {
    targetMonth: { eq: targetMonth },
    or: staffIds.map((staffId) => ({ staffId: { eq: staffId } })),
  };
};

const getErrorMessage = (error: unknown) => {
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Failed to update shift request";
};

export const shiftApi = createApi({
  reducerPath: "shiftApi",
  baseQuery: graphqlBaseQuery(),
  tagTypes: ["ShiftRequest", "ShiftCollaboration"],
  endpoints: (builder) => ({
    getShiftRequests: builder.query<ShiftRequest[], ShiftRequestsQueryArgs>({
      async queryFn(arg, _api, _extraOptions, baseQuery) {
        if (arg.staffIds.length === 0) {
          return { data: [] };
        }

        const shiftRequests: ShiftRequest[] = [];
        let nextToken: string | null = null;
        const filter = buildShiftRequestsFilter(arg);

        do {
          const result = await baseQuery({
            document: listShiftRequests,
            variables: { filter, limit: 200, nextToken },
          });

          if (result.error) {
            return { error: result.error };
          }

          const data = result.data as ListShiftRequestsQuery | null;
          const connection = data?.listShiftRequests;

          if (!connection) {
            return { error: { message: "Failed to fetch shift requests" } };
          }

          shiftRequests.push(...(connection.items?.filter(nonNullable) ?? []));
          nextToken = connection.nextToken ?? null;
        } while (nextToken);

        return { data: shiftRequests };
      },
      providesTags: (result, _error, arg) => {
        const listTag: ShiftRequestTag = { type: "ShiftRequest", id: "LIST" };
        const collaborationTag: ShiftCollaborationTag = {
          type: "ShiftCollaboration",
          id: arg.targetMonth,
        };

        if (!result) {
          return [listTag, collaborationTag];
        }

        return [
          listTag,
          collaborationTag,
          ...result.map((shiftRequest) => ({
            type: "ShiftRequest" as const,
            id: buildShiftRequestTagId(shiftRequest),
          })),
        ];
      },
    }),
    getShiftRequest: builder.query<ShiftRequest | null, ShiftRequestQueryArgs>({
      async queryFn(arg, _api, _extraOptions, baseQuery) {
        const result = await baseQuery({
          document: shiftRequestsByStaffId,
          variables: {
            staffId: arg.staffId,
            targetMonth: { eq: arg.targetMonth },
            limit: 1,
            sortDirection: "DESC",
          } as ShiftRequestsByStaffIdQueryVariables,
        });

        if (result.error) {
          return { error: result.error };
        }

        const data = result.data as ShiftRequestsByStaffIdQuery | null;
        const item =
          data?.shiftRequestsByStaffId?.items?.find(nonNullable) ?? null;

        return { data: item };
      },
      providesTags: (result, _error, arg) => {
        const listTag: ShiftRequestTag = { type: "ShiftRequest", id: "LIST" };
        const collaborationTag: ShiftCollaborationTag = {
          type: "ShiftCollaboration",
          id: arg.targetMonth,
        };

        if (!result) {
          return [listTag, collaborationTag];
        }

        return [
          listTag,
          collaborationTag,
          { type: "ShiftRequest" as const, id: buildShiftRequestTagId(result) },
        ];
      },
    }),
    updateShiftCell: builder.mutation<ShiftRequest, UpdateShiftRequestPayload>({
      async queryFn(arg, _api, _extraOptions, baseQuery) {
        const result = await baseQuery({
          document: updateShiftRequest,
          variables: {
            input: arg.input,
            condition: arg.condition ?? undefined,
          },
        });

        if (result.error) {
          return { error: result.error };
        }

        const data = result.data as UpdateShiftRequestMutation | null;
        const updated = data?.updateShiftRequest;

        if (!updated) {
          return { error: { message: "Failed to update shift request" } };
        }

        return { data: updated };
      },
      invalidatesTags: (result, _error, arg) => {
        const listTag: ShiftRequestTag = { type: "ShiftRequest", id: "LIST" };
        const baseTags: ShiftRequestTag[] = [listTag];

        if (!result) {
          return baseTags;
        }

        return [
          ...baseTags,
          { type: "ShiftRequest" as const, id: buildShiftRequestTagId(result) },
          {
            type: "ShiftCollaboration" as const,
            id: arg.input.targetMonth ?? "UNKNOWN",
          },
        ];
      },
    }),
    batchUpdateShiftCells: builder.mutation<
      BatchUpdateShiftCellsResult,
      BatchUpdateShiftCellsArgs
    >({
      async queryFn(arg, _api, _extraOptions, baseQuery) {
        if (arg.updates.length === 0) {
          return { data: { updatedRequests: [], errors: [] } };
        }

        const updatedRequests: ShiftRequest[] = [];
        const errors: Array<{ index: number; message: string }> = [];

        for (const [index, update] of arg.updates.entries()) {
          const result = await baseQuery({
            document: updateShiftRequest,
            variables: {
              input: update.input,
              condition: update.condition ?? undefined,
            },
          });

          if (result.error) {
            errors.push({
              index,
              message: getErrorMessage(result.error),
            });
            continue;
          }

          const data = result.data as UpdateShiftRequestMutation | null;
          const updated = data?.updateShiftRequest;

          if (!updated) {
            errors.push({
              index,
              message: "Failed to update shift request",
            });
            continue;
          }

          updatedRequests.push(updated);
        }

        if (errors.length > 0 && updatedRequests.length === 0) {
          return { error: { message: errors[0].message } };
        }

        return { data: { updatedRequests, errors } };
      },
      invalidatesTags: (result, _error, arg) => {
        const listTag: ShiftRequestTag = { type: "ShiftRequest", id: "LIST" };
        const baseTags: ShiftRequestTag[] = [listTag];

        if (!result) {
          return baseTags;
        }

        const targetMonth = arg.updates[0]?.input.targetMonth ?? "UNKNOWN";

        return [
          ...baseTags,
          ...result.updatedRequests.map((shiftRequest) => ({
            type: "ShiftRequest" as const,
            id: buildShiftRequestTagId(shiftRequest),
          })),
          { type: "ShiftCollaboration" as const, id: targetMonth },
        ];
      },
    }),
  }),
});

export const {
  useGetShiftRequestsQuery,
  useGetShiftRequestQuery,
  useUpdateShiftCellMutation,
  useBatchUpdateShiftCellsMutation,
} = shiftApi;
