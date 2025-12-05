import { GraphQLResult } from "@aws-amplify/api";
import {
  Alert,
  Badge,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { API } from "aws-amplify";
import dayjs from "dayjs";
import React, { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  CreateShiftRequestMutation,
  ListShiftRequestsQuery,
  ShiftRequestDayPreferenceInput,
  ShiftRequestHistoryInput,
  ShiftRequestStatus,
  ShiftRequestSummaryInput,
  UpdateShiftRequestMutation,
} from "@/API";
import { useAppDispatchV2 } from "@/app/hooks";
import CommonBreadcrumbs from "@/components/common/CommonBreadcrumbs";
import { AppConfigContext } from "@/context/AppConfigContext";
import * as MESSAGE_CODE from "@/errors";
import { createShiftRequest, updateShiftRequest } from "@/graphql/mutations";
import { listShiftRequests } from "@/graphql/queries";
import useCognitoUser from "@/hooks/useCognitoUser";
import useShiftPlanYear from "@/hooks/useShiftPlanYear";
import {
  useGetCompanyHolidayCalendarsQuery,
  useGetHolidayCalendarsQuery,
} from "@/lib/api/calendarApi";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/lib/reducers/snackbarReducer";

import useStaffs from "../../hooks/useStaffs/useStaffs";
import generateMockShifts, { ShiftState } from "./generateMockShifts";

const shiftRequestStatusToShiftState = (
  status?: ShiftRequestStatus | null
): ShiftState => {
  switch (status) {
    case ShiftRequestStatus.WORK:
      return "work";
    case ShiftRequestStatus.FIXED_OFF:
      return "fixedOff";
    case ShiftRequestStatus.REQUESTED_OFF:
      return "requestedOff";
    default:
      return "auto";
  }
};

const shiftStateToShiftRequestStatus = (
  state: ShiftState
): ShiftRequestStatus => {
  switch (state) {
    case "work":
      return ShiftRequestStatus.WORK;
    case "fixedOff":
      return ShiftRequestStatus.FIXED_OFF;
    case "requestedOff":
      return ShiftRequestStatus.REQUESTED_OFF;
    default:
      return ShiftRequestStatus.AUTO;
  }
};

const statusVisualMap: Record<ShiftState, { label: string; color: string }> = {
  work: { label: "○", color: "success.main" },
  fixedOff: { label: "固", color: "error.main" },
  requestedOff: { label: "希", color: "warning.main" },
  auto: { label: "△", color: "info.main" },
};

const defaultStatusVisual = { label: "-", color: "text.secondary" };

const shiftStateOptions: Array<{ value: ShiftState; label: string }> = [
  { value: "work", label: "出勤" },
  { value: "fixedOff", label: "固定休" },
  { value: "requestedOff", label: "希望休" },
  { value: "auto", label: "自動調整枠" },
];

const SHIFT_MANUAL_CHANGE_REASON = "shift-management/manual-edit";

type ShiftRequestRecordSnapshot = {
  id: string | null;
  histories: ShiftRequestHistoryInput[];
  note?: string | null;
  submittedAt?: string | null;
  targetMonth: string;
};

type ListShiftRequestItem = NonNullable<
  NonNullable<
    NonNullable<ListShiftRequestsQuery["listShiftRequests"]>["items"]
  >[number]
>;

type ListShiftRequestHistoryItem = NonNullable<
  NonNullable<ListShiftRequestItem["histories"]>[number]
>;

const convertHistoryToInput = (
  history: ListShiftRequestHistoryItem
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

const buildSummaryFromAssignments = (
  assignments: Record<string, ShiftState>
): ShiftRequestSummaryInput => {
  const values = Object.values(assignments);
  const count = (target: ShiftState) =>
    values.filter((state) => state === target).length;
  return {
    workDays: count("work"),
    fixedOffDays: count("fixedOff"),
    requestedOffDays: count("requestedOff"),
  };
};

const ROW_HIGHLIGHT_COLOR = "rgba(63, 81, 181, 0.12)";
const COLUMN_HIGHLIGHT_COLOR = "rgba(255, 193, 7, 0.18)";
const INTERSECTION_HIGHLIGHT_COLOR = "rgba(76, 175, 80, 0.2)";

const getCellHighlightSx = (
  isRowSelected: boolean,
  isColumnSelected: boolean
) => {
  if (!isRowSelected && !isColumnSelected) return null;
  const color = isRowSelected
    ? isColumnSelected
      ? INTERSECTION_HIGHLIGHT_COLOR
      : ROW_HIGHLIGHT_COLOR
    : COLUMN_HIGHLIGHT_COLOR;
  return { boxShadow: `inset 0 0 0 9999px ${color}` };
};

type ShiftGroupConstraints = {
  min: number | null;
  max: number | null;
  fixed: number | null;
};

type GroupCoveragePresentation = {
  primary: string;
  primaryColor: string;
  violationReason?: string | null;
  violationTone?: "error" | "warning" | null;
};

const getGroupCoveragePresentation = (
  actual: number,
  constraints: ShiftGroupConstraints
): GroupCoveragePresentation => {
  const hasMin = constraints.min !== null;
  const hasMax = constraints.max !== null;

  let violationReason: string | null = null;
  let violationTone: "error" | "warning" | null = null;

  if (constraints.fixed !== null) {
    if (actual < constraints.fixed) {
      violationReason = `固定人数 ${constraints.fixed}名を下回っています`;
      violationTone = "error";
    } else if (actual > constraints.fixed) {
      violationReason = `固定人数 ${constraints.fixed}名を超えています`;
      violationTone = "warning";
    }
  } else {
    if (hasMin && actual < (constraints.min as number)) {
      violationReason = `必要人数は${constraints.min}名以上です`;
      violationTone = "error";
    } else if (hasMax && actual > (constraints.max as number)) {
      violationReason = `必要人数は${constraints.max}名以下です`;
      violationTone = "warning";
    }
  }

  let primaryColor = "text.primary";
  if (violationTone === "error") {
    primaryColor = "error.main";
  } else if (violationTone === "warning") {
    primaryColor = "warning.main";
  }

  return {
    primary: `${actual}`,
    primaryColor,
    violationReason,
    violationTone,
  };
};

const getShiftKeyState = (nativeEvent: Event) => {
  if ("shiftKey" in nativeEvent) {
    return Boolean(
      (nativeEvent as MouseEvent | KeyboardEvent | PointerEvent).shiftKey
    );
  }
  return false;
};

// ShiftManagement: シフト管理テーブル。左固定列を前面に出し、各日ごとの出勤人数を集計して表示する。
export default function ShiftManagement() {
  const navigate = useNavigate();
  const dispatch = useAppDispatchV2();
  const { cognitoUser } = useCognitoUser();
  const { loading, error, staffs } = useStaffs();
  const { getShiftGroups } = useContext(AppConfigContext);

  const shiftStaffs = useMemo(
    () => staffs.filter((s) => s.workType === "shift"),
    [staffs]
  );

  const shiftGroupDefinitions = useMemo(
    () =>
      getShiftGroups().map((group) => ({
        label: group.label,
        description: group.description ?? "運用上の調整グループ",
        min: group.min ?? null,
        max: group.max ?? null,
        fixed: group.fixed ?? null,
      })),
    [getShiftGroups]
  );

  const groupedShiftStaffs = useMemo(() => {
    if (shiftGroupDefinitions.length === 0) {
      return shiftStaffs.length
        ? [
            {
              groupName: "シフト勤務スタッフ",
              description:
                "シフトグループが未設定のため、全員をまとめて表示しています。",
              members: shiftStaffs,
              constraints: { min: null, max: null, fixed: null },
            },
          ]
        : [];
    }

    const groups = shiftGroupDefinitions.map((definition) => ({
      groupName: definition.label,
      description: definition.description,
      members: [] as typeof shiftStaffs,
      constraints: {
        min: definition.min ?? null,
        max: definition.max ?? null,
        fixed: definition.fixed ?? null,
      } satisfies ShiftGroupConstraints,
    }));
    const groupMap = new Map(groups.map((group) => [group.groupName, group]));
    const unassigned: typeof shiftStaffs = [];

    shiftStaffs.forEach((staff) => {
      if (staff.shiftGroup && groupMap.has(staff.shiftGroup)) {
        groupMap.get(staff.shiftGroup)!.members.push(staff);
      } else {
        unassigned.push(staff);
      }
    });

    return [
      ...groups,
      ...(unassigned.length
        ? [
            {
              groupName: "未割り当て",
              description: "シフトグループが設定されていないメンバーです。",
              members: unassigned,
              constraints: { min: null, max: null, fixed: null },
            },
          ]
        : []),
    ];
  }, [shiftGroupDefinitions, shiftStaffs]);

  const displayedStaffOrder = useMemo(
    () => groupedShiftStaffs.flatMap((group) => group.members),
    [groupedShiftStaffs]
  );

  const staffIdToIndex = useMemo(() => {
    const map = new Map<string, number>();
    displayedStaffOrder.forEach((staff, index) => {
      map.set(staff.id, index);
    });
    return map;
  }, [displayedStaffOrder]);

  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const monthStart = useMemo(
    () => currentMonth.startOf("month"),
    [currentMonth]
  );
  const daysInMonth = monthStart.daysInMonth();

  const days = useMemo(
    () =>
      Array.from({ length: daysInMonth }).map((_, i) =>
        monthStart.add(i, "day")
      ),
    [monthStart.year(), monthStart.month(), daysInMonth]
  );

  const dayKeyList = useMemo(
    () => days.map((day) => day.format("YYYY-MM-DD")),
    [days]
  );

  const dayKeyToIndex = useMemo(() => {
    const map = new Map<string, number>();
    dayKeyList.forEach((key, index) => {
      map.set(key, index);
    });
    return map;
  }, [dayKeyList]);

  const { data: holidayCalendars = [], error: holidayCalendarsError } =
    useGetHolidayCalendarsQuery();
  const {
    data: companyHolidayCalendars = [],
    error: companyHolidayCalendarsError,
  } = useGetCompanyHolidayCalendarsQuery();

  React.useEffect(() => {
    if (holidayCalendarsError || companyHolidayCalendarsError) {
      console.error(holidayCalendarsError ?? companyHolidayCalendarsError);
      dispatch(setSnackbarError(MESSAGE_CODE.E00001));
    }
  }, [holidayCalendarsError, companyHolidayCalendarsError, dispatch]);

  const holidaySet = useMemo(
    () => new Set(holidayCalendars.map((h) => h.holidayDate)),
    [holidayCalendars]
  );
  const companyHolidaySet = useMemo(
    () => new Set(companyHolidayCalendars.map((h) => h.holidayDate)),
    [companyHolidayCalendars]
  );

  const holidayNameMap = useMemo(
    () => new Map(holidayCalendars.map((h) => [h.holidayDate, h.name])),
    [holidayCalendars]
  );
  const companyHolidayNameMap = useMemo(
    () => new Map(companyHolidayCalendars.map((h) => [h.holidayDate, h.name])),
    [companyHolidayCalendars]
  );

  const {
    plans: shiftPlanPlans,
    loading: shiftPlanLoading,
    error: shiftPlanError,
  } = useShiftPlanYear(monthStart.year());

  const getHeaderCellSx = (d: dayjs.Dayjs) => {
    const dateKey = d.format("YYYY-MM-DD");
    const day = d.day();
    if (holidaySet.has(dateKey) || day === 0)
      return { minWidth: DAY_COL_WIDTH, bgcolor: "rgba(244,67,54,0.18)" };
    if (companyHolidaySet.has(dateKey))
      return { minWidth: DAY_COL_WIDTH, bgcolor: "rgba(255,152,0,0.18)" };
    if (day === 6)
      return { minWidth: DAY_COL_WIDTH, bgcolor: "rgba(33,150,243,0.12)" };
    return { minWidth: DAY_COL_WIDTH };
  };

  // シミュレーションシナリオを選べるようにする（デフォルトは実際の希望シフト）
  const [scenario] = React.useState<string>("actual");

  // mockShifts を state 化し、scenario/shiftStaffs/days に応じて生成する
  const [mockShifts, setMockShifts] = React.useState<
    Map<string, Record<string, ShiftState>>
  >(new Map());

  const [shiftRequestAssignments, setShiftRequestAssignments] = React.useState<
    Map<string, Record<string, ShiftState>>
  >(new Map());
  const [shiftRequestHistoryMeta, setShiftRequestHistoryMeta] = React.useState<
    Map<string, { changeCount: number; latestChangeAt: string | null }>
  >(new Map());
  const [shiftRequestRecords, setShiftRequestRecords] = useState<
    Map<string, ShiftRequestRecordSnapshot>
  >(new Map());
  const [shiftRequestsLoading, setShiftRequestsLoading] = useState(false);
  const [shiftRequestsError, setShiftRequestsError] = useState<string | null>(
    null
  );
  const [editingCell, setEditingCell] = useState<{
    staffId: string;
    staffName: string;
    dateKey: string;
  } | null>(null);
  const [editingState, setEditingState] = useState<ShiftState>("auto");
  const [selectedStaffIds, setSelectedStaffIds] = useState<Set<string>>(
    () => new Set()
  );
  const [selectedDayKeys, setSelectedDayKeys] = useState<Set<string>>(
    () => new Set()
  );
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [bulkEditState, setBulkEditState] = useState<ShiftState>("work");
  const [isSavingSingleEdit, setIsSavingSingleEdit] = useState(false);
  const [isSavingBulkEdit, setIsSavingBulkEdit] = useState(false);

  React.useEffect(() => {
    // 実績表示モードではモック生成は不要
    if (scenario === "actual") {
      setMockShifts(new Map());
      return;
    }
    // shiftStaffs が未ロードのときは空のマップを設定
    if (!shiftStaffs || shiftStaffs.length === 0) {
      setMockShifts(new Map());
      return;
    }
    const map = generateMockShifts(
      shiftStaffs.map((s) => ({ id: s.id })),
      days,
      scenario
    );
    setMockShifts(map);
  }, [shiftStaffs, days, scenario]);

  React.useEffect(() => {
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
        const nextHistoryMeta = new Map<
          string,
          { changeCount: number; latestChangeAt: string | null }
        >();
        const nextRecords = new Map<string, ShiftRequestRecordSnapshot>();
        let nextToken: string | null | undefined = undefined;

        do {
          const response = (await API.graphql({
            query: listShiftRequests,
            variables: {
              filter: { targetMonth: { eq: targetMonthKey } },
              limit: 500,
              nextToken,
            },
            authMode: "AMAZON_COGNITO_USER_POOLS",
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
  }, [shiftStaffs, monthStart]);

  const displayShifts = useMemo(() => {
    const next = new Map<string, Record<string, ShiftState>>();
    shiftStaffs.forEach((staff) => {
      if (scenario === "actual" && shiftRequestAssignments.has(staff.id)) {
        next.set(staff.id, shiftRequestAssignments.get(staff.id)!);
      } else if (scenario !== "actual" && mockShifts.has(staff.id)) {
        next.set(staff.id, mockShifts.get(staff.id)!);
      } else {
        next.set(staff.id, {});
      }
    });
    return next;
  }, [mockShifts, scenario, shiftRequestAssignments, shiftStaffs]);

  const dailyCounts = useMemo(() => {
    const m = new Map<string, number>();
    days.forEach((d) => {
      const key = d.format("YYYY-MM-DD");
      let cnt = 0;
      shiftStaffs.forEach((s) => {
        if (displayShifts.get(s.id)?.[key] === "work") cnt += 1;
      });
      m.set(key, cnt);
    });
    return m;
  }, [days, shiftStaffs, displayShifts]);

  const groupDailyCounts = useMemo(() => {
    const result = new Map<string, Map<string, number>>();
    groupedShiftStaffs.forEach(({ groupName, members }) => {
      const groupCounts = new Map<string, number>();
      days.forEach((d) => {
        const key = d.format("YYYY-MM-DD");
        let cnt = 0;
        members.forEach((member) => {
          if (displayShifts.get(member.id)?.[key] === "work") cnt += 1;
        });
        groupCounts.set(key, cnt);
      });
      result.set(groupName, groupCounts);
    });
    return result;
  }, [displayShifts, groupedShiftStaffs, days]);

  const plannedDailyCounts = useMemo(() => {
    const targetMonth = monthStart.month() + 1;
    const map = new Map<string, number | null>();
    days.forEach((d) => {
      map.set(d.format("YYYY-MM-DD"), null);
    });
    if (!shiftPlanPlans) {
      return map;
    }
    const monthPlan =
      shiftPlanPlans.find(
        (plan) => typeof plan.month === "number" && plan.month === targetMonth
      ) ?? null;
    if (!monthPlan) {
      return map;
    }
    const capacities = monthPlan.dailyCapacities ?? [];
    days.forEach((d, index) => {
      const value = capacities[index];
      map.set(
        d.format("YYYY-MM-DD"),
        typeof value === "number" && !Number.isNaN(value) ? value : null
      );
    });
    return map;
  }, [days, monthStart, shiftPlanPlans]);

  const isEditDialogOpen = Boolean(editingCell);
  const editingDialogDateLabel = editingCell
    ? dayjs(editingCell.dateKey).format("YYYY年M月D日 (dd)")
    : "";
  const hasBulkSelection =
    selectedStaffIds.size > 0 && selectedDayKeys.size > 0;
  const selectedCellCount = selectedStaffIds.size * selectedDayKeys.size;
  // Shift+クリック時に連続選択するための起点インデックスを保持
  const lastStaffSelectionIndexRef = React.useRef<number | null>(null);
  const lastDaySelectionIndexRef = React.useRef<number | null>(null);

  const updateStaffSelections = (ids: string[], shouldSelect: boolean) => {
    if (!ids.length) return;
    setSelectedStaffIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => {
        if (shouldSelect) {
          next.add(id);
        } else {
          next.delete(id);
        }
      });
      return next;
    });
  };

  const updateDaySelections = (keys: string[], shouldSelect: boolean) => {
    if (!keys.length) return;
    setSelectedDayKeys((prev) => {
      const next = new Set(prev);
      keys.forEach((key) => {
        if (shouldSelect) {
          next.add(key);
        } else {
          next.delete(key);
        }
      });
      return next;
    });
  };

  const handleStaffCheckboxChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    staffId: string
  ) => {
    event.stopPropagation();
    const shouldSelect = event.target.checked;
    const staffIndex = staffIdToIndex.get(staffId);
    const isShiftSelection =
      staffIndex !== undefined &&
      lastStaffSelectionIndexRef.current !== null &&
      getShiftKeyState(event.nativeEvent);

    if (isShiftSelection) {
      const start = Math.min(
        staffIndex,
        lastStaffSelectionIndexRef.current as number
      );
      const end = Math.max(
        staffIndex,
        lastStaffSelectionIndexRef.current as number
      );
      const idsInRange = displayedStaffOrder
        .slice(start, end + 1)
        .map((staff) => staff.id);
      updateStaffSelections(idsInRange, shouldSelect);
    } else {
      updateStaffSelections([staffId], shouldSelect);
    }

    if (staffIndex !== undefined) {
      lastStaffSelectionIndexRef.current = staffIndex;
    } else {
      lastStaffSelectionIndexRef.current = null;
    }
  };

  const persistShiftRequestChanges = async (
    staffId: string,
    dayKeys: string[],
    nextState: ShiftState
  ) => {
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
      recordedByStaffId: cognitoUser?.id ?? undefined,
      changeReason: SHIFT_MANUAL_CHANGE_REASON,
    };
    const historiesInput = [...baseHistories, historyEntry];

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
      const response = (await API.graphql({
        query: updateShiftRequest,
        variables: {
          input: {
            id: record.id,
            ...inputBase,
          },
        },
        authMode: "AMAZON_COGNITO_USER_POOLS",
      })) as GraphQLResult<UpdateShiftRequestMutation>;

      if (response.errors?.length) {
        throw new Error(response.errors.map((e) => e.message).join(","));
      }

      responseShiftRequest = response.data?.updateShiftRequest;
    } else {
      const response = (await API.graphql({
        query: createShiftRequest,
        variables: {
          input: {
            staffId,
            targetMonth: targetMonthKey,
            ...inputBase,
          },
        },
        authMode: "AMAZON_COGNITO_USER_POOLS",
      })) as GraphQLResult<CreateShiftRequestMutation>;

      if (response.errors?.length) {
        throw new Error(response.errors.map((e) => e.message).join(","));
      }

      responseShiftRequest = response.data?.createShiftRequest;
    }

    if (!responseShiftRequest) {
      throw new Error("Shift request mutation returned no data");
    }

    const ensuredShiftRequest = responseShiftRequest;

    setShiftRequestAssignments((prev) => {
      const next = new Map(prev);
      next.set(staffId, updatedAssignments);
      return next;
    });

    setShiftRequestRecords((prev) => {
      const next = new Map(prev);
      next.set(staffId, {
        id: ensuredShiftRequest.id,
        histories: historiesInput,
        note: ensuredShiftRequest.note ?? record?.note ?? undefined,
        submittedAt: ensuredShiftRequest.submittedAt ?? timestamp,
        targetMonth: ensuredShiftRequest.targetMonth ?? targetMonthKey,
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
  };

  const applyShiftState = async (
    staffIds: string[],
    dayKeys: string[],
    nextState: ShiftState
  ) => {
    if (!staffIds.length || !dayKeys.length) return;
    if (scenario === "actual") {
      for (const staffId of staffIds) {
        await persistShiftRequestChanges(staffId, dayKeys, nextState);
      }
      return;
    }

    setMockShifts((prev) => {
      const next = new Map(prev);
      staffIds.forEach((staffId) => {
        const per = { ...(next.get(staffId) || {}) };
        dayKeys.forEach((key) => {
          per[key] = nextState;
        });
        next.set(staffId, per);
      });
      return next;
    });
  };

  const handleDayCheckboxChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    dateKey: string
  ) => {
    event.stopPropagation();
    const shouldSelect = event.target.checked;
    const dayIndex = dayKeyToIndex.get(dateKey);
    const isShiftSelection =
      dayIndex !== undefined &&
      lastDaySelectionIndexRef.current !== null &&
      getShiftKeyState(event.nativeEvent);

    if (isShiftSelection) {
      const start = Math.min(
        dayIndex,
        lastDaySelectionIndexRef.current as number
      );
      const end = Math.max(
        dayIndex,
        lastDaySelectionIndexRef.current as number
      );
      const keysInRange = dayKeyList.slice(start, end + 1);
      updateDaySelections(keysInRange, shouldSelect);
    } else {
      updateDaySelections([dateKey], shouldSelect);
    }

    if (dayIndex !== undefined) {
      lastDaySelectionIndexRef.current = dayIndex;
    } else {
      lastDaySelectionIndexRef.current = null;
    }
  };

  React.useEffect(() => {
    lastStaffSelectionIndexRef.current = null;
  }, [displayedStaffOrder]);

  React.useEffect(() => {
    lastDaySelectionIndexRef.current = null;
  }, [dayKeyList]);

  const openShiftEditDialog = (
    staffId: string,
    staffName: string,
    dateKey: string,
    currentState: ShiftState
  ) => {
    setEditingCell({ staffId, staffName, dateKey });
    setEditingState(currentState);
  };

  const closeShiftEditDialog = () => setEditingCell(null);

  const saveShiftEdit = async () => {
    if (!editingCell) return;
    setIsSavingSingleEdit(true);

    try {
      const { staffId, dateKey } = editingCell;
      await applyShiftState([staffId], [dateKey], editingState);
      dispatch(setSnackbarSuccess(MESSAGE_CODE.S16001));
      closeShiftEditDialog();
    } catch (error) {
      console.error("Failed to save shift edit", error);
      dispatch(setSnackbarError(MESSAGE_CODE.E16001));
    } finally {
      setIsSavingSingleEdit(false);
    }
  };

  const prevMonth = () => setCurrentMonth((m) => m.subtract(1, "month"));
  const nextMonth = () => setCurrentMonth((m) => m.add(1, "month"));
  const openBulkEditDialog = () => {
    if (!hasBulkSelection) return;
    setIsBulkDialogOpen(true);
  };
  const closeBulkEditDialog = () => setIsBulkDialogOpen(false);
  const applyBulkEdit = async () => {
    if (!hasBulkSelection) return;
    setIsSavingBulkEdit(true);

    try {
      const staffIds = Array.from(selectedStaffIds);
      const dayKeys = Array.from(selectedDayKeys);
      await applyShiftState(staffIds, dayKeys, bulkEditState);
      dispatch(setSnackbarSuccess(MESSAGE_CODE.S16001));
      closeBulkEditDialog();
    } catch (error) {
      console.error("Failed to apply bulk shift edit", error);
      dispatch(setSnackbarError(MESSAGE_CODE.E16001));
    } finally {
      setIsSavingBulkEdit(false);
    }
  };

  // 固定幅を抑えて全体をコンパクトに表示
  const STAFF_COL_WIDTH = 220;
  // 出勤・休暇の集計列は説明文と値の両方が収まる幅を確保
  const AGG_COL_WIDTH = 132;
  const HISTORY_COL_WIDTH = 120;
  const DAY_COL_WIDTH = 48;
  const SUMMARY_LEFTS = {
    aggregate: STAFF_COL_WIDTH,
    changeHistory: STAFF_COL_WIDTH + AGG_COL_WIDTH,
  } as const;

  return (
    <Container sx={{ py: 3 }}>
      <Box sx={{ mb: 1 }}>
        <CommonBreadcrumbs
          items={[{ label: "TOP", href: "/" }]}
          current="シフト管理"
        />
      </Box>

      <Typography variant="h4" gutterBottom>
        シフト管理
      </Typography>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Chip label="前月" onClick={prevMonth} sx={{ mr: 1 }} clickable />
          <Chip label={monthStart.format("YYYY年 M月")} sx={{ mr: 1 }} />
          <Chip label="翌月" onClick={nextMonth} clickable />

          {hasBulkSelection ? (
            <Badge
              badgeContent={selectedCellCount}
              color="primary"
              sx={{
                "& .MuiBadge-badge": {
                  right: 0,
                  top: 0,
                  border: `2px solid`,
                },
              }}
            >
              <Button
                variant="contained"
                color="primary"
                disabled={!hasBulkSelection}
                onClick={openBulkEditDialog}
              >
                選択した項目を変更
              </Button>
            </Badge>
          ) : (
            <Button
              variant="contained"
              color="primary"
              disabled
              onClick={openBulkEditDialog}
            >
              選択した項目を変更
            </Button>
          )}
        </Box>
      </Box>

      {(loading || shiftRequestsLoading) && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error">
          スタッフの取得中にエラーが発生しました: {error.message}
        </Alert>
      )}

      {shiftRequestsError && (
        <Alert severity="error">{shiftRequestsError}</Alert>
      )}

      {shiftPlanError && (
        <Alert severity="error">
          シフト計画の取得に失敗しました。
          {shiftPlanError !== "Unknown error" ? ` (${shiftPlanError})` : null}
        </Alert>
      )}

      {!loading && !shiftRequestsLoading && !error && (
        <>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 0.5,
              mb: 1.5,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              凡例
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Typography
                  sx={{ color: statusVisualMap.work.color, fontWeight: 700 }}
                >
                  {statusVisualMap.work.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  出勤
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Typography
                  sx={{
                    color: statusVisualMap.fixedOff.color,
                    fontWeight: 700,
                  }}
                >
                  {statusVisualMap.fixedOff.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  固定休
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Typography
                  sx={{
                    color: statusVisualMap.requestedOff.color,
                    fontWeight: 700,
                  }}
                >
                  {statusVisualMap.requestedOff.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  希望休
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Typography
                  sx={{ color: statusVisualMap.auto.color, fontWeight: 700 }}
                >
                  {statusVisualMap.auto.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  自動調整枠
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: 0.5,
                    bgcolor: "rgba(244, 67, 54, 0.18)",
                    border: "1px solid",
                    borderColor: "rgba(244, 67, 54, 0.32)",
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  下限未達／固定人数不足
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: 0.5,
                    bgcolor: "rgba(255, 193, 7, 0.18)",
                    border: "1px solid",
                    borderColor: "rgba(255, 193, 7, 0.4)",
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  上限超過／固定人数超過
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                数値は日別の出勤人数を示します。
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              position: "relative",
              overflow: "auto",
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
            }}
          >
            <Table
              stickyHeader
              size="small"
              sx={{
                minWidth:
                  STAFF_COL_WIDTH +
                  AGG_COL_WIDTH +
                  HISTORY_COL_WIDTH +
                  days.length * DAY_COL_WIDTH,
                tableLayout: "fixed",
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      bgcolor: "background.paper",
                      width: STAFF_COL_WIDTH,
                      minWidth: STAFF_COL_WIDTH,
                      maxWidth: STAFF_COL_WIDTH,
                      boxSizing: "border-box",
                      pl: 0.25,
                      py: 0.25,
                      borderRight: "1px solid",
                      borderColor: "divider",
                      // 左に固定してスクロールしても見えるようにする
                      position: "sticky",
                      left: 0,
                      top: 0,
                      zIndex: 3,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    スタッフ
                  </TableCell>

                  <TableCell
                    align="center"
                    aria-label="集計"
                    title="集計"
                    sx={{
                      bgcolor: "background.paper",
                      width: AGG_COL_WIDTH,
                      boxSizing: "border-box",
                      position: "sticky",
                      top: 0,
                      left: `${SUMMARY_LEFTS.aggregate}px`,
                      zIndex: 3,
                      borderRight: "1px solid",
                      borderColor: "divider",
                      verticalAlign: "top",
                      py: 0.25,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        lineHeight: 1.2,
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        集計
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ whiteSpace: "nowrap" }}
                      >
                        (出勤/固定休/希望休)
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell
                    align="center"
                    aria-label="最新変更 (回数)"
                    title="最新変更 (回数)"
                    sx={{
                      bgcolor: "background.paper",
                      width: HISTORY_COL_WIDTH,
                      boxSizing: "border-box",
                      position: "sticky",
                      top: 0,
                      left: `${SUMMARY_LEFTS.changeHistory}px`,
                      zIndex: 3,
                      whiteSpace: "nowrap",
                      borderRight: "1px solid",
                      borderColor: "divider",
                      verticalAlign: "top",
                      py: 0.25,
                    }}
                  >
                    <Typography
                      component="span"
                      sx={{ fontSize: 12, fontWeight: 600 }}
                    >
                      最新変更 (回数)
                    </Typography>
                  </TableCell>

                  {days.map((d) => {
                    const key = d.format("YYYY-MM-DD");
                    const title =
                      holidayNameMap.get(key) ||
                      companyHolidayNameMap.get(key) ||
                      undefined;
                    const content = (
                      <>
                        <Box sx={{ fontSize: 12 }}>{d.format("D")}</Box>
                        <Box sx={{ fontSize: 11, color: "text.secondary" }}>
                          {d.format("dd")}
                        </Box>
                      </>
                    );
                    const isSelected = selectedDayKeys.has(key);
                    const columnHighlightSx =
                      getCellHighlightSx(false, isSelected) ?? {};
                    return (
                      <TableCell
                        key={key}
                        align="center"
                        sx={{
                          ...getHeaderCellSx(d),
                          position: "relative",
                          top: 0,
                          zIndex: 0,
                          borderLeft: "1px solid",
                          borderColor: "divider",
                          px: 0.2,
                          py: 0.1,
                          ...columnHighlightSx,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 0.25,
                          }}
                        >
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            onChange={(event) =>
                              handleDayCheckboxChange(event, key)
                            }
                            inputProps={{
                              "aria-label": `${d.format("M月D日")}を選択`,
                            }}
                          />
                          <Box
                            sx={{ cursor: "pointer", px: 0.25 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/shift/day/${key}`);
                            }}
                          >
                            {title ? (
                              <Tooltip title={title}>{content}</Tooltip>
                            ) : (
                              content
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableHead>

              <TableBody>
                <TableRow sx={{ cursor: "default" }}>
                  <TableCell
                    colSpan={3}
                    sx={{
                      bgcolor: "background.paper",
                      py: 0.25,
                      width:
                        STAFF_COL_WIDTH + AGG_COL_WIDTH + HISTORY_COL_WIDTH,
                      boxSizing: "border-box",
                      pl: 1,
                      borderRight: "1px solid",
                      borderColor: "divider",
                      position: "sticky",
                      left: 0,
                      zIndex: 2,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      textAlign: "right",
                    }}
                  >
                    <Typography variant="body2">計画人数</Typography>
                  </TableCell>

                  {days.map((d) => {
                    const key = d.format("YYYY-MM-DD");
                    const planned = plannedDailyCounts.get(key);
                    const displayValue = shiftPlanLoading
                      ? "..."
                      : typeof planned === "number"
                      ? planned
                      : "-";
                    const highlightSx =
                      getCellHighlightSx(false, selectedDayKeys.has(key)) ?? {};
                    return (
                      <TableCell
                        key={`${key}-plan`}
                        sx={{
                          p: 0.25,
                          width: DAY_COL_WIDTH,
                          height: 40,
                          position: "relative",
                          borderLeft: "1px solid",
                          borderColor: "divider",
                          ...highlightSx,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, fontSize: 14 }}
                          >
                            {displayValue}
                          </Typography>
                        </Box>
                      </TableCell>
                    );
                  })}
                </TableRow>

                {shiftStaffs.length > 0 && (
                  <>
                    {/* 想定人数と過不足を1行に統合 */}
                    <TableRow sx={{ cursor: "default" }}>
                      <TableCell
                        colSpan={3}
                        sx={{
                          bgcolor: "background.paper",
                          py: 0.25,
                          width:
                            STAFF_COL_WIDTH + AGG_COL_WIDTH + HISTORY_COL_WIDTH,
                          boxSizing: "border-box",
                          borderRight: "1px solid",
                          borderColor: "divider",
                          position: "sticky",
                          left: 0,
                          zIndex: 2,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          textAlign: "right",
                        }}
                      >
                        <Typography variant="body2">出勤人数(合計)</Typography>
                      </TableCell>

                      {days.map((d) => {
                        const key = d.format("YYYY-MM-DD");
                        const actual = dailyCounts.get(key) ?? 0;
                        const highlightSx =
                          getCellHighlightSx(false, selectedDayKeys.has(key)) ??
                          {};
                        return (
                          <TableCell
                            key={key}
                            sx={{
                              p: 0.25,
                              width: DAY_COL_WIDTH,
                              height: 40,
                              position: "relative",
                              borderLeft: "1px solid",
                              borderColor: "divider",
                              ...highlightSx,
                            }}
                            align="center"
                          >
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600, fontSize: 14 }}
                              >
                                {actual}
                              </Typography>
                            </Box>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  </>
                )}

                {shiftStaffs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={days.length + 3}>
                      <Typography sx={{ py: 2 }}>
                        シフト勤務のスタッフは見つかりませんでした。
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}

                {groupedShiftStaffs.map(
                  ({ groupName, description, members, constraints }) => {
                    const coverage = groupDailyCounts.get(groupName);
                    const isUnassignedGroup = groupName === "未割り当て";
                    const targetLabel = (() => {
                      if (constraints.fixed !== null) {
                        return `必要人数：${constraints.fixed}名`;
                      }
                      if (
                        constraints.min !== null &&
                        constraints.max !== null
                      ) {
                        return `必要人数：${constraints.min}〜${constraints.max}名`;
                      }
                      if (constraints.min !== null) {
                        return `必要人数：${constraints.min}名〜`;
                      }
                      if (constraints.max !== null) {
                        return `必要人数：〜${constraints.max}名`;
                      }
                      return null;
                    })();
                    return (
                      <React.Fragment key={groupName}>
                        <TableRow sx={{ bgcolor: "grey.100" }}>
                          <TableCell
                            colSpan={3}
                            sx={{
                              py: 0.75,
                              boxSizing: "border-box",
                              borderRight: "1px solid",
                              borderColor: "divider",
                              position: "sticky",
                              left: 0,
                              zIndex: 2,
                              bgcolor: "grey.100",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                flexWrap: "wrap",
                              }}
                            >
                              <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: 600 }}
                              >
                                {groupName}（{members.length}名）
                              </Typography>
                              {targetLabel ? (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {targetLabel}
                                </Typography>
                              ) : null}
                            </Box>
                            {!isUnassignedGroup ? (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {description}
                              </Typography>
                            ) : null}
                          </TableCell>
                          <TableCell
                            colSpan={days.length}
                            sx={{
                              py: 0.75,
                              bgcolor: "grey.100",
                              borderBottom: "1px solid",
                              borderColor: "divider",
                            }}
                          />
                        </TableRow>

                        {!isUnassignedGroup && (
                          <TableRow sx={{ cursor: "default" }}>
                            <TableCell
                              colSpan={3}
                              sx={{
                                bgcolor: "background.paper",
                                py: 0.25,
                                width:
                                  STAFF_COL_WIDTH +
                                  AGG_COL_WIDTH +
                                  HISTORY_COL_WIDTH,
                                boxSizing: "border-box",
                                borderRight: "1px solid",
                                borderColor: "divider",
                                position: "sticky",
                                left: 0,
                                zIndex: 2,
                                textAlign: "right",
                              }}
                            >
                              <Typography variant="body2">
                                出勤人数(小計)
                              </Typography>
                            </TableCell>
                            {days.map((d) => {
                              const key = d.format("YYYY-MM-DD");
                              const actual = coverage?.get(key) ?? 0;
                              const presentation = getGroupCoveragePresentation(
                                actual,
                                constraints
                              );
                              const highlightBg =
                                presentation.violationTone === "warning"
                                  ? "rgba(255, 193, 7, 0.18)"
                                  : presentation.violationTone === "error"
                                  ? "rgba(244, 67, 54, 0.18)"
                                  : undefined;
                              const valueTypography = (
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 600,
                                    fontSize: 14,
                                    color: presentation.primaryColor,
                                  }}
                                >
                                  {presentation.primary}
                                </Typography>
                              );
                              return (
                                <TableCell
                                  key={`${groupName}-${key}-coverage`}
                                  sx={{
                                    p: 0.25,
                                    width: DAY_COL_WIDTH,
                                    height: 40,
                                    position: "relative",
                                    borderLeft: "1px solid",
                                    borderColor: "divider",
                                    bgcolor: highlightBg,
                                    ...(getCellHighlightSx(
                                      false,
                                      selectedDayKeys.has(key)
                                    ) ?? {}),
                                  }}
                                  align="center"
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    {presentation.violationReason ? (
                                      <Tooltip
                                        title={presentation.violationReason}
                                        arrow
                                      >
                                        {valueTypography}
                                      </Tooltip>
                                    ) : (
                                      valueTypography
                                    )}
                                  </Box>
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        )}

                        {members.map((s) => {
                          const staffDisplayName = `${s.familyName} ${s.givenName}`;
                          const isStaffSelected = selectedStaffIds.has(s.id);
                          return (
                            <TableRow key={s.id}>
                              <TableCell
                                sx={{
                                  bgcolor: "background.paper",
                                  width: STAFF_COL_WIDTH,
                                  minWidth: STAFF_COL_WIDTH,
                                  maxWidth: STAFF_COL_WIDTH,
                                  boxSizing: "border-box",
                                  borderRight: "1px solid",
                                  borderColor: "divider",
                                  position: "sticky",
                                  left: 0,
                                  zIndex: 1,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  ...(getCellHighlightSx(
                                    isStaffSelected,
                                    false
                                  ) ?? {}),
                                }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                    pr: 1,
                                  }}
                                >
                                  <Checkbox
                                    size="small"
                                    checked={isStaffSelected}
                                    onChange={(event) =>
                                      handleStaffCheckboxChange(event, s.id)
                                    }
                                    inputProps={{
                                      "aria-label": `${staffDisplayName}を選択`,
                                    }}
                                  />
                                  <Typography
                                    variant="body2"
                                    sx={{ flexShrink: 0 }}
                                  >
                                    {staffDisplayName}
                                  </Typography>
                                </Box>
                              </TableCell>

                              {(() => {
                                const per = displayShifts.get(s.id) || {};
                                const workCount = Object.values(per).filter(
                                  (v) => v === "work"
                                ).length;
                                const fixedOffCount = Object.values(per).filter(
                                  (v) => v === "fixedOff"
                                ).length;
                                const requestedOffCount = Object.values(
                                  per
                                ).filter((v) => v === "requestedOff").length;
                                const summaryLabel = `${workCount}/${fixedOffCount}/${requestedOffCount}`;
                                const historyMeta = shiftRequestHistoryMeta.get(
                                  s.id
                                );
                                const changeCount =
                                  historyMeta?.changeCount ?? 0;
                                const latestChangeLabel =
                                  historyMeta?.latestChangeAt
                                    ? dayjs(historyMeta.latestChangeAt).format(
                                        "M/D HH:mm"
                                      )
                                    : "-";
                                const historyLabel = `${latestChangeLabel}(${changeCount}回)`;
                                return (
                                  <>
                                    <TableCell
                                      sx={{
                                        p: 0,
                                        width: AGG_COL_WIDTH,
                                        height: 40,
                                        bgcolor: "background.paper",
                                        borderRight: "1px solid",
                                        borderColor: "divider",
                                        position: "sticky",
                                        left: `${SUMMARY_LEFTS.aggregate}px`,
                                        zIndex: 1,
                                        verticalAlign: "middle",
                                        ...(getCellHighlightSx(
                                          isStaffSelected,
                                          false
                                        ) ?? {}),
                                      }}
                                      align="center"
                                    >
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          textAlign: "center",
                                          width: "100%",
                                          fontWeight: 600,
                                        }}
                                      >
                                        {summaryLabel}
                                      </Typography>
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        p: 0,
                                        width: HISTORY_COL_WIDTH,
                                        height: 40,
                                        bgcolor: "background.paper",
                                        borderRight: "1px solid",
                                        borderColor: "divider",
                                        position: "sticky",
                                        left: `${SUMMARY_LEFTS.changeHistory}px`,
                                        zIndex: 1,
                                        verticalAlign: "middle",
                                        ...(getCellHighlightSx(
                                          isStaffSelected,
                                          false
                                        ) ?? {}),
                                      }}
                                      align="center"
                                    >
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          textAlign: "center",
                                          width: "100%",
                                        }}
                                      >
                                        {historyLabel}
                                      </Typography>
                                    </TableCell>
                                  </>
                                );
                              })()}

                              {days.map((d) => {
                                const key = d.format("YYYY-MM-DD");
                                const displayState = displayShifts.get(s.id)?.[
                                  key
                                ];
                                const editState = displayState ?? "auto";
                                const visual =
                                  (displayState &&
                                    statusVisualMap[displayState]) ||
                                  defaultStatusVisual;
                                const dateLabel = d.format("M月D日 (dd)");
                                const handleOpen = () =>
                                  openShiftEditDialog(
                                    s.id,
                                    staffDisplayName,
                                    key,
                                    editState
                                  );
                                const isDaySelected = selectedDayKeys.has(key);
                                const highlightSx =
                                  getCellHighlightSx(
                                    isStaffSelected,
                                    isDaySelected
                                  ) ?? {};
                                return (
                                  <TableCell
                                    key={key}
                                    sx={{
                                      p: 0.25,
                                      width: DAY_COL_WIDTH,
                                      height: 40,
                                      position: "relative",
                                      borderLeft: "1px solid",
                                      borderColor: "divider",
                                      cursor: "pointer",
                                      ...highlightSx,
                                    }}
                                    align="center"
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`${staffDisplayName} ${dateLabel} のシフトを編集`}
                                    onClick={handleOpen}
                                    onKeyDown={(event) => {
                                      if (
                                        event.key === "Enter" ||
                                        event.key === " "
                                      ) {
                                        event.preventDefault();
                                        handleOpen();
                                      }
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: visual.color,
                                        fontWeight: 700,
                                      }}
                                    >
                                      {visual.label}
                                    </Typography>
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          );
                        })}
                      </React.Fragment>
                    );
                  }
                )}
              </TableBody>
            </Table>
          </Box>
        </>
      )}

      <Dialog
        open={isEditDialogOpen}
        onClose={(_, _reason) => {
          if (isSavingSingleEdit) return;
          closeShiftEditDialog();
        }}
        fullWidth
        maxWidth="xs"
        aria-labelledby="shift-edit-dialog-title"
      >
        <DialogTitle id="shift-edit-dialog-title">シフトを変更</DialogTitle>
        <DialogContent dividers>
          {editingCell ? (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {editingCell.staffName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {editingDialogDateLabel}
              </Typography>
            </Box>
          ) : null}

          <FormControl fullWidth size="small">
            <InputLabel id="shift-edit-state-label">ステータス</InputLabel>
            <Select
              labelId="shift-edit-state-label"
              label="ステータス"
              value={editingState}
              onChange={(event) =>
                setEditingState(event.target.value as ShiftState)
              }
              disabled={isSavingSingleEdit}
            >
              {shiftStateOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography
                      component="span"
                      sx={{
                        color: statusVisualMap[option.value].color,
                        fontWeight: 700,
                      }}
                    >
                      {statusVisualMap[option.value].label}
                    </Typography>
                    <Typography component="span">{option.label}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeShiftEditDialog} disabled={isSavingSingleEdit}>
            キャンセル
          </Button>
          <Button
            onClick={saveShiftEdit}
            variant="contained"
            disabled={!editingCell || isSavingSingleEdit}
            startIcon={
              isSavingSingleEdit ? (
                <CircularProgress size={16} color="inherit" />
              ) : undefined
            }
          >
            {isSavingSingleEdit ? "保存中..." : "変更する"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isBulkDialogOpen}
        onClose={(_, _reason) => {
          if (isSavingBulkEdit) return;
          closeBulkEditDialog();
        }}
        fullWidth
        maxWidth="xs"
        aria-labelledby="shift-bulk-edit-dialog-title"
      >
        <DialogTitle id="shift-bulk-edit-dialog-title">
          選択した項目を一括変更
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2">
              選択スタッフ: {selectedStaffIds.size} 名
            </Typography>
            <Typography variant="body2">
              選択日付: {selectedDayKeys.size} 日
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              対象セル: {selectedCellCount} 件
            </Typography>
          </Box>

          <FormControl fullWidth size="small">
            <InputLabel id="shift-bulk-edit-state-label">ステータス</InputLabel>
            <Select
              labelId="shift-bulk-edit-state-label"
              label="ステータス"
              value={bulkEditState}
              onChange={(event) =>
                setBulkEditState(event.target.value as ShiftState)
              }
              disabled={isSavingBulkEdit}
            >
              {shiftStateOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography
                      component="span"
                      sx={{
                        color: statusVisualMap[option.value].color,
                        fontWeight: 700,
                      }}
                    >
                      {statusVisualMap[option.value].label}
                    </Typography>
                    <Typography component="span">{option.label}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeBulkEditDialog} disabled={isSavingBulkEdit}>
            キャンセル
          </Button>
          <Button
            onClick={applyBulkEdit}
            variant="contained"
            disabled={!hasBulkSelection || isSavingBulkEdit}
            startIcon={
              isSavingBulkEdit ? (
                <CircularProgress size={16} color="inherit" />
              ) : undefined
            }
          >
            {isSavingBulkEdit ? "保存中..." : "変更する"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
