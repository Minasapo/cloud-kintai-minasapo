import {
  createShiftRequest,
  updateShiftRequest,
} from "@shared/api/graphql/documents/mutations";
import { listShiftRequests } from "@shared/api/graphql/documents/queries";
import {
  CreateShiftRequestMutation,
  ListShiftRequestsQuery,
  ShiftRequestDayPreferenceInput,
  ShiftRequestHistoryInput,
  UpdateShiftRequestMutation,
} from "@shared/api/graphql/types";
import { GraphQLResult } from "aws-amplify/api";
import dayjs, { Dayjs } from "dayjs";
import { useCallback, useEffect, useState } from "react";

import { StaffType } from "@entities/staff/model/useStaffs/useStaffs";
import { graphqlClient } from "@/shared/api/amplify/graphqlClient";

import { ShiftState } from "../lib/generateMockShifts";
import { buildSummaryFromAssignments } from "../lib/shiftAssignments";
import {
  convertHistoryToInput,
  ShiftRequestHistoryMeta,
  ShiftRequestRecordSnapshot,
} from "../lib/shiftRequests";
import {
  SHIFT_MANUAL_CHANGE_REASON,
  shiftRequestStatusToShiftState,
  shiftStateToShiftRequestStatus,
} from "../lib/shiftStateMapping";

type UseShiftRequestAssignmentsParams = {
  shiftStaffs: StaffType[];
  monthStart: Dayjs;
  cognitoUserId?: string | null;
  enabled?: boolean;
};

type UseShiftRequestAssignmentsResult = {
  shiftRequestAssignments: Map<string, Record<string, ShiftState>>;
  shiftRequestHistoryMeta: Map<string, ShiftRequestHistoryMeta>;
  shiftRequestRecords: Map<string, ShiftRequestRecordSnapshot>;
  shiftRequestsLoading: boolean;
  shiftRequestsError: string | null;
  persistShiftRequestChanges: (
    staffId: string,
    dayKeys: string[],
    nextState: ShiftState
  ) => Promise<void>;
};

