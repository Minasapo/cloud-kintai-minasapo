import { GraphQLResult } from "@aws-amplify/api";
import { useGetHolidayCalendarsQuery } from "@entities/calendar/api/calendarApi";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import SaveIcon from "@mui/icons-material/Save";
import {
  Box,
  Button,
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
import { API } from "aws-amplify";
import dayjs from "dayjs";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";

import {
  CreateShiftPlanYearMutation,
  CreateShiftPlanYearMutationVariables,
  ShiftPlanMonthSetting,
  ShiftPlanMonthSettingInput,
  ShiftPlanYearByTargetYearQuery,
  ShiftPlanYearByTargetYearQueryVariables,
  UpdateShiftPlanYearMutationVariables,
} from "@/API";
import { useAppDispatchV2 } from "@/app/hooks";
import * as MESSAGE_CODE from "@/errors";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/lib/reducers/snackbarReducer";

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
  (_, index) => index + 1
);
const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];
const SUNDAY_BG = "#ffebee";
const SATURDAY_BG = "#e3f2fd";
const HOLIDAY_BG = "#fff8e1";
const CELL_NOWRAP_SX = { whiteSpace: "nowrap" as const };

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
  capacities?: (number | null)[] | null
): string[] =>
  Array.from({ length: MAX_DAYS_IN_MONTH }, (_, idx) => {
    const value = capacities?.[idx];
    return typeof value === "number" && !Number.isNaN(value)
      ? String(value)
      : "";
  });

const buildRowsFromPlans = (
  year: number,
  plans?: (ShiftPlanMonthSetting | null)[] | null
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
  rows: ShiftPlanRow[]
): ShiftPlanMonthSettingInput[] =>
  rows.map((row) => ({
    month: row.month,
    editStart: row.editStart || null,
    editEnd: row.editEnd || null,
    enabled: row.enabled,
    dailyCapacities: row.dailyCapacity.map((value) =>
      value === "" ? null : Number(value)
    ),
  }));

