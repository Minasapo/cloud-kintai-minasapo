import { GraphQLResult } from "aws-amplify/api";
import dayjs, { Dayjs } from "dayjs";
import { Dispatch, SetStateAction, useCallback, useState } from "react";

import { useAppDispatchV2 } from "@/app/hooks";
import * as MESSAGE_CODE from "@/errors";
import { graphqlClient } from "@/lib/amplify/graphqlClient";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/lib/reducers/snackbarReducer";
import {
  createShiftRequest,
  updateShiftRequest,
} from "@shared/api/graphql/documents/mutations";
import {
  ShiftRequestHistoryInput,
  UpdateShiftRequestMutation,
  CreateShiftRequestMutation,
  Staff,
} from "@shared/api/graphql/types";

import {
  SelectedDateMap,
  statusToShiftRequestStatus,
} from "./statusMapping";

type Summary = {
  workDays: number;
  fixedOffDays: number;
  requestedOffDays: number;
};

type UseShiftRequestPersistParams = {
  staff: Staff | null;
  monthStart: Dayjs;
  selectedDates: SelectedDateMap;
  note: string;
  histories: ShiftRequestHistoryInput[];
  shiftRequestId: string | null;
  setShiftRequestId: Dispatch<SetStateAction<string | null>>;
  setHistories: Dispatch<SetStateAction<ShiftRequestHistoryInput[]>>;
};

export function useShiftRequestPersist({
  staff,
  monthStart,
  selectedDates,
  note,
  histories,
  shiftRequestId,
  setShiftRequestId,
  setHistories,
}: UseShiftRequestPersistParams) {
  const dispatch = useAppDispatchV2();
  const [isSaving, setIsSaving] = useState(false);

  const saveShiftRequest = useCallback(
    async (summary: Summary) => {
      if (!staff?.id) {
        dispatch(setSnackbarError(MESSAGE_CODE.E05001));
        return;
      }

      const entries = Object.entries(selectedDates)
        .map(([date, value]) => ({
          date,
          status: statusToShiftRequestStatus[value.status],
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      if (entries.length === 0) {
        return;
      }

      const submittedAt = dayjs().toISOString();
      const targetMonthKey = monthStart.format("YYYY-MM");
      const maxVersion = histories.reduce(
        (acc, history) => Math.max(acc, history.version ?? 0),
        0
      );
      const historySnapshot: ShiftRequestHistoryInput = {
        version: maxVersion + 1,
        note,
        entries,
        summary: { ...summary },
        submittedAt,
        updatedAt: submittedAt,
        recordedAt: submittedAt,
        recordedByStaffId: staff.id,
      };

      setIsSaving(true);
      try {
        const nextHistories = [...histories, historySnapshot];
        if (shiftRequestId) {
          const response = (await graphqlClient.graphql({
            query: updateShiftRequest,
            variables: {
              input: {
                id: shiftRequestId,
                note,
                entries,
                summary,
                submittedAt,
                histories: nextHistories,
              },
            },
            authMode: "userPool",
          })) as GraphQLResult<UpdateShiftRequestMutation>;

          if (response.errors?.length) {
            throw new Error(response.errors[0].message);
          }

          setShiftRequestId(
            response.data?.updateShiftRequest?.id ?? shiftRequestId
          );
          setHistories(nextHistories);
        } else {
          const response = (await graphqlClient.graphql({
            query: createShiftRequest,
            variables: {
              input: {
                staffId: staff.id,
                targetMonth: targetMonthKey,
                note,
                entries,
                summary,
                submittedAt,
                histories: nextHistories,
              },
            },
            authMode: "userPool",
          })) as GraphQLResult<CreateShiftRequestMutation>;

          if (response.errors?.length) {
            throw new Error(response.errors[0].message);
          }

          setShiftRequestId(response.data?.createShiftRequest?.id ?? null);
          setHistories(nextHistories);
        }

        dispatch(setSnackbarSuccess(MESSAGE_CODE.S16001));
      } catch {
        dispatch(setSnackbarError(MESSAGE_CODE.E16001));
      } finally {
        setIsSaving(false);
      }
    },
    [
      dispatch,
      histories,
      monthStart,
      note,
      selectedDates,
      shiftRequestId,
      staff?.id,
      setHistories,
      setShiftRequestId,
    ]
  );

  return { saveShiftRequest, isSaving };
}
