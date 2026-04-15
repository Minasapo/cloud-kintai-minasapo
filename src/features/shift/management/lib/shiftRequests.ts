import {
  ListShiftRequestsQuery,
  ShiftRequestDayPreferenceInput,
  ShiftRequestHistoryInput,
} from "@shared/api/graphql/types";
import dayjs from "dayjs";

import { ShiftState } from "./generateMockShifts";
import { shiftRequestStatusToShiftState } from "./shiftStateMapping";

export type ShiftRequestRecordSnapshot = {
  id: string | null;
  version?: number;
  histories: ShiftRequestHistoryInput[];
  note?: string | null;
  submittedAt?: string | null;
  targetMonth: string;
};

export type ShiftRequestHistoryMeta = {
  changeCount: number;
  latestChangeAt: string | null;
};

type ListShiftRequestItem = NonNullable<
  NonNullable<
    NonNullable<ListShiftRequestsQuery["listShiftRequests"]>["items"]
  >[number]
>;

type ListShiftRequestHistoryItem = NonNullable<
  NonNullable<ListShiftRequestItem["histories"]>[number]
>;

export const convertHistoryToInput = (
  history: ListShiftRequestHistoryItem,
): ShiftRequestHistoryInput => ({
  version: history.version,
  note: history.note ?? undefined,
  entries:
    history.entries
      ?.filter((entry): entry is NonNullable<typeof entry> => entry !== null)
      .map<ShiftRequestDayPreferenceInput>((entry) => ({
        date: entry.date,
        status: entry.status,
      })) ?? [],
  summary: history.summary
    ? {
        workDays: history.summary.workDays ?? undefined,
        fixedOffDays: history.summary.fixedOffDays ?? undefined,
        requestedOffDays: history.summary.requestedOffDays ?? undefined,
      }
    : undefined,
  submittedAt: history.submittedAt ?? undefined,
  updatedAt: history.updatedAt ?? undefined,
  recordedAt:
    history.recordedAt ??
    history.updatedAt ??
    history.submittedAt ??
    dayjs().toISOString(),
  recordedByStaffId: history.recordedByStaffId ?? undefined,
  changeReason: history.changeReason ?? undefined,
});

/**
 * Hope shift items processed into structured maps for use in hooks.
 */
export function processShiftRequestItems(
  items: ListShiftRequestItem[],
  staffIdSet: Set<string>,
  targetMonthKey: string,
): {
  nextAssignments: Map<string, Record<string, ShiftState>>;
  nextHistoryMeta: Map<string, ShiftRequestHistoryMeta>;
  nextRecords: Map<string, ShiftRequestRecordSnapshot>;
} {
  const nextAssignments = new Map<string, Record<string, ShiftState>>();
  const nextHistoryMeta = new Map<string, ShiftRequestHistoryMeta>();
  const nextRecords = new Map<string, ShiftRequestRecordSnapshot>();

  items.forEach((item) => {
    if (!staffIdSet.has(item.staffId)) return;
    const per: Record<string, ShiftState> = {};
    item.entries
      ?.filter((entry): entry is NonNullable<typeof entry> => entry !== null)
      .forEach((entry) => {
        per[entry.date] = shiftRequestStatusToShiftState(entry.status);
      });
    nextAssignments.set(item.staffId, per);

    const histories =
      item.histories?.filter(
        (history): history is NonNullable<typeof history> => history !== null,
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
      version: item.version ?? undefined,
      histories: historyInputs,
      note: item.note ?? undefined,
      submittedAt: item.submittedAt ?? undefined,
      targetMonth: item.targetMonth ?? targetMonthKey,
    });
  });

  return { nextAssignments, nextHistoryMeta, nextRecords };
}
