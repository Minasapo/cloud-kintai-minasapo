import {
  useGetCompanyHolidayCalendarsQuery,
  useGetHolidayCalendarsQuery,
} from "@entities/calendar/api/calendarApi";
import {
  Alert,
  Badge,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import React, { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAppDispatchV2 } from "@/app/hooks";
import { AppConfigContext } from "@/context/AppConfigContext";
import { AuthContext } from "@/context/AuthContext";
import * as MESSAGE_CODE from "@/errors";
import { useAutoSave } from "@/hooks/useAutoSave";
import useCognitoUser from "@/hooks/useCognitoUser";
import useShiftPlanYear from "@/hooks/useShiftPlanYear";
import { useStaffs } from "@entities/staff/model/useStaffs/useStaffs";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/app/snackbarReducer";
import { designTokenVar, getDesignTokens } from "@/shared/designSystem";

import generateMockShifts, { ShiftState } from "../lib/generateMockShifts";
import { getCellHighlightSx } from "../lib/selectionHighlight";
import {
  getGroupCoveragePresentation,
  ShiftGroupConstraints,
} from "../lib/shiftGroups";
import { defaultStatusVisual, statusVisualMap } from "../lib/shiftStateMapping";
import useShiftManagementDialogs from "../model/useShiftManagementDialogs";
import useShiftRequestAssignments from "../model/useShiftRequestAssignments";
import useShiftSelection from "../model/useShiftSelection";
import ShiftBulkEditDialog from "./components/ShiftBulkEditDialog";
import ShiftEditDialog from "./components/ShiftEditDialog";
import ShiftManagementLegend from "./components/ShiftManagementLegend";
import ShiftManagementSummaryRow from "./components/ShiftManagementSummaryRow";

const DEFAULT_THEME_TOKENS = getDesignTokens();
const shiftBoardTokens = DEFAULT_THEME_TOKENS.component.shiftBoard;
const SHIFT_BOARD_BASE_PATH = "component.shiftBoard";

const mixWithTransparent = (
  tokenPath: string,
  fallback: string,
  opacity: number
) => {
  const percentage = Math.round(Math.min(Math.max(opacity, 0), 1) * 100);
  return `color-mix(in srgb, ${designTokenVar(
    tokenPath,
    fallback
  )} ${percentage}%, transparent)`;
};

const SHIFT_BOARD_PADDING_X = designTokenVar(
  `${SHIFT_BOARD_BASE_PATH}.columnGap`,
  `${shiftBoardTokens.columnGap}px`
);
const SHIFT_BOARD_PADDING_Y = designTokenVar(
  `${SHIFT_BOARD_BASE_PATH}.rowGap`,
  `${shiftBoardTokens.rowGap}px`
);
const SHIFT_BOARD_HALF_PADDING_X = `calc(${SHIFT_BOARD_PADDING_X} / 2)`;
const SHIFT_BOARD_HALF_PADDING_Y = `calc(${SHIFT_BOARD_PADDING_Y} / 2)`;
const SHIFT_BOARD_CELL_RADIUS = designTokenVar(
  `${SHIFT_BOARD_BASE_PATH}.cellRadius`,
  `${shiftBoardTokens.cellRadius}px`
);
const SHIFT_BOARD_TRANSITION = `${designTokenVar(
  "motion.duration.medium",
  `${DEFAULT_THEME_TOKENS.motion.duration.medium}ms`
)} ${designTokenVar(
  "motion.easing.standard",
  DEFAULT_THEME_TOKENS.motion.easing.standard
)}`;
const SHIFT_BOARD_FOCUS_RING_COLOR = designTokenVar(
  "color.brand.primary.focusRing",
  DEFAULT_THEME_TOKENS.color.brand.primary.focusRing
);
const SHIFT_BOARD_FOCUS_SHADOW = designTokenVar(
  "shadow.card",
  DEFAULT_THEME_TOKENS.shadow.card
);

const SHIFT_BOARD_CELL_BASE_SX = {
  borderRadius: SHIFT_BOARD_CELL_RADIUS,
  transition: `background-color ${SHIFT_BOARD_TRANSITION}, box-shadow ${SHIFT_BOARD_TRANSITION}`,
};

const SHIFT_BOARD_INTERACTIVE_FOCUS_SX = {
  "&:focus-visible": {
    outline: `2px solid ${SHIFT_BOARD_FOCUS_RING_COLOR}`,
    outlineOffset: 2,
    boxShadow: SHIFT_BOARD_FOCUS_SHADOW,
  },
};

const HOLIDAY_BG = mixWithTransparent(
  "color.brand.accent.base",
  DEFAULT_THEME_TOKENS.color.brand.accent.base,
  0.22
);
const COMPANY_HOLIDAY_BG = mixWithTransparent(
  "color.brand.secondary.base",
  DEFAULT_THEME_TOKENS.color.brand.secondary.base,
  0.18
);
const SATURDAY_BG = mixWithTransparent(
  "color.brand.primary.base",
  DEFAULT_THEME_TOKENS.color.brand.primary.base,
  0.12
);

// ShiftManagement: シフト管理テーブル。左固定列を前面に出し、各日ごとの出勤人数を集計して表示する。
export default function ShiftManagementBoard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatchV2();
  const { cognitoUser } = useCognitoUser();
  const { getShiftGroups } = useContext(AppConfigContext);
  const { authStatus } = useContext(AuthContext);
  const isAuthenticated = authStatus === "authenticated";
  const { loading, error, staffs } = useStaffs({ isAuthenticated });

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
  const monthYear = monthStart.year();
  const monthMonth = monthStart.month();

  const days = useMemo(
    () =>
      Array.from({ length: daysInMonth }).map((_, i) =>
        monthStart.add(i, "day")
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [monthYear, monthMonth, daysInMonth]
  );

  const dayKeyList = useMemo(
    () => days.map((day) => day.format("YYYY-MM-DD")),
    [days]
  );

  const {
    selectedStaffIds,
    selectedDayKeys,
    hasBulkSelection,
    selectedCellCount,
    handleStaffCheckboxChange,
    handleDayCheckboxChange,
  } = useShiftSelection({
    displayedStaffOrder,
    dayKeyList,
    staffIdToIndex,
  });

  const { data: holidayCalendars = [], error: holidayCalendarsError } =
    useGetHolidayCalendarsQuery(undefined, { skip: !isAuthenticated });
  const {
    data: companyHolidayCalendars = [],
    error: companyHolidayCalendarsError,
  } = useGetCompanyHolidayCalendarsQuery(undefined, {
    skip: !isAuthenticated,
  });

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
  } = useShiftPlanYear(monthStart.year(), { enabled: isAuthenticated });

  const getHeaderCellSx = (d: dayjs.Dayjs) => {
    const dateKey = d.format("YYYY-MM-DD");
    const day = d.day();
    if (holidaySet.has(dateKey) || day === 0)
      return { minWidth: DAY_COL_WIDTH, bgcolor: HOLIDAY_BG };
    if (companyHolidaySet.has(dateKey))
      return { minWidth: DAY_COL_WIDTH, bgcolor: COMPANY_HOLIDAY_BG };
    if (day === 6) return { minWidth: DAY_COL_WIDTH, bgcolor: SATURDAY_BG };
    return { minWidth: DAY_COL_WIDTH };
  };

  // シミュレーションシナリオを選べるようにする（デフォルトは実際の希望シフト）
  const [scenario] = React.useState<string>("actual");

  // mockShifts を state 化し、scenario/shiftStaffs/days に応じて生成する
  const [mockShifts, setMockShifts] = React.useState<
    Map<string, Record<string, ShiftState>>
  >(new Map());

  const {
    shiftRequestAssignments,
    shiftRequestHistoryMeta,
    shiftRequestsLoading,
    shiftRequestsError,
    persistShiftRequestChanges,
  } = useShiftRequestAssignments({
    shiftStaffs,
    monthStart,
    cognitoUserId: cognitoUser?.id,
    enabled: isAuthenticated,
  });

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

  // 変更を追跡するためのRef
  const pendingChangesRef = React.useRef<Map<string, Map<string, ShiftState>>>(
    new Map()
  );
  const [autoSaveCounter, setAutoSaveCounter] = React.useState(0);

  // シフトの変更を記録（自動保存用）
  const recordShiftChange = React.useCallback(
    (staffId: string, dayKey: string, state: ShiftState) => {
      if (scenario !== "actual") return;

      if (!pendingChangesRef.current.has(staffId)) {
        pendingChangesRef.current.set(staffId, new Map());
      }
      pendingChangesRef.current.get(staffId)!.set(dayKey, state);

      // カウンターを更新して自動保存をトリガー
      setAutoSaveCounter((prev) => prev + 1);
    },
    [scenario]
  );

  const applyShiftState = async (
    staffIds: string[],
    dayKeys: string[],
    nextState: ShiftState
  ) => {
    if (!staffIds.length || !dayKeys.length) return;

    if (scenario === "actual") {
      // 変更を記録（自動保存でバッチ処理される）
      staffIds.forEach((staffId) => {
        dayKeys.forEach((dayKey) => {
          recordShiftChange(staffId, dayKey, nextState);
        });
      });
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

  // 自動保存機能: 変更を監視して自動的に保存する
  const {
    isSaving: isAutoSaving,
    isPending: isAutoSavePending,
    lastSavedAt,
    lastChangedAt,
  } = useAutoSave({
    saveFn: async () => {
      // scenario が "actual" の場合のみ自動保存を実行
      if (scenario !== "actual") return;

      const changes = pendingChangesRef.current;
      if (changes.size === 0) return;

      // 変更をコピーしてクリア
      const changesToSave = new Map(changes);
      pendingChangesRef.current = new Map();

      // 各スタッフの変更を保存
      const promises: Promise<void>[] = [];
      changesToSave.forEach((dayChanges, staffId) => {
        dayChanges.forEach((state, dayKey) => {
          promises.push(persistShiftRequestChanges(staffId, [dayKey], state));
        });
      });

      if (promises.length > 0) {
        await Promise.all(promises);
      }
    },
    data: autoSaveCounter,
    enabled: scenario === "actual" && isAuthenticated,
    delay: 2000, // 2秒のdebounce
    onSaveSuccess: () => {
      dispatch(setSnackbarSuccess("シフトを自動保存しました"));
    },
    onSaveError: (error) => {
      console.error("Auto-save error:", error);
      dispatch(setSnackbarError("シフトの自動保存に失敗しました"));
    },
  });

  const {
    editingCell,
    editingState,
    isEditDialogOpen,
    isSavingSingleEdit,
    openShiftEditDialog,
    closeShiftEditDialog,
    handleEditingStateChange,
    saveShiftEdit,
    isBulkDialogOpen,
    openBulkEditDialog,
    closeBulkEditDialog,
    bulkEditState,
    handleBulkEditStateChange,
    isSavingBulkEdit,
    applyBulkEdit,
  } = useShiftManagementDialogs(applyShiftState);

  const prevMonth = () => setCurrentMonth((m) => m.subtract(1, "month"));
  const nextMonth = () => setCurrentMonth((m) => m.add(1, "month"));
  const handleOpenBulkEditDialog = () => {
    if (!hasBulkSelection) return;
    openBulkEditDialog();
  };
  const handleApplyBulkEdit = () => {
    if (!hasBulkSelection) return;
    const staffIds = Array.from(selectedStaffIds);
    const dayKeys = Array.from(selectedDayKeys);
    void applyBulkEdit(staffIds, dayKeys);
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

  if (!isAuthenticated) {
    return (
      <Container sx={{ py: 6, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container sx={{ py: 3 }}>
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

          {scenario === "actual" && (
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 0.5, ml: 2 }}
            >
              {isAutoSaving && (
                <Chip
                  icon={<CircularProgress size={16} />}
                  label="保存中..."
                  size="small"
                  color="default"
                />
              )}
              {isAutoSavePending && !isAutoSaving && (
                <Chip
                  label={`保存待ち${
                    lastChangedAt
                      ? ` (${dayjs(lastChangedAt).format("M/D HH:mm:ss")})`
                      : ""
                  }`}
                  size="small"
                  color="default"
                  variant="outlined"
                />
              )}
              {!isAutoSaving && !isAutoSavePending && lastSavedAt && (
                <Chip
                  label={`最終保存: ${dayjs(lastSavedAt).format(
                    "M/D HH:mm:ss"
                  )}`}
                  size="small"
                  color="success"
                  variant="outlined"
                />
              )}
            </Box>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate("/shift/collaborative")}
          >
            🚀 共同編集プロトタイプ
          </Button>

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
                onClick={handleOpenBulkEditDialog}
              >
                選択した項目を変更
              </Button>
            </Badge>
          ) : (
            <Button
              variant="contained"
              color="primary"
              disabled
              onClick={handleOpenBulkEditDialog}
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
          <ShiftManagementLegend />

          <Box
            sx={{
              position: "relative",
              overflow: "auto",
              border: 1,
              borderColor: "divider",
              borderRadius: SHIFT_BOARD_CELL_RADIUS,
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
                      ...SHIFT_BOARD_CELL_BASE_SX,
                      bgcolor: "background.paper",
                      width: STAFF_COL_WIDTH,
                      minWidth: STAFF_COL_WIDTH,
                      maxWidth: STAFF_COL_WIDTH,
                      boxSizing: "border-box",
                      pl: SHIFT_BOARD_HALF_PADDING_X,
                      py: SHIFT_BOARD_HALF_PADDING_Y,
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
                      ...SHIFT_BOARD_CELL_BASE_SX,
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
                      px: SHIFT_BOARD_HALF_PADDING_X,
                      py: SHIFT_BOARD_HALF_PADDING_Y,
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
                      ...SHIFT_BOARD_CELL_BASE_SX,
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
                      px: SHIFT_BOARD_HALF_PADDING_X,
                      py: SHIFT_BOARD_HALF_PADDING_Y,
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
                          ...SHIFT_BOARD_CELL_BASE_SX,
                          ...getHeaderCellSx(d),
                          position: "relative",
                          top: 0,
                          zIndex: 0,
                          borderLeft: "1px solid",
                          borderColor: "divider",
                          px: SHIFT_BOARD_PADDING_X,
                          py: SHIFT_BOARD_HALF_PADDING_Y,
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
                {shiftStaffs.length > 0 && (
                  <>
                    <ShiftManagementSummaryRow
                      label="計画人数"
                      days={days}
                      selectedDayKeys={selectedDayKeys}
                      dayColumnWidth={DAY_COL_WIDTH}
                      labelCellProps={{
                        sx: {
                          width:
                            STAFF_COL_WIDTH + AGG_COL_WIDTH + HISTORY_COL_WIDTH,
                          pl: 1,
                        },
                      }}
                      renderValue={(dayKey) => {
                        const planned = plannedDailyCounts.get(dayKey);
                        const displayValue = shiftPlanLoading
                          ? "..."
                          : typeof planned === "number"
                          ? planned
                          : "-";
                        return (
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
                        );
                      }}
                    />
                    <ShiftManagementSummaryRow
                      label="出勤人数(合計)"
                      days={days}
                      selectedDayKeys={selectedDayKeys}
                      dayColumnWidth={DAY_COL_WIDTH}
                      labelCellProps={{
                        sx: {
                          width:
                            STAFF_COL_WIDTH + AGG_COL_WIDTH + HISTORY_COL_WIDTH,
                        },
                      }}
                      renderValue={(dayKey) => (
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
                            {dailyCounts.get(dayKey) ?? 0}
                          </Typography>
                        </Box>
                      )}
                    />
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
                                ...SHIFT_BOARD_CELL_BASE_SX,
                                bgcolor: "background.paper",
                                px: SHIFT_BOARD_PADDING_X,
                                py: SHIFT_BOARD_HALF_PADDING_Y,
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
                                    ...SHIFT_BOARD_CELL_BASE_SX,
                                    px: SHIFT_BOARD_PADDING_X,
                                    py: SHIFT_BOARD_HALF_PADDING_Y,
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
                                  ...SHIFT_BOARD_CELL_BASE_SX,
                                  bgcolor: "background.paper",
                                  width: STAFF_COL_WIDTH,
                                  minWidth: STAFF_COL_WIDTH,
                                  maxWidth: STAFF_COL_WIDTH,
                                  boxSizing: "border-box",
                                  px: SHIFT_BOARD_PADDING_X,
                                  py: SHIFT_BOARD_HALF_PADDING_Y,
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
                                        ...SHIFT_BOARD_CELL_BASE_SX,
                                        px: SHIFT_BOARD_HALF_PADDING_X,
                                        py: SHIFT_BOARD_HALF_PADDING_Y,
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
                                        ...SHIFT_BOARD_CELL_BASE_SX,
                                        px: SHIFT_BOARD_HALF_PADDING_X,
                                        py: SHIFT_BOARD_HALF_PADDING_Y,
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
                                    {
                                      staffId: s.id,
                                      staffName: staffDisplayName,
                                      dateKey: key,
                                    },
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
                                      ...SHIFT_BOARD_CELL_BASE_SX,
                                      ...SHIFT_BOARD_INTERACTIVE_FOCUS_SX,
                                      px: SHIFT_BOARD_PADDING_X,
                                      py: SHIFT_BOARD_HALF_PADDING_Y,
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

      <ShiftEditDialog
        open={isEditDialogOpen}
        editingCell={editingCell}
        editingState={editingState}
        isSaving={isSavingSingleEdit}
        onClose={closeShiftEditDialog}
        onStateChange={handleEditingStateChange}
        onSubmit={saveShiftEdit}
      />

      <ShiftBulkEditDialog
        open={isBulkDialogOpen}
        selectedStaffCount={selectedStaffIds.size}
        selectedDayCount={selectedDayKeys.size}
        selectedCellCount={selectedCellCount}
        bulkEditState={bulkEditState}
        isSaving={isSavingBulkEdit}
        canSubmit={hasBulkSelection}
        onClose={closeBulkEditDialog}
        onStateChange={handleBulkEditStateChange}
        onSubmit={handleApplyBulkEdit}
      />
    </Container>
  );
}
