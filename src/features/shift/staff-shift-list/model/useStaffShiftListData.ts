import { useCalendars } from "@entities/calendar/model/useCalendars";
import {
  nonNullable,
  type ShiftRequestLite,
  useCreateShiftRequestMutation,
  useGetShiftRequestQuery,
  useUpdateShiftCellMutation,
} from "@entities/shift/api/shiftApi";
import { useStaffs } from "@entities/staff/model/useStaffs/useStaffs";
import {
  type ShiftRequestHistoryInput,
  ShiftRequestStatus,
} from "@shared/api/graphql/types";
import { createLogger } from "@shared/lib/logger";
import { useAppNotification } from "@shared/lib/useAppNotification";
import dayjs, { type Dayjs } from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";

import * as MESSAGE_CODE from "@/errors";

const logger = createLogger("StaffShiftListData");

export type ShiftState = "work" | "off" | undefined;

const shiftRequestStatusToShiftState = (
  status?: ShiftRequestStatus | null,
): ShiftState => {
  if (status === ShiftRequestStatus.WORK) {
    return "work";
  }

  if (status) {
    return "off";
  }

  return undefined;
};

const shiftStateToShiftRequestStatus = (
  state: ShiftState,
): ShiftRequestStatus | null => {
  if (state === "work") {
    return ShiftRequestStatus.WORK;
  }

  if (state === "off") {
    return ShiftRequestStatus.FIXED_OFF;
  }

  return null;
};

const buildShiftStatesFromRequest = (
  request?: ShiftRequestLite | null,
): Record<string, ShiftState> => {
  const next: Record<string, ShiftState> = {};

  request?.entries?.filter(nonNullable).forEach((entry) => {
    next[entry.date] = shiftRequestStatusToShiftState(entry.status);
  });

  return next;
};

const buildEntryMap = (request?: ShiftRequestLite | null) =>
  new Map(
    request?.entries?.filter(nonNullable).map((entry) => [entry.date, entry]) ??
      [],
  );

const buildEntries = ({
  days,
  shiftStates,
  request,
}: {
  days: Dayjs[];
  shiftStates: Record<string, ShiftState>;
  request?: ShiftRequestLite | null;
}) => {
  const existingEntryMap = buildEntryMap(request);
  const entries: Array<{
    date: string;
    status: ShiftRequestStatus;
    isLocked?: boolean | null;
  }> = [];

  days.forEach((d) => {
    const date = d.format("YYYY-MM-DD");
    const state = shiftStates[date];
    const status = shiftStateToShiftRequestStatus(state);
    if (!status) {
      return;
    }

    const existing = existingEntryMap.get(date);
    entries.push({
      date,
      status,
      isLocked: existing?.isLocked ?? false,
    });
  });

  return entries;
};

const buildHistories = ({
  existingHistories,
  entries,
  currentUserId,
}: {
  existingHistories?: ShiftRequestLite["histories"];
  entries: Array<{
    date: string;
    status: ShiftRequestStatus;
    isLocked?: boolean | null;
  }>;
  currentUserId: string;
}): { histories: ShiftRequestHistoryInput[]; timestamp: string } => {
  const histories: ShiftRequestHistoryInput[] =
    existingHistories?.filter(nonNullable).map((history) => ({
      version: history.version,
      entries: history.entries?.filter(nonNullable).map((entry) => ({
        date: entry.date,
        status: entry.status as ShiftRequestStatus,
        isLocked: entry.isLocked ?? undefined,
      })),
      recordedAt: history.recordedAt,
      recordedByStaffId: history.recordedByStaffId ?? undefined,
    })) ?? [];
  const maxVersion = histories.reduce(
    (acc, history) => Math.max(acc, history.version ?? 0),
    0,
  );
  const timestamp = new Date().toISOString();

  return {
    histories: [
      ...histories,
      {
        version: maxVersion + 1,
        entries,
        recordedAt: timestamp,
        recordedByStaffId: currentUserId,
      },
    ],
    timestamp,
  };
};

type UseStaffShiftListDataParams = {
  staffId?: string;
  isAuthenticated: boolean;
  currentUserId: string;
};

