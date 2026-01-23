import { shiftRequestsByStaffId } from "@shared/api/graphql/documents/queries";
import {
  ShiftRequestHistoryInput,
  ShiftRequestsByStaffIdQuery,
  Staff,
} from "@shared/api/graphql/types";
import { GraphQLResult } from "aws-amplify/api";
import { Dayjs } from "dayjs";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAppDispatchV2 } from "@/app/hooks";
import * as MESSAGE_CODE from "@/errors";
import fetchStaff from "@entities/staff/model/useStaff/fetchStaff";
import { graphqlClient } from "@/lib/amplify/graphqlClient";
import { setSnackbarError } from "@/lib/reducers/snackbarReducer";

import { SelectedDateMap, shiftRequestStatusToStatus } from "./statusMapping";

type UseShiftRequestDataParams = {
  cognitoUserId?: string;
  monthStart: Dayjs;
};

export type UseShiftRequestDataResult = {
  staff: Staff | null;
  isLoadingStaff: boolean;
  isLoadingShiftRequest: boolean;
  shiftRequestId: string | null;
  histories: ShiftRequestHistoryInput[];
  selectedDates: SelectedDateMap;
  setSelectedDates: Dispatch<SetStateAction<SelectedDateMap>>;
  note: string;
  setNote: Dispatch<SetStateAction<string>>;
  setHistories: Dispatch<SetStateAction<ShiftRequestHistoryInput[]>>;
  setShiftRequestId: Dispatch<SetStateAction<string | null>>;
};

export function useShiftRequestData({
  cognitoUserId,
  monthStart,
}: UseShiftRequestDataParams): UseShiftRequestDataResult {
  const dispatch = useAppDispatchV2();
  const [staff, setStaff] = useState<Staff | null>(null);
  const [isLoadingStaff, setIsLoadingStaff] = useState(true);
  const [isLoadingShiftRequest, setIsLoadingShiftRequest] = useState(false);
  const [shiftRequestId, setShiftRequestId] = useState<string | null>(null);
  const [histories, setHistories] = useState<ShiftRequestHistoryInput[]>([]);
  const [selectedDates, setSelectedDates] = useState<SelectedDateMap>({});
  const [note, setNote] = useState("");

  const targetMonthKey = useMemo(
    () => monthStart.format("YYYY-MM"),
    [monthStart]
  );

  const resetShiftRequestState = useCallback(() => {
    setShiftRequestId(null);
    setSelectedDates({});
    setNote("");
    setHistories([]);
    setIsLoadingShiftRequest(false);
  }, []);

  useEffect(() => {
    if (!cognitoUserId) {
      setStaff(null);
      setIsLoadingStaff(false);
      return;
    }

    let isMounted = true;
    const loadStaff = async () => {
      setIsLoadingStaff(true);
      try {
        const staffData = await fetchStaff(cognitoUserId);
        if (!isMounted) return;
        setStaff(staffData ?? null);
      } catch {
        if (!isMounted) return;
        setStaff(null);
        dispatch(setSnackbarError(MESSAGE_CODE.E05001));
      } finally {
        if (isMounted) {
          setIsLoadingStaff(false);
        }
      }
    };

    void loadStaff();

    return () => {
      isMounted = false;
    };
  }, [cognitoUserId, dispatch]);

  useEffect(() => {
    if (!staff?.id) {
      resetShiftRequestState();
      return;
    }

    let isMounted = true;
    const fetchShiftRequest = async () => {
      setIsLoadingShiftRequest(true);
      try {
        const response = (await graphqlClient.graphql({
          query: shiftRequestsByStaffId,
          variables: {
            staffId: staff.id,
            targetMonth: { eq: targetMonthKey },
            limit: 1,
          },
          authMode: "userPool",
        })) as GraphQLResult<ShiftRequestsByStaffIdQuery>;

        if (!isMounted) return;

        if (response.errors?.length) {
          throw new Error(response.errors[0].message);
        }

        const items =
          response.data?.shiftRequestsByStaffId?.items?.filter(
            (item): item is NonNullable<typeof item> => item !== null
          ) ?? [];
        const existing = items[0];

        if (!existing) {
          resetShiftRequestState();
          return;
        }

        const nextSelected: SelectedDateMap = {};
        existing.entries
          ?.filter(
            (entry): entry is NonNullable<typeof entry> => entry !== null
          )
          .forEach((entry) => {
            nextSelected[entry.date] = {
              status: shiftRequestStatusToStatus(entry.status),
            };
          });
        setShiftRequestId(existing.id ?? null);
        setSelectedDates(nextSelected);
        setNote(existing.note ?? "");

        const sanitizedHistories =
          existing.histories
            ?.filter(
              (history): history is NonNullable<typeof history> =>
                history !== null
            )
            .map((history) => ({
              version: history.version,
              note: history.note ?? undefined,
              entries:
                history.entries
                  ?.filter(
                    (entry): entry is NonNullable<typeof entry> => entry !== null
                  )
                  .map((entry) => ({
                    date: entry.date,
                    status: entry.status,
                  })) ?? undefined,
              summary: history.summary
                ? {
                    workDays: history.summary.workDays ?? undefined,
                    fixedOffDays: history.summary.fixedOffDays ?? undefined,
                    requestedOffDays: history.summary.requestedOffDays ?? undefined,
                  }
                : undefined,
              submittedAt: history.submittedAt ?? undefined,
              updatedAt: history.updatedAt ?? undefined,
              recordedAt: history.recordedAt,
              recordedByStaffId: history.recordedByStaffId ?? undefined,
              changeReason: history.changeReason ?? undefined,
            })) ?? [];
        setHistories(
          sanitizedHistories.sort((a, b) => (a.version ?? 0) - (b.version ?? 0))
        );
      } catch {
        if (isMounted) {
          dispatch(setSnackbarError(MESSAGE_CODE.E16002));
          resetShiftRequestState();
        }
      } finally {
        if (isMounted) {
          setIsLoadingShiftRequest(false);
        }
      }
    };

    void fetchShiftRequest();

    return () => {
      isMounted = false;
    };
  }, [dispatch, resetShiftRequestState, staff?.id, targetMonthKey]);

  return {
    staff,
    isLoadingStaff,
    isLoadingShiftRequest,
    shiftRequestId,
    histories,
    selectedDates,
    setSelectedDates,
    note,
    setNote,
    setHistories,
    setShiftRequestId,
  };
}
