import { useGetHolidayCalendarsQuery } from "@entities/calendar/api/calendarApi";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import SaveIcon from "@mui/icons-material/Save";
import {
  Box,
  Button,
  ButtonBase,
  Container,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  createShiftPlanYear,
  updateShiftPlanYear,
} from "@shared/api/graphql/documents/mutations";
import { shiftPlanYearByTargetYear } from "@shared/api/graphql/documents/queries";
import {
  CreateShiftPlanYearMutation,
  CreateShiftPlanYearMutationVariables,
  ShiftPlanMonthSetting,
  ShiftPlanMonthSettingInput,
  ShiftPlanYearByTargetYearQuery,
  ShiftPlanYearByTargetYearQueryVariables,
  UpdateShiftPlanYearMutationVariables,
} from "@shared/api/graphql/types";
import { GraphQLResult } from "aws-amplify/api";
import dayjs from "dayjs";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";

import { useAppDispatchV2 } from "@/app/hooks";
import * as MESSAGE_CODE from "@/errors";
import { graphqlClient } from "@/shared/api/amplify/graphqlClient";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/shared/lib/store/snackbarSlice";

type ShiftPlanRow = {
  month: number;
  editStart: string;
  editEnd: string;
  enabled: boolean;
  dailyCapacity: string[];
};

type EditableField = Extract<keyof ShiftPlanRow, "editStart" | "editEnd">;

// デフォルトは「月初〜月末」のフルレンジになるよう事前入力しておく
const MAX_DAYS_IN_MONTH = 31;
const DAY_COLUMNS = Array.from(
  { length: MAX_DAYS_IN_MONTH },
  (_, index) => index + 1,
);
const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];
const SUNDAY_BG = "#ffebee";
const SATURDAY_BG = "#e3f2fd";
const HOLIDAY_BG = "#fff8e1";
const CELL_NOWRAP_SX = { whiteSpace: "nowrap" as const };
const INPUT_PLACEHOLDER = "入力";
// 自動保存の遅延時間（ミリ秒）
const AUTO_SAVE_DELAY = 1000;
// 保存時刻の表示フォーマット
const TIME_FORMAT = "HH:mm:ss";

const sanitizeCapacityValue = (value: string): string => {
  if (!value.trim()) return "";
  const numericValue = Math.max(0, Number(value));
  if (Number.isNaN(numericValue)) return "";
  return String(Math.trunc(numericValue));
};

const createDefaultRows = (year: number): ShiftPlanRow[] =>
  Array.from({ length: 12 }, (_, index) => {
    const startOfMonth = dayjs().year(year).month(index).startOf("month");
    const endOfMonth = startOfMonth.endOf("month");
    return {
      month: index + 1,
      editStart: startOfMonth.format("YYYY-MM-DD"),
      editEnd: endOfMonth.format("YYYY-MM-DD"),
      enabled: true,
      dailyCapacity: Array.from({ length: MAX_DAYS_IN_MONTH }, () => ""),
    };
  });

const convertDailyCapacitiesToStrings = (
  capacities?: (number | null)[] | null,
): string[] =>
  Array.from({ length: MAX_DAYS_IN_MONTH }, (_, idx) => {
    const value = capacities?.[idx];
    return typeof value === "number" && !Number.isNaN(value)
      ? String(value)
      : "";
  });

const buildRowsFromPlans = (
  year: number,
  plans?: (ShiftPlanMonthSetting | null)[] | null,
): ShiftPlanRow[] => {
  const baseRows = createDefaultRows(year);
  if (!plans?.length) return baseRows;
  const planMap = new Map<number, ShiftPlanMonthSetting>();
  plans.forEach((plan) => {
    if (!plan || typeof plan.month !== "number") return;
    planMap.set(plan.month, plan);
  });
  return baseRows.map((row) => {
    const plan = planMap.get(row.month);
    if (!plan) return row;
    return {
      ...row,
      editStart: plan.editStart ?? row.editStart,
      editEnd: plan.editEnd ?? row.editEnd,
      enabled: plan.enabled ?? row.enabled,
      dailyCapacity: convertDailyCapacitiesToStrings(plan.dailyCapacities),
    };
  });
};