export default function useShiftRequestAssignments({
  shiftStaffs,
  monthStart,
  cognitoUserId,
  enabled = true,
}: UseShiftRequestAssignmentsParams): UseShiftRequestAssignmentsResult {
  const [shiftRequestAssignments, setShiftRequestAssignments] = useState<
    Map<string, Record<string, ShiftState>>
  >(new Map());
  const [shiftRequestHistoryMeta, setShiftRequestHistoryMeta] = useState<
    Map<string, ShiftRequestHistoryMeta>
  >(new Map());
  const [shiftRequestRecords, setShiftRequestRecords] = useState<
    Map<string, ShiftRequestRecordSnapshot>
  >(new Map());
  const [shiftRequestsLoading, setShiftRequestsLoading] = useState(false);
  const [shiftRequestsError, setShiftRequestsError] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (!enabled) {
      setShiftRequestAssignments(new Map());
      setShiftRequestHistoryMeta(new Map());
      setShiftRequestRecords(new Map());
      setShiftRequestsLoading(false);
      setShiftRequestsError(null);
      return;
    }

    if (!shiftStaffs || shiftStaffs.length === 0) {
      setShiftRequestAssignments(new Map());
      setShiftRequestHistoryMeta(new Map());
      setShiftRequestRecords(new Map());
      return;
    }

    let isMounted = true;
    const fetchShiftRequests = async () => {
      setShiftRequestsLoading(true);
      setShiftRequestsError(null);
      try {
        const staffIdSet = new Set(shiftStaffs.map((s) => s.id));
        const targetMonthKey = monthStart.format("YYYY-MM");
        const nextAssignments = new Map<string, Record<string, ShiftState>>();
        const nextHistoryMeta = new Map<string, ShiftRequestHistoryMeta>();
        const nextRecords = new Map<string, ShiftRequestRecordSnapshot>();
        let nextToken: string | null | undefined = undefined;

        do {
          const response = (await graphqlClient.graphql({
            query: listShiftRequests,
            variables: {
              filter: { targetMonth: { eq: targetMonthKey } },
              limit: 500,
              nextToken,
            },
            authMode: "userPool",
          })) as GraphQLResult<ListShiftRequestsQuery>;

          if (!isMounted) return;

          if (response.errors) {
            throw new Error(response.errors.map((e) => e.message).join(","));
          }

          const items =
            response.data?.listShiftRequests?.items?.filter(
              (item): item is NonNullable<typeof item> => item !== null
            ) ?? [];

          items.forEach((item) => {
            if (!staffIdSet.has(item.staffId)) return;
            const per: Record<string, ShiftState> = {};
            item.entries
              ?.filter(
                (entry): entry is NonNullable<typeof entry> => entry !== null
              )
              .forEach((entry) => {
                per[entry.date] = shiftRequestStatusToShiftState(entry.status);
              });
            nextAssignments.set(item.staffId, per);

            const histories =
              item.histories?.filter(
                (history): history is NonNullable<typeof history> =>
                  history !== null
              ) ?? [];
            const changeCount = histories.length;
            let latestChangeAt: string | null = null;
            histories.forEach((history) => {
              const candidate = history.recordedAt ?? null;
              if (!candidate) return;
              if (!latestChangeAt || dayjs(candidate).isAfter(latestChangeAt)) {
                latestChangeAt = candidate;
              }
            });
            nextHistoryMeta.set(item.staffId, {
              changeCount,
              latestChangeAt,
            });

            const historyInputs = histories.map(convertHistoryToInput);
            nextRecords.set(item.staffId, {
              id: item.id,
              histories: historyInputs,
              note: item.note ?? undefined,
              submittedAt: item.submittedAt ?? undefined,
              targetMonth: item.targetMonth ?? targetMonthKey,
            });
          });

          nextToken = response.data?.listShiftRequests?.nextToken ?? null;
        } while (nextToken);

        if (!isMounted) return;
        setShiftRequestAssignments(nextAssignments);
        setShiftRequestHistoryMeta(nextHistoryMeta);
        setShiftRequestRecords(nextRecords);
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setShiftRequestsError("希望シフトの取得に失敗しました。");
        }
      } finally {
        if (isMounted) {
          setShiftRequestsLoading(false);
        }
      }
    };

    fetchShiftRequests();

    return () => {
      isMounted = false;
    };
  }, [enabled, monthStart, shiftStaffs]);

  const persistShiftRequestChanges = useCallback(
    async (staffId: string, dayKeys: string[], nextState: ShiftState) => {
      const timestamp = dayjs().toISOString();
      const targetMonthKey = monthStart.format("YYYY-MM");
      const existingAssignments = shiftRequestAssignments.get(staffId) || {};
      const updatedAssignments: Record<string, ShiftState> = {
        ...existingAssignments,
      };
      dayKeys.forEach((key) => {
        updatedAssignments[key] = nextState;
      });

      const entriesInput: ShiftRequestDayPreferenceInput[] = Object.entries(
        updatedAssignments
      )
        .map(([date, state]) => ({
          date,
          status: shiftStateToShiftRequestStatus(state),
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      const summary = buildSummaryFromAssignments(updatedAssignments);
      const record = shiftRequestRecords.get(staffId);
      const baseHistories = record?.histories ?? [];
      const maxVersion = baseHistories.reduce(
        (acc, history) => Math.max(acc, history.version ?? 0),
        0
      );
      const historyEntry: ShiftRequestHistoryInput = {
        version: maxVersion + 1,
        note: record?.note ?? undefined,
        entries: entriesInput,
        summary,
        submittedAt: timestamp,
        updatedAt: timestamp,
        recordedAt: timestamp,
        recordedByStaffId: cognitoUserId ?? undefined,
        changeReason: SHIFT_MANUAL_CHANGE_REASON,
      };
      const historiesInput: ShiftRequestHistoryInput[] = [
        ...baseHistories,
        historyEntry,
      ];

      const inputBase = {
        entries: entriesInput,
        summary,
        histories: historiesInput,
        submittedAt: timestamp,
        updatedAt: timestamp,
      };

      let responseShiftRequest:
        | UpdateShiftRequestMutation["updateShiftRequest"]
        | CreateShiftRequestMutation["createShiftRequest"]
        | null
        | undefined;

      if (record?.id) {
        const response = (await graphqlClient.graphql({
          query: updateShiftRequest,
          variables: {
            input: {
              id: record.id,
              ...inputBase,
            },
          },
          authMode: "userPool",
        })) as GraphQLResult<UpdateShiftRequestMutation>;

        if (response.errors?.length) {
          throw new Error(response.errors.map((e) => e.message).join(","));
        }

        responseShiftRequest = response.data?.updateShiftRequest;
      } else {
        const response = (await graphqlClient.graphql({
          query: createShiftRequest,
          variables: {
            input: {
              staffId,
              targetMonth: targetMonthKey,
              ...inputBase,
            },
          },
          authMode: "userPool",
        })) as GraphQLResult<CreateShiftRequestMutation>;

        if (response.errors?.length) {
          throw new Error(response.errors.map((e) => e.message).join(","));
        }

        responseShiftRequest = response.data?.createShiftRequest;
      }

      if (!responseShiftRequest) {
        throw new Error("Shift request mutation returned no data");
      }

      setShiftRequestAssignments((prev) => {
        const next = new Map(prev);
        next.set(staffId, updatedAssignments);
        return next;
      });

      setShiftRequestRecords((prev) => {
        const next = new Map(prev);
        next.set(staffId, {
          id: responseShiftRequest.id,
          histories: historiesInput,
          note: responseShiftRequest.note ?? record?.note ?? undefined,
          submittedAt: responseShiftRequest.submittedAt ?? timestamp,
          targetMonth: responseShiftRequest.targetMonth ?? targetMonthKey,
        });
        return next;
      });

      setShiftRequestHistoryMeta((prev) => {
        const next = new Map(prev);
        next.set(staffId, {
          changeCount: historiesInput.length,
          latestChangeAt: timestamp,
        });
        return next;
      });
    },
    [
      cognitoUserId,
      monthStart,
      shiftRequestAssignments,
      shiftRequestRecords,
    ]
  );

  return {
    shiftRequestAssignments,
    shiftRequestHistoryMeta,
    shiftRequestRecords,
    shiftRequestsLoading,
    shiftRequestsError,
    persistShiftRequestChanges,
  };
}
