import { GraphQLResult } from "@aws-amplify/api";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { API } from "aws-amplify";
import dayjs from "dayjs";
import React, { useEffect, useMemo, useState } from "react";

import {
  CreateShiftRequestMutation,
  ShiftRequestsByStaffIdQuery,
  ShiftRequestStatus,
  Staff,
  UpdateShiftRequestMutation,
} from "@/API";
import { useAppDispatchV2 } from "@/app/hooks";
import * as MESSAGE_CODE from "@/errors";
import { createShiftRequest, updateShiftRequest } from "@/graphql/mutations";
import { shiftRequestsByStaffId } from "@/graphql/queries";
import useCognitoUser from "@/hooks/useCognitoUser";
import fetchStaff from "@/hooks/useStaff/fetchStaff";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/lib/reducers/snackbarReducer";

type Status = "work" | "fixedOff" | "requestedOff" | "auto";

const statusToShiftRequestStatus: Record<Status, ShiftRequestStatus> = {
  work: ShiftRequestStatus.WORK,
  fixedOff: ShiftRequestStatus.FIXED_OFF,
  requestedOff: ShiftRequestStatus.REQUESTED_OFF,
  auto: ShiftRequestStatus.AUTO,
};

const shiftRequestStatusToStatus = (
  status?: ShiftRequestStatus | null
): Status => {
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

export default function ShiftRequest() {
  const dispatch = useAppDispatchV2();
  const { cognitoUser, loading: cognitoUserLoading } = useCognitoUser();
  const [currentMonth, setCurrentMonth] = useState(dayjs().startOf("month"));
  const [staff, setStaff] = useState<Staff | null>(null);
  const [isLoadingStaff, setIsLoadingStaff] = useState(true);
  const [isLoadingShiftRequest, setIsLoadingShiftRequest] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [shiftRequestId, setShiftRequestId] = useState<string | null>(null);
  const weekdayLabels = ["日", "月", "火", "水", "木", "金", "土"];
  const statusLabelMap: Record<Status, string> = {
    work: "出勤",
    fixedOff: "固定休",
    requestedOff: "希望休",
    auto: "おまかせ",
  };
  const statusColorMap: Record<
    Status,
    | "inherit"
    | "primary"
    | "secondary"
    | "success"
    | "error"
    | "info"
    | "warning"
  > = {
    work: "success",
    fixedOff: "error",
    requestedOff: "warning",
    auto: "info",
  };
  const normalizeStatus = (value?: string): Status => {
    if (
      value === "work" ||
      value === "fixedOff" ||
      value === "requestedOff" ||
      value === "auto"
    )
      return value;
    if (value === "off") return "fixedOff";
    return "auto";
  };
  const [selectedDates, setSelectedDates] = useState<
    Record<string, { status: Status }>
  >({});
  const [note, setNote] = useState("");
  // patterns
  type Pattern = {
    id: string;
    name: string;
    mapping: Record<number, Status>; // weekday (0=Sun) -> status
  };
  const PATTERNS_KEY = "shiftPatterns_v1";
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [patternDialogOpen, setPatternDialogOpen] = useState(false);
  const [newPatternDialogOpen, setNewPatternDialogOpen] = useState(false);
  const [newPatternName, setNewPatternName] = useState("");
  const [newPatternMapping, setNewPatternMapping] = useState<
    Record<number, Status>
  >(() => ({
    0: "fixedOff",
    1: "work",
    2: "work",
    3: "work",
    4: "work",
    5: "work",
    6: "fixedOff",
  }));

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

  // 日付クリックのサイクルは今回のテーブル版では使わないため削除

  const selectAll = (status: Status = "work") => {
    const next: Record<string, { status: Status }> = {};
    days.forEach((d) => (next[d.format("YYYY-MM-DD")] = { status }));
    setSelectedDates(next);
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PATTERNS_KEY);
      if (raw) {
        const parsed: Pattern[] = JSON.parse(raw);
        setPatterns(
          parsed.map((pattern) => ({
            ...pattern,
            mapping: Object.fromEntries(
              Object.entries(pattern.mapping).map(([weekday, status]) => [
                weekday,
                normalizeStatus(status as string),
              ])
            ) as Record<number, Status>,
          }))
        );
      }
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (cognitoUserLoading) return;
    if (!cognitoUser?.id) {
      setStaff(null);
      setIsLoadingStaff(false);
      return;
    }

    let isMounted = true;
    const loadStaff = async () => {
      setIsLoadingStaff(true);
      try {
        const staffData = await fetchStaff(cognitoUser.id);
        if (!isMounted) return;
        setStaff(staffData ?? null);
      } catch (error) {
        if (!isMounted) return;
        setStaff(null);
        dispatch(setSnackbarError(MESSAGE_CODE.E05001));
      } finally {
        if (isMounted) {
          setIsLoadingStaff(false);
        }
      }
    };

    loadStaff();

    return () => {
      isMounted = false;
    };
  }, [cognitoUser, cognitoUserLoading, dispatch]);

  useEffect(() => {
    if (!staff?.id) {
      setShiftRequestId(null);
      setSelectedDates({});
      setNote("");
      setIsLoadingShiftRequest(false);
      return;
    }

    let isMounted = true;
    const fetchShiftRequest = async () => {
      setIsLoadingShiftRequest(true);
      try {
        const targetMonthKey = monthStart.format("YYYY-MM");
        const response = (await API.graphql({
          query: shiftRequestsByStaffId,
          variables: {
            staffId: staff.id,
            targetMonth: { eq: targetMonthKey },
            limit: 1,
          },
          authMode: "AMAZON_COGNITO_USER_POOLS",
        })) as GraphQLResult<ShiftRequestsByStaffIdQuery>;

        if (!isMounted) return;

        if (response.errors) {
          throw new Error(response.errors[0].message);
        }

        const items =
          response.data?.shiftRequestsByStaffId?.items?.filter(
            (item): item is NonNullable<typeof item> => item !== null
          ) ?? [];

        const existing = items[0];

        if (!existing) {
          setShiftRequestId(null);
          setSelectedDates({});
          setNote("");
          return;
        }

        const nextSelected: Record<string, { status: Status }> = {};
        existing.entries
          ?.filter(
            (entry): entry is NonNullable<typeof entry> => entry !== null
          )
          .forEach((entry) => {
            nextSelected[entry.date] = {
              status: shiftRequestStatusToStatus(entry.status),
            };
          });

        setShiftRequestId(existing.id);
        setSelectedDates(nextSelected);
        setNote(existing.note ?? "");
      } catch (error) {
        if (isMounted) {
          dispatch(setSnackbarError(MESSAGE_CODE.E16002));
        }
      } finally {
        if (isMounted) {
          setIsLoadingShiftRequest(false);
        }
      }
    };

    fetchShiftRequest();

    return () => {
      isMounted = false;
    };
  }, [dispatch, monthStart, staff?.id]);

  const persistPatterns = (p: Pattern[]) => {
    setPatterns(p);
    try {
      localStorage.setItem(PATTERNS_KEY, JSON.stringify(p));
    } catch (e) {
      // ignore
    }
  };

  const applyPattern = (pattern: Pattern) => {
    const next: Record<string, { status: Status }> = {};
    days.forEach((d) => {
      const wd = d.day();
      const status = normalizeStatus(pattern.mapping[wd]);
      next[d.format("YYYY-MM-DD")] = { status };
    });
    setSelectedDates(next);
    setPatternDialogOpen(false);
  };

  const deletePattern = (id: string) => {
    persistPatterns(patterns.filter((p) => p.id !== id));
  };

  const createPattern = (name: string, mapping: Record<number, Status>) => {
    const p: Pattern = { id: String(Date.now()), name, mapping };
    persistPatterns([p, ...patterns]);
    setNewPatternDialogOpen(false);
    setNewPatternName("");
  };

  const clearAll = () => setSelectedDates({});

  const prevMonth = () => setCurrentMonth((m) => m.subtract(1, "month"));
  const nextMonth = () => setCurrentMonth((m) => m.add(1, "month"));

  // 一括で選択中の日にステータスを適用（未使用のため保持しない）

  const handleSave = async () => {
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

    if (entries.length === 0) return;

    const submittedAt = dayjs().toISOString();
    const targetMonthKey = monthStart.format("YYYY-MM");

    setIsSaving(true);
    try {
      if (shiftRequestId) {
        const response = (await API.graphql({
          query: updateShiftRequest,
          variables: {
            input: {
              id: shiftRequestId,
              note,
              entries,
              summary,
              submittedAt,
            },
          },
          authMode: "AMAZON_COGNITO_USER_POOLS",
        })) as GraphQLResult<UpdateShiftRequestMutation>;

        if (response.errors) {
          throw new Error(response.errors[0].message);
        }

        setShiftRequestId(
          response.data?.updateShiftRequest?.id ?? shiftRequestId
        );
      } else {
        const response = (await API.graphql({
          query: createShiftRequest,
          variables: {
            input: {
              staffId: staff.id,
              targetMonth: targetMonthKey,
              note,
              entries,
              summary,
              submittedAt,
            },
          },
          authMode: "AMAZON_COGNITO_USER_POOLS",
        })) as GraphQLResult<CreateShiftRequestMutation>;

        if (response.errors) {
          throw new Error(response.errors[0].message);
        }

        setShiftRequestId(response.data?.createShiftRequest?.id ?? null);
      }

      dispatch(setSnackbarSuccess(MESSAGE_CODE.S16001));
    } catch (error) {
      dispatch(setSnackbarError(MESSAGE_CODE.E16001));
    } finally {
      setIsSaving(false);
    }
  };

  // カウント：出勤と休み
  const workCount = useMemo(
    () =>
      Object.values(selectedDates).filter((v) => v.status === "work").length,
    [selectedDates]
  );
  const fixedOffCount = useMemo(
    () =>
      Object.values(selectedDates).filter((v) => v.status === "fixedOff")
        .length,
    [selectedDates]
  );
  const requestedOffCount = useMemo(
    () =>
      Object.values(selectedDates).filter((v) => v.status === "requestedOff")
        .length,
    [selectedDates]
  );

  const summary = useMemo(
    () => ({
      workDays: workCount,
      fixedOffDays: fixedOffCount,
      requestedOffDays: requestedOffCount,
    }),
    [fixedOffCount, requestedOffCount, workCount]
  );

  const interactionDisabled =
    !staff || isLoadingStaff || isLoadingShiftRequest || isSaving;
  const hasSelection = Object.keys(selectedDates).length > 0;

  const BulkSelectionButtons = () => (
    <Box
      sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}
    >
      <Button onClick={() => selectAll("work")} disabled={interactionDisabled}>
        全て出勤
      </Button>
      <Button
        onClick={() => selectAll("fixedOff")}
        color="error"
        disabled={interactionDisabled}
      >
        全て固定休
      </Button>
      <Button
        onClick={() => selectAll("requestedOff")}
        color="warning"
        disabled={interactionDisabled}
      >
        全て希望休
      </Button>
      <Button onClick={() => selectAll("auto")} disabled={interactionDisabled}>
        全ておまかせ
      </Button>
      <Button
        onClick={() => clearAll()}
        sx={{ ml: 1 }}
        disabled={interactionDisabled}
      >
        クリア
      </Button>
    </Box>
  );

  return (
    <Container sx={{ py: 3 }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>
          希望シフト
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
            <IconButton size="small" onClick={prevMonth} aria-label="前の月">
              <ArrowBackIcon />
            </IconButton>
            <Typography>{monthStart.format("YYYY年 M月")}</Typography>
            <IconButton size="small" onClick={nextMonth} aria-label="次の月">
              <ArrowForwardIcon />
            </IconButton>
          </Box>

          <Box>
            <Button onClick={() => selectAll("work")} sx={{ mr: 1 }}>
              全選択
            </Button>
            <Button onClick={clearAll} sx={{ mr: 1 }}>
              クリア
            </Button>
            <Button
              startIcon={<AddIcon />}
              onClick={() => setPatternDialogOpen(true)}
            >
              マイパターン
            </Button>
          </Box>
        </Box>

        {(isLoadingStaff || isLoadingShiftRequest) && (
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {/* カウント表示 */}
        <Box sx={{ mb: 2 }}>
          <BulkSelectionButtons />
        </Box>

        {/* 縦並びテーブル表示（各行が日付） */}
        <Table size="small" sx={{ mb: 2 }}>
          <TableHead>
            <TableRow>
              <TableCell>日付 (曜日)</TableCell>
              <TableCell>ステータス</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell colSpan={2} sx={{ backgroundColor: "grey.50" }}>
                <Typography variant="body2">
                  出勤: {summary.workDays}日 / 固定休: {summary.fixedOffDays}日
                  / 希望休: {summary.requestedOffDays}日
                </Typography>
              </TableCell>
            </TableRow>
            {days.map((d) => {
              const key = d.format("YYYY-MM-DD");
              const selected = selectedDates[key]?.status;
              const weekday = weekdayLabels[d.day()];
              return (
                <TableRow key={key} hover>
                  <TableCell
                    sx={{ whiteSpace: "nowrap", width: 140 }}
                  >{`${d.format("M/D")}(${weekday})`}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <ButtonGroup size="small" variant="outlined">
                        <Button
                          variant={
                            selected === "work" ? "contained" : "outlined"
                          }
                          color={statusColorMap.work}
                          disabled={interactionDisabled}
                          onClick={() =>
                            setSelectedDates((prev) => ({
                              ...prev,
                              [key]: { status: "work" },
                            }))
                          }
                        >
                          出勤
                        </Button>

                        <Button
                          variant={
                            selected === "fixedOff" ? "contained" : "outlined"
                          }
                          color={statusColorMap.fixedOff}
                          disabled={interactionDisabled}
                          onClick={() =>
                            setSelectedDates((prev) => ({
                              ...prev,
                              [key]: { status: "fixedOff" },
                            }))
                          }
                        >
                          固定休
                        </Button>

                        <Button
                          variant={
                            selected === "requestedOff"
                              ? "contained"
                              : "outlined"
                          }
                          color={statusColorMap.requestedOff}
                          disabled={interactionDisabled}
                          onClick={() =>
                            setSelectedDates((prev) => ({
                              ...prev,
                              [key]: { status: "requestedOff" },
                            }))
                          }
                        >
                          希望休
                        </Button>

                        <Button
                          variant={
                            selected === "auto" ? "contained" : "outlined"
                          }
                          color={statusColorMap.auto}
                          disabled={interactionDisabled}
                          onClick={() =>
                            setSelectedDates((prev) => ({
                              ...prev,
                              [key]: { status: "auto" },
                            }))
                          }
                        >
                          おまかせ
                        </Button>
                      </ButtonGroup>

                      {selected && (
                        <Button
                          size="small"
                          disabled={interactionDisabled}
                          onClick={() =>
                            setSelectedDates((prev) => {
                              const c = { ...prev };
                              delete c[key];
                              return c;
                            })
                          }
                        >
                          解除
                        </Button>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <Box
          component="form"
          sx={{ mt: 3 }}
          onSubmit={(e) => e.preventDefault()}
        >
          <Stack spacing={2} alignItems="stretch">
            <TextField
              label="備考"
              multiline
              rows={2}
              value={note}
              disabled={interactionDisabled}
              onChange={(e) => setNote(e.target.value)}
            />

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={!hasSelection || interactionDisabled}
              >
                保存
              </Button>
              {isSaving && <CircularProgress size={20} />}
            </Box>
          </Stack>
        </Box>
        {/* パターン管理ダイアログ */}
        <Dialog
          open={patternDialogOpen}
          onClose={() => setPatternDialogOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>マイパターン一覧</DialogTitle>
          <DialogContent>
            {patterns.length === 0 ? (
              <Typography>登録されたパターンはありません。</Typography>
            ) : (
              <List>
                {patterns.map((p) => (
                  <React.Fragment key={p.id}>
                    <ListItem>
                      <ListItemText
                        primary={p.name}
                        secondary={Object.entries(p.mapping)
                          .map(
                            ([k, v]) =>
                              `${weekdayLabels[Number(k)]}:${
                                statusLabelMap[normalizeStatus(v as string)]
                              }`
                          )
                          .join(" ")}
                      />
                      <ListItemSecondaryAction>
                        <Button
                          size="small"
                          onClick={() => applyPattern(p)}
                          sx={{ mr: 1 }}
                        >
                          適用
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => deletePattern(p.id)}
                          startIcon={<DeleteIcon />}
                        >
                          削除
                        </Button>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPatternDialogOpen(false)}>閉じる</Button>
            <Button
              onClick={() => {
                setPatternDialogOpen(false);
                setNewPatternDialogOpen(true);
              }}
              startIcon={<AddIcon />}
            >
              新規作成
            </Button>
          </DialogActions>
        </Dialog>

        {/* 新規パターン作成ダイアログ */}
        <Dialog
          open={newPatternDialogOpen}
          onClose={() => setNewPatternDialogOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>新しいパターンを作成</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="パターン名"
                value={newPatternName}
                onChange={(e) => setNewPatternName(e.target.value)}
              />
              <Typography variant="body2">
                曜日ごとのステータスを設定してください
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 1,
                }}
              >
                {Array.from({ length: 7 }).map((_, i) => (
                  <FormControl size="small" fullWidth key={i}>
                    <InputLabel>{weekdayLabels[i]}</InputLabel>
                    <Select
                      label={weekdayLabels[i]}
                      value={newPatternMapping[i]}
                      onChange={(e) =>
                        setNewPatternMapping((prev) => ({
                          ...prev,
                          [i]: e.target.value as Status,
                        }))
                      }
                    >
                      <MenuItem value="work">出勤</MenuItem>
                      <MenuItem value="fixedOff">固定休</MenuItem>
                      <MenuItem value="requestedOff">希望休</MenuItem>
                      <MenuItem value="auto">おまかせ</MenuItem>
                    </Select>
                  </FormControl>
                ))}
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setNewPatternDialogOpen(false)}>
              キャンセル
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                if (!newPatternName) return;
                createPattern(newPatternName, newPatternMapping);
              }}
            >
              保存
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
}