const convertRowsToPlanInput = (
  rows: ShiftPlanRow[],
): ShiftPlanMonthSettingInput[] =>
  rows.map((row) => ({
    month: row.month,
    editStart: row.editStart || null,
    editEnd: row.editEnd || null,
    enabled: row.enabled,
    dailyCapacities: row.dailyCapacity.map((value) =>
      value === "" ? null : Number(value),
    ),
  }));

type EditableCapacityCellProps = {
  value: string;
  labelText: string;
  labelColor: string;
  onCommit: (value: string) => void;
  onTabNextDay?: () => void;
};

const EditableCapacityCell = memo(function EditableCapacityCell({
  value,
  labelText,
  labelColor,
  onCommit,
  onTabNextDay,
}: EditableCapacityCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  // Sync draft to value when not editing
  useEffect(() => {
    if (!isEditing) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraft(value);
    }
  }, [value, isEditing]);

  const handleCommit = useCallback(() => {
    const normalized = sanitizeCapacityValue(draft);
    onCommit(normalized);
    setIsEditing(false);
  }, [draft, onCommit]);

  const handleCancel = useCallback(() => {
    setDraft(value);
    setIsEditing(false);
  }, [value]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleCommit();
      } else if (event.key === "Escape") {
        event.preventDefault();
        handleCancel();
      } else if (event.key === "Tab") {
        event.preventDefault();
        handleCommit();
        // 次の日に遷移
        if (onTabNextDay) {
          onTabNextDay();
        }
      }
    },
    [handleCommit, handleCancel, onTabNextDay],
  );

  return (
    <Stack spacing={0.25} alignItems="center">
      <Typography
        variant="caption"
        sx={{ fontSize: "0.65rem" }}
        color={labelColor}
      >
        {labelText}
      </Typography>
      {isEditing ? (
        <TextField
          autoFocus
          type="number"
          size="small"
          value={draft}
          inputProps={{ min: 0 }}
          sx={{
            width: 52,
            "& input": {
              textAlign: "center",
              fontSize: "0.75rem",
              padding: "4px",
            },
          }}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={handleCommit}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <ButtonBase
          onClick={() => setIsEditing(true)}
          sx={{
            width: 52,
            borderRadius: 1,
            border: "1px dashed",
            borderColor: value ? "divider" : "primary.light",
            px: 0.5,
            py: 0.5,
          }}
        >
          <Typography
            variant="body2"
            color={value ? "text.primary" : "text.disabled"}
            sx={{ fontSize: "0.75rem" }}
          >
            {value || INPUT_PLACEHOLDER}
          </Typography>
        </ButtonBase>
      )}
    </Stack>
  );
});

type ShiftPlanHeaderProps = {
  selectedYear: number;
  isBusy: boolean;
  onYearChange: (delta: number) => void;
};

const ShiftPlanHeader = memo(function ShiftPlanHeader({
  selectedYear,
  isBusy,
  onYearChange,
}: ShiftPlanHeaderProps) {
  return (
    <Box display="flex" alignItems="center" justifyContent="space-between">
      <Box>
        <Typography component="h1" variant="h4" fontWeight="bold">
          シフト計画管理
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          年ごとのシフト申請期間を管理し、各月の受付開始・締切日を調整できます。
        </Typography>
      </Box>
      <Stack direction="row" spacing={1} alignItems="center">
        <IconButton
          aria-label="前の年"
          onClick={() => onYearChange(-1)}
          disabled={isBusy}
        >
          <ChevronLeftIcon />
        </IconButton>
        <Typography variant="h5" component="div" fontWeight="bold">
          {selectedYear}年
        </Typography>
        <IconButton
          aria-label="次の年"
          onClick={() => onYearChange(1)}
          disabled={isBusy}
        >
          <ChevronRightIcon />
        </IconButton>
      </Stack>
    </Box>
  );
});