export const useStaffShiftListData = ({
  staffId,
  isAuthenticated,
  currentUserId,
}: UseStaffShiftListDataParams) => {
  const { notify } = useAppNotification();
  const { staffs } = useStaffs({ isAuthenticated });

  const staff = staffs.find((s) => String(s.id) === String(staffId));

  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const monthStart = useMemo(
    () => currentMonth.startOf("month"),
    [currentMonth],
  );
  const targetMonth = monthStart.format("YYYY-MM");

  const days = useMemo(
    () =>
      Array.from({ length: monthStart.daysInMonth() }).map((_, i) =>
        monthStart.add(i, "day"),
      ),
    [monthStart],
  );

  const {
    holidayCalendars,
    companyHolidayCalendars,
    isLoading: calendarLoading,
    error: calendarsError,
  } = useCalendars();

  const {
    data: shiftRequest,
    isLoading: shiftRequestLoading,
    isFetching: shiftRequestFetching,
    error: shiftRequestError,
  } = useGetShiftRequestQuery(
    {
      staffId: staff?.id ?? "",
      targetMonth,
    },
    {
      skip: !staff?.id,
      refetchOnFocus: false,
      refetchOnReconnect: false,
    },
  );

  const [updateShiftCell, { isLoading: isUpdatingShift }] =
    useUpdateShiftCellMutation();
  const [createShiftRequest, { isLoading: isCreatingShift }] =
    useCreateShiftRequestMutation();
  const [shiftStates, setShiftStates] = useState<Record<string, ShiftState>>({});

  useEffect(() => {
    if (calendarsError) {
      logger.error(calendarsError);
      notify({
        title: "エラー",
        description: MESSAGE_CODE.E00001,
        tone: "error",
        dedupeKey: "holiday-calendar-error",
      });
    }
  }, [calendarsError, notify]);

  useEffect(() => {
    if (shiftRequestError) {
      logger.error(shiftRequestError);
      notify({
        title: "エラー",
        description: MESSAGE_CODE.E16002,
        tone: "error",
        dedupeKey: `shift-request-error-${staff?.id ?? "unknown"}-${targetMonth}`,
      });
    }
  }, [notify, shiftRequestError, staff?.id, targetMonth]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setShiftStates(buildShiftStatesFromRequest(shiftRequest));
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    shiftRequest?.id,
    shiftRequest?.updatedAt,
    shiftRequest?.version,
    staff?.id,
    targetMonth,
  ]);

  const publicHolidaySet = useMemo(
    () => new Set(holidayCalendars.map((h) => h.holidayDate)),
    [holidayCalendars],
  );

  const companyHolidaySet = useMemo(
    () => new Set(companyHolidayCalendars.map((h) => h.holidayDate)),
    [companyHolidayCalendars],
  );

  const isSaving = isUpdatingShift || isCreatingShift;

  const persistShiftStates = useCallback(
    async (
      nextShiftStates: Record<string, ShiftState>,
      prevShiftStates: Record<string, ShiftState>,
    ) => {
      if (!staff?.id) {
        return;
      }

      const entries = buildEntries({
        days,
        shiftStates: nextShiftStates,
        request: shiftRequest,
      });
      const nextHistories = buildHistories({
        existingHistories: shiftRequest?.histories,
        entries,
        currentUserId,
      });

      try {
        if (shiftRequest) {
          const currentVersion = shiftRequest.version ?? null;
          await updateShiftCell({
            input: {
              id: shiftRequest.id,
              staffId: shiftRequest.staffId,
              targetMonth,
              entries,
              histories: nextHistories.histories,
              updatedAt: nextHistories.timestamp,
              updatedBy: currentUserId,
              version: currentVersion !== null ? currentVersion + 1 : undefined,
            },
            condition:
              currentVersion !== null
                ? {
                    version: { eq: currentVersion },
                  }
                : undefined,
          }).unwrap();
          return;
        }

        await createShiftRequest({
          input: {
            staffId: staff.id,
            targetMonth,
            entries,
            histories: nextHistories.histories,
            updatedAt: nextHistories.timestamp,
            updatedBy: currentUserId,
            version: 1,
          },
        }).unwrap();
      } catch (error) {
        logger.error("Failed to persist staff shift", error);
        setShiftStates(prevShiftStates);
        notify({
          title: "エラー",
          description: MESSAGE_CODE.E16001,
          tone: "error",
          dedupeKey: `shift-persist-error-${staff.id}-${targetMonth}`,
        });
      }
    },
    [createShiftRequest, currentUserId, days, notify, shiftRequest, staff, targetMonth, updateShiftCell],
  );

  const handleShiftChange = useCallback(
    (key: string, value: string | null) => {
      const nextState: ShiftState =
        value === "work" ? "work" : value === "off" ? "off" : undefined;

      setShiftStates((prev) => {
        const currentState = prev[key];
        if (currentState === nextState) {
          return prev;
        }

        const next = { ...prev };
        if (nextState) {
          next[key] = nextState;
        } else {
          delete next[key];
        }

        void persistShiftStates(next, prev);
        return next;
      });
    },
    [persistShiftStates],
  );

  const prevMonth = useCallback(
    () => setCurrentMonth((m) => m.subtract(1, "month")),
    [],
  );
  const nextMonth = useCallback(
    () => setCurrentMonth((m) => m.add(1, "month")),
    [],
  );

  return {
    staff,
    currentMonth,
    monthStart,
    targetMonth,
    days,
    shiftStates,
    publicHolidaySet,
    companyHolidaySet,
    isSaving,
    calendarLoading,
    shiftRequestLoading,
    shiftRequestFetching,
    shiftRequest,
    prevMonth,
    nextMonth,
    handleShiftChange,
  };
};