export default function ShiftPlanManagement() {
  const dispatch = useAppDispatchV2();
  const initialYear = useMemo(() => dayjs().year(), []);
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [yearlyPlans, setYearlyPlans] = useState<
    Record<number, ShiftPlanRow[]>
  >({
    [initialYear]: createDefaultRows(initialYear),
  });
  const [isPending, startTransition] = useTransition();
  const [isFetchingYear, setIsFetchingYear] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [yearRecordIds, setYearRecordIds] = useState<Record<number, string>>(
    {}
  );
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
      ])
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
  }, [selectedYear]);

  useEffect(() => {
    let isMounted = true;
    const fetchYearPlan = async () => {
      setIsFetchingYear(true);
      try {
        const response = (await API.graphql({
          query: shiftPlanYearByTargetYear,
          variables: {
            targetYear: selectedYear,
            limit: 1,
          } as ShiftPlanYearByTargetYearQueryVariables,
          authMode: "AMAZON_COGNITO_USER_POOLS",
        })) as GraphQLResult<ShiftPlanYearByTargetYearQuery>;

        if (!isMounted) return;

        if (response.errors?.length) {
          throw new Error(
            response.errors.map((error) => error.message).join(",")
          );
        }

        const record =
          response.data?.shiftPlanYearByTargetYear?.items?.find(
            (item): item is NonNullable<typeof item> => item !== null
          ) ?? null;

        if (record) {
          setYearlyPlans((prev) => ({
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
  const isBusy = isPending || isFetchingYear || isSaving;

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
    [selectedYear, startTransition]
  );

  const handleFieldChange = useCallback(
    (month: number, field: EditableField, value: string) => {
      setYearlyPlans((prev) => {
        const rows = prev[selectedYear] ?? createDefaultRows(selectedYear);
        const updatedRows = rows.map((row) =>
          row.month === month ? { ...row, [field]: value } : row
        );
        return {
          ...prev,
          [selectedYear]: updatedRows,
        };
      });
    },
    [selectedYear]
  );

  const handleToggleEnabled = useCallback(
    (month: number) => {
      setYearlyPlans((prev) => {
        const rows = prev[selectedYear] ?? createDefaultRows(selectedYear);
        const updatedRows = rows.map((row) =>
          row.month === month ? { ...row, enabled: !row.enabled } : row
        );
        return {
          ...prev,
          [selectedYear]: updatedRows,
        };
      });
    },
    [selectedYear]
  );

  const handleDailyCapacityChange = useCallback(
    (month: number, dayIndex: number, value: string) => {
      setYearlyPlans((prev) => {
        const rows = prev[selectedYear] ?? createDefaultRows(selectedYear);
        const updatedRows = rows.map((row) => {
          if (row.month !== month) return row;
          const sanitizedValue = (() => {
            if (value === "") return "";
            const numericValue = Math.max(0, Number(value));
            if (Number.isNaN(numericValue)) return "";
            return String(numericValue);
          })();
          const nextCapacity = [...row.dailyCapacity];
          nextCapacity[dayIndex] = sanitizedValue;
          return { ...row, dailyCapacity: nextCapacity };
        });
        return {
          ...prev,
          [selectedYear]: updatedRows,
        };
      });
    },
    [selectedYear]
  );

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
          setSnackbarError(`${label}は開始日が終了日より後になっています。`)
        );
        return;
      }
    }

    setIsSaving(true);
    try {
      const plansInput = convertRowsToPlanInput(currentRows);
      const existingId = yearRecordIds[selectedYear];
      if (existingId) {
        await API.graphql({
          query: updateShiftPlanYear,
          variables: {
            input: {
              id: existingId,
              targetYear: selectedYear,
              plans: plansInput,
            },
          } as UpdateShiftPlanYearMutationVariables,
          authMode: "AMAZON_COGNITO_USER_POOLS",
        });
      } else {
        const response = (await API.graphql({
          query: createShiftPlanYear,
          variables: {
            input: {
              targetYear: selectedYear,
              plans: plansInput,
            },
          } as CreateShiftPlanYearMutationVariables,
          authMode: "AMAZON_COGNITO_USER_POOLS",
        })) as GraphQLResult<CreateShiftPlanYearMutation>;

        const createdId = response.data?.createShiftPlanYear?.id;
        if (createdId) {
          setYearRecordIds((prev) => ({ ...prev, [selectedYear]: createdId }));
        }
      }

      dispatch(
        setSnackbarSuccess(`${selectedYear}年の申請期間を保存しました。`)
      );
    } catch (error) {
      console.error(error);
      dispatch(setSnackbarError("シフト計画の保存に失敗しました。"));
    } finally {
      setIsSaving(false);
    }
  }, [currentRows, dispatch, selectedYear, yearRecordIds]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
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
              onClick={() => handleYearChange(-1)}
              disabled={isBusy}
            >
              <ChevronLeftIcon />
            </IconButton>
            <Typography variant="h5" component="div" fontWeight="bold">
              {selectedYear}年
            </Typography>
            <IconButton
              aria-label="次の年"
              onClick={() => handleYearChange(1)}
              disabled={isBusy}
            >
              <ChevronRightIcon />
            </IconButton>
          </Stack>
        </Box>

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
                {currentRows.map((row) => {
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
                            handleFieldChange(
                              row.month,
                              "editStart",
                              event.target.value
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
                            handleFieldChange(
                              row.month,
                              "editEnd",
                              event.target.value
                            )
                          }
                        />
                      </TableCell>
                      <TableCell align="center" sx={CELL_NOWRAP_SX}>
                        <Button
                          size="small"
                          variant={row.enabled ? "outlined" : "contained"}
                          color="primary"
                          onClick={() => handleToggleEnabled(row.month)}
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
                        const cellContent = (
                          <Stack spacing={0.25} alignItems="center">
                            <Typography
                              variant="caption"
                              sx={{ fontSize: "0.65rem" }}
                              color={labelColor}
                            >
                              {labelText}
                            </Typography>
                            <TextField
                              type="number"
                              size="small"
                              value={value}
                              inputProps={{ min: 0 }}
                              sx={{
                                width: 52,
                                "& input": {
                                  textAlign: "center",
                                  fontSize: "0.75rem",
                                  padding: "4px",
                                },
                              }}
                              onChange={(event) =>
                                handleDailyCapacityChange(
                                  row.month,
                                  dayIndex,
                                  event.target.value
                                )
                              }
                            />
                          </Stack>
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
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <Box display="flex" justifyContent="flex-end" px={3} py={2}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSaveAll}
              disabled={isSaving}
            >
              全体を保存
            </Button>
          </Box>
        </Paper>
      </Stack>
    </Container>
  );
}