type ShiftPlanTableProps = {
  selectedYear: number;
  rows: ShiftPlanRow[];
  isBusy: boolean;
  holidayNameMap: Map<string, string>;
  onFieldChange: (month: number, field: EditableField, value: string) => void;
  onToggleEnabled: (month: number) => void;
  onDailyCapacityChange: (
    month: number,
    dayIndex: number,
    value: string,
  ) => void;
  onTabNextDay: (month: number, dayIndex: number) => void;
  onRegisterCellRef: (cellId: string, element: HTMLElement | null) => void;
};

const ShiftPlanTable = memo(function ShiftPlanTable({
  selectedYear,
  rows,
  isBusy,
  holidayNameMap,
  onFieldChange,
  onToggleEnabled,
  onDailyCapacityChange,
  onTabNextDay,
  onRegisterCellRef,
}: ShiftPlanTableProps) {
  return (
    <Paper elevation={0} variant="outlined" sx={{ position: "relative" }}>
      {isBusy && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 2,
          }}
        >
          <LinearProgress />
        </Box>
      )}
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell rowSpan={2} sx={{ width: 96, ...CELL_NOWRAP_SX }}>
                月
              </TableCell>
              <TableCell rowSpan={2} sx={{ width: 160, ...CELL_NOWRAP_SX }}>
                申請開始
              </TableCell>
              <TableCell rowSpan={2} sx={{ width: 160, ...CELL_NOWRAP_SX }}>
                申請終了
              </TableCell>
              <TableCell
                rowSpan={2}
                align="center"
                sx={{ width: 160, ...CELL_NOWRAP_SX }}
              >
                手動停止
              </TableCell>
              <TableCell
                align="center"
                colSpan={DAY_COLUMNS.length}
                sx={{ px: 0.5, ...CELL_NOWRAP_SX }}
              >
                日別人数
              </TableCell>
            </TableRow>
            <TableRow>
              {DAY_COLUMNS.map((day) => (
                <TableCell
                  key={`day-header-${day}`}
                  align="center"
                  sx={{ minWidth: 52, px: 0.5, ...CELL_NOWRAP_SX }}
                >
                  {day}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const monthCursor = dayjs()
                .year(selectedYear)
                .month(row.month - 1);
              const rowDaysInMonth = monthCursor.daysInMonth();
              return (
                <TableRow key={`${selectedYear}-${row.month}`} hover>
                  <TableCell sx={{ width: 96, ...CELL_NOWRAP_SX }}>
                    <Typography fontWeight="bold">{row.month}月</Typography>
                  </TableCell>
                  <TableCell sx={{ width: 160, ...CELL_NOWRAP_SX }}>
                    <TextField
                      type="date"
                      size="small"
                      value={row.editStart}
                      fullWidth
                      sx={{ maxWidth: 180 }}
                      onChange={(event) =>
                        onFieldChange(
                          row.month,
                          "editStart",
                          event.target.value,
                        )
                      }
                    />
                  </TableCell>
                  <TableCell sx={{ width: 160, ...CELL_NOWRAP_SX }}>
                    <TextField
                      type="date"
                      size="small"
                      value={row.editEnd}
                      fullWidth
                      sx={{ maxWidth: 180 }}
                      onChange={(event) =>
                        onFieldChange(row.month, "editEnd", event.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell align="center" sx={CELL_NOWRAP_SX}>
                    <Button
                      size="small"
                      variant={row.enabled ? "outlined" : "contained"}
                      color="primary"
                      onClick={() => onToggleEnabled(row.month)}
                    >
                      {row.enabled ? "申請停止" : "申請再開"}
                    </Button>
                  </TableCell>
                  {DAY_COLUMNS.map((day) => {
                    if (day > rowDaysInMonth) {
                      return (
                        <TableCell
                          key={`${row.month}-day-${day}`}
                          align="center"
                          sx={{ px: 0.25, minWidth: 52, ...CELL_NOWRAP_SX }}
                        />
                      );
                    }
                    const dayIndex = day - 1;
                    const value = row.dailyCapacity[dayIndex] ?? "";
                    const dayInstance = monthCursor.date(day);
                    const weekdayIndex = dayInstance.day();
                    const dateKey = dayInstance.format("YYYY-MM-DD");
                    const holidayName = holidayNameMap.get(dateKey);
                    const isHoliday = Boolean(holidayName);
                    const weekdayLabel = WEEKDAY_LABELS[weekdayIndex];
                    const isSunday = weekdayIndex === 0;
                    const isSaturday = weekdayIndex === 6;
                    const cellBgColor = isHoliday
                      ? HOLIDAY_BG
                      : isSunday
                        ? SUNDAY_BG
                        : isSaturday
                          ? SATURDAY_BG
                          : undefined;
                    const weekdayColor = isSunday
                      ? "error.main"
                      : isSaturday
                        ? "primary.main"
                        : "text.secondary";
                    const labelColor = isHoliday
                      ? "warning.dark"
                      : weekdayColor;
                    const labelText = isHoliday ? "祝" : weekdayLabel;
                    const cellId = `cell-${selectedYear}-${row.month}-${dayIndex}`;
                    const cellContent = (
                      <EditableCapacityCell
                        value={value}
                        labelText={labelText}
                        labelColor={labelColor}
                        onCommit={(nextValue) =>
                          onDailyCapacityChange(row.month, dayIndex, nextValue)
                        }
                        onTabNextDay={() => onTabNextDay(row.month, dayIndex)}
                      />
                    );
                    return (
                      <TableCell
                        key={`${row.month}-day-${day}`}
                        align="center"
                        sx={{
                          px: 0.25,
                          minWidth: 52,
                          backgroundColor: cellBgColor,
                          ...CELL_NOWRAP_SX,
                        }}
                      >
                        <Box
                          ref={(ref) =>
                            onRegisterCellRef(cellId, ref as HTMLElement | null)
                          }
                        >
                          {isHoliday ? (
                            <Tooltip
                              title={holidayName ?? "祝日"}
                              placement="top"
                            >
                              {cellContent}
                            </Tooltip>
                          ) : (
                            cellContent
                          )}
                        </Box>
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
});

type ShiftPlanFooterProps = {
  isAutoSaving: boolean;
  lastAutoSaveTime: string | null;
  isBusy: boolean;
  onSaveAll: () => void;
};

const ShiftPlanFooter = memo(function ShiftPlanFooter({
  isAutoSaving,
  lastAutoSaveTime,
  isBusy,
  onSaveAll,
}: ShiftPlanFooterProps) {
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      px={3}
      py={2}
    >
      <Stack spacing={1}>
        {isAutoSaving && (
          <Typography variant="caption" color="info.main">
            自動保存中...
          </Typography>
        )}
        {lastAutoSaveTime && !isAutoSaving && (
          <Typography variant="caption" color="text.secondary">
            最後の自動保存: {lastAutoSaveTime}
          </Typography>
        )}
      </Stack>
      <Button
        variant="contained"
        startIcon={<SaveIcon />}
        onClick={onSaveAll}
        disabled={isBusy}
      >
        全体を保存
      </Button>
    </Box>
  );
});

export default function ShiftPlanManagement() {
  const dispatch = useAppDispatchV2();
  const initialYear = dayjs().year();
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [yearlyPlans, setYearlyPlans] = useState<
    Record<number, ShiftPlanRow[]>
  >({
    [initialYear]: createDefaultRows(initialYear),
  });
  const [isPending, startTransition] = useTransition();
  const [isFetchingYear, setIsFetchingYear] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [yearRecordIds, setYearRecordIds] = useState<Record<number, string>>(
    {},
  );
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState<string | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [savedYearlyPlans, setSavedYearlyPlans] = useState<
    Record<number, ShiftPlanRow[]>
  >({
    [initialYear]: createDefaultRows(initialYear),
  });
  const cellRefs = useRef<Map<string, HTMLElement | null>>(new Map());
  const { data: holidayCalendars = [], error: holidayCalendarsError } =
    useGetHolidayCalendarsQuery();
  useEffect(() => {
    if (holidayCalendarsError) {
      console.error(holidayCalendarsError);
      dispatch(setSnackbarError(MESSAGE_CODE.E00001));
    }
  }, [holidayCalendarsError, dispatch]);
  const holidayNameMap = useMemo(() => {
    if (!holidayCalendars.length) return new Map<string, string>();
    return new Map(
      holidayCalendars.map((calendar) => [
        dayjs(calendar.holidayDate).format("YYYY-MM-DD"),
        calendar.name,
      ]),
    );
  }, [holidayCalendars]);

  // 年を跨いだときも必ず初期行が存在するように補完する
  useEffect(() => {
    setYearlyPlans((prev) => {
      if (prev[selectedYear]) return prev;
      return {
        ...prev,
        [selectedYear]: createDefaultRows(selectedYear),
      };
    });
    // 年が切り替わった時は保存済み状態をリセット
    setSavedYearlyPlans((prev) => {
      if (prev[selectedYear]) return prev;
      return {
        ...prev,
        [selectedYear]: createDefaultRows(selectedYear),
      };
    });
  }, [selectedYear]);

  useEffect(() => {
    let isMounted = true;
    const fetchYearPlan = async () => {
      setIsFetchingYear(true);
      try {
        const response = (await graphqlClient.graphql({
          query: shiftPlanYearByTargetYear,
          variables: {
            targetYear: selectedYear,
            limit: 1,
          } as ShiftPlanYearByTargetYearQueryVariables,
          authMode: "userPool",
        })) as GraphQLResult<ShiftPlanYearByTargetYearQuery>;

        if (!isMounted) return;

        if (response.errors?.length) {
          throw new Error(
            response.errors.map((error) => error.message).join(","),
          );
        }

        const record =
          response.data?.shiftPlanYearByTargetYear?.items?.find(
            (item): item is NonNullable<typeof item> => item !== null,
          ) ?? null;

        if (record) {
          setYearlyPlans((prev) => ({
            ...prev,
            [selectedYear]: buildRowsFromPlans(selectedYear, record.plans),
          }));
          setSavedYearlyPlans((prev) => ({
            ...prev,
            [selectedYear]: buildRowsFromPlans(selectedYear, record.plans),
          }));
          setYearRecordIds((prev) => ({
            ...prev,
            [selectedYear]: record.id,
          }));
        } else {
          setYearRecordIds((prev) => {
            if (!prev[selectedYear]) return prev;
            const next = { ...prev };
            delete next[selectedYear];
            return next;
          });
        }
      } catch (error) {
        console.error(error);
        if (isMounted) {
          dispatch(setSnackbarError("シフト計画の読み込みに失敗しました。"));
        }
      } finally {
        if (isMounted) {
          setIsFetchingYear(false);
        }
      }
    };

    void fetchYearPlan();

    return () => {
      isMounted = false;
    };
  }, [dispatch, selectedYear]);
  const currentRows = yearlyPlans[selectedYear] ?? [];
  const isBusy = isPending || isFetchingYear || isSaving || isAutoSaving;

  // 現在の年のプランが保存済み状態から変更されているかを判定
  const isDirty = useMemo(() => {
    const current = yearlyPlans[selectedYear];
    const saved = savedYearlyPlans[selectedYear];

    if (!current || !saved) {
      return false;
    }

    return JSON.stringify(current) !== JSON.stringify(saved);
  }, [yearlyPlans, savedYearlyPlans, selectedYear]);

  const handleYearChange = useCallback(
    (delta: number) => {
      const nextYear = selectedYear + delta;
      startTransition(() => {
        setYearlyPlans((prev) => {
          if (prev[nextYear]) return prev;
          return {
            ...prev,
            [nextYear]: createDefaultRows(nextYear),
          };
        });
        setSelectedYear(nextYear);
      });
    },
    [selectedYear, startTransition],
  );

  const handleFieldChange = useCallback(
    (month: number, field: EditableField, value: string) => {
      setYearlyPlans((prev) => {
        const rows = prev[selectedYear] ?? createDefaultRows(selectedYear);
        const updatedRows = rows.map((row) =>
          row.month === month ? { ...row, [field]: value } : row,
        );
        return {
          ...prev,
          [selectedYear]: updatedRows,
        };
      });
    },
    [selectedYear],
  );

  const handleToggleEnabled = useCallback(
    (month: number) => {
      setYearlyPlans((prev) => {
        const rows = prev[selectedYear] ?? createDefaultRows(selectedYear);
        const updatedRows = rows.map((row) =>
          row.month === month ? { ...row, enabled: !row.enabled } : row,
        );
        return {
          ...prev,
          [selectedYear]: updatedRows,
        };
      });
    },
    [selectedYear],
  );

  const handleDailyCapacityChange = useCallback(
    (month: number, dayIndex: number, value: string) => {
      const normalizedValue = sanitizeCapacityValue(value);
      setYearlyPlans((prev) => {
        const rows = prev[selectedYear] ?? createDefaultRows(selectedYear);
        const updatedRows = rows.map((row) => {
          if (row.month !== month) return row;
          const nextCapacity = [...row.dailyCapacity];
          nextCapacity[dayIndex] = normalizedValue;
          return { ...row, dailyCapacity: nextCapacity };
        });
        return {
          ...prev,
          [selectedYear]: updatedRows,
        };
      });
    },
    [selectedYear],
  );

  const handleTabNextDay = useCallback(
    (month: number, dayIndex: number) => {
      // 次の日のインデックスを計算
      const monthCursor = dayjs()
        .year(selectedYear)
        .month(month - 1);
      const daysInMonth = monthCursor.daysInMonth();

      let nextMonth = month;
      let nextDayIndex = dayIndex + 1;

      // 月を超える場合
      if (nextDayIndex >= daysInMonth) {
        nextMonth = month === 12 ? 1 : month + 1;
        nextDayIndex = 0;
      }

      // 次のセルへフォーカスを移す
      const nextCellId = `cell-${selectedYear}-${nextMonth}-${nextDayIndex}`;
      setTimeout(() => {
        const nextCell = cellRefs.current.get(nextCellId);
        if (nextCell) {
          nextCell.click();
          nextCell.focus();
        }
      }, 0);
    },
    [selectedYear],
  );

  const handleRegisterCellRef = useCallback(
    (cellId: string, element: HTMLElement | null) => {
      if (element instanceof HTMLElement) {
        cellRefs.current.set(cellId, element);
      } else {
        cellRefs.current.delete(cellId);
      }
    },
    [],
  );

  const performSave = useCallback(
    async (
      rows: ShiftPlanRow[],
      year: number,
      recordIds: Record<number, string>,
      showNotification = true,
    ) => {
      try {
        const plansInput = convertRowsToPlanInput(rows);
        const existingId = recordIds[year];
        if (existingId) {
          await graphqlClient.graphql({
            query: updateShiftPlanYear,
            variables: {
              input: {
                id: existingId,
                targetYear: year,
                plans: plansInput,
              },
            } as UpdateShiftPlanYearMutationVariables,
            authMode: "userPool",
          });
        } else {
          const response = (await graphqlClient.graphql({
            query: createShiftPlanYear,
            variables: {
              input: {
                targetYear: year,
                plans: plansInput,
              },
            } as CreateShiftPlanYearMutationVariables,
            authMode: "userPool",
          })) as GraphQLResult<CreateShiftPlanYearMutation>;

          const createdId = response.data?.createShiftPlanYear?.id;
          if (createdId) {
            setYearRecordIds((prev) => ({ ...prev, [year]: createdId }));
          }
        }

        if (showNotification) {
          dispatch(setSnackbarSuccess(`${year}年の申請期間を保存しました。`));
        }

        // 保存済み状態を記録
        setSavedYearlyPlans((prev) => ({
          ...prev,
          [year]: rows.map((row) => ({ ...row })),
        }));
        // 保存時刻を更新
        setLastAutoSaveTime(dayjs().format(TIME_FORMAT));

        return true;
      } catch (error) {
        console.error(error);
        if (showNotification) {
          dispatch(setSnackbarError("シフト計画の保存に失敗しました。"));
        }
        return false;
      }
    },
    [dispatch],
  );

  /**
   * 自動保存
   * - 入力停止後AUTO_SAVE_DELAY（1秒）経過後に自動保存を実行
   * - デバウンス処理により、連続入力中は保存しない
   */
  useEffect(() => {
    // 既存のタイマーをクリア（デバウンス処理）
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // 保存条件: 内容が変更されている、バリデーションに合格している
    if (isDirty && currentRows.length > 0) {
      // バリデーション: enabled な行の日付が入力されているか確認
      const isValid = currentRows.every((row) => {
        if (!row.enabled) return true;
        return row.editStart && row.editEnd;
      });

      if (isValid) {
        autoSaveTimerRef.current = setTimeout(() => {
          setIsAutoSaving(true);
          void performSave(currentRows, selectedYear, yearRecordIds, false)
            .then(() => {
              setIsAutoSaving(false);
            })
            .catch(() => {
              setIsAutoSaving(false);
            });
        }, AUTO_SAVE_DELAY);
      }
    }

    // クリーンアップ: コンポーネントのアンマウント時やdependenciesの変更時
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [isDirty, currentRows, selectedYear, yearRecordIds, performSave]);

  const handleSaveAll = useCallback(async () => {
    for (const row of currentRows) {
      if (!row.enabled) continue;
      const label = `${selectedYear}年${row.month}月`;
      if (!row.editStart || !row.editEnd) {
        dispatch(setSnackbarError(`${label}の入力が未完了です。`));
        return;
      }
      if (dayjs(row.editStart).isAfter(dayjs(row.editEnd))) {
        dispatch(
          setSnackbarError(`${label}は開始日が終了日より後になっています。`),
        );
        return;
      }
    }

    setIsSaving(true);
    try {
      await performSave(currentRows, selectedYear, yearRecordIds, true);
    } finally {
      setIsSaving(false);
    }
  }, [currentRows, dispatch, selectedYear, yearRecordIds, performSave]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <ShiftPlanHeader
          selectedYear={selectedYear}
          isBusy={isBusy}
          onYearChange={handleYearChange}
        />

        <ShiftPlanTable
          selectedYear={selectedYear}
          rows={currentRows}
          isBusy={isBusy}
          holidayNameMap={holidayNameMap}
          onFieldChange={handleFieldChange}
          onToggleEnabled={handleToggleEnabled}
          onDailyCapacityChange={handleDailyCapacityChange}
          onTabNextDay={handleTabNextDay}
          onRegisterCellRef={handleRegisterCellRef}
        />

        <ShiftPlanFooter
          isAutoSaving={isAutoSaving}
          lastAutoSaveTime={lastAutoSaveTime}
          isBusy={isBusy}
          onSaveAll={handleSaveAll}
        />
      </Stack>
    </Container>
  );
}
