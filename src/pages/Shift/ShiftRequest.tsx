import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Button,
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
import dayjs from "dayjs";
import React, { useEffect, useMemo, useState } from "react";

export default function ShiftRequest() {
  const [currentMonth, setCurrentMonth] = useState(dayjs().startOf("month"));
  type Status = "work" | "off" | "auto";
  const [selectedDates, setSelectedDates] = useState<
    Record<string, { status: Status }>
  >({});
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
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
    0: "off",
    1: "work",
    2: "work",
    3: "work",
    4: "work",
    5: "work",
    6: "off",
  }));

  const monthStart = currentMonth.startOf("month");
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
      if (raw) setPatterns(JSON.parse(raw));
    } catch (e) {
      // ignore
    }
  }, []);

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
      const status = pattern.mapping[wd] ?? "auto";
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

  // 作成補助: 現在の選択から曜日ごとのパターンを推定する
  const deriveMappingFromSelected = (): Record<number, Status> => {
    const byWeekday: Record<number, Record<Status, number>> = {} as any;
    days.forEach((d) => {
      const wd = d.day();
      byWeekday[wd] = byWeekday[wd] || { work: 0, off: 0, auto: 0 };
      const s = selectedDates[d.format("YYYY-MM-DD")]?.status;
      if (s) byWeekday[wd][s]++;
    });
    const mapping: Record<number, Status> = {} as any;
    Object.keys(byWeekday).forEach((k) => {
      const wd = Number(k);
      const counts = byWeekday[wd];
      const max = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
      mapping[wd] = (max && (max[0] as Status)) || "auto";
    });
    return mapping;
  };

  const clearAll = () => setSelectedDates({});

  const prevMonth = () => setCurrentMonth((m) => m.subtract(1, "month"));
  const nextMonth = () => setCurrentMonth((m) => m.add(1, "month"));

  // 一括で選択中の日にステータスを適用（未使用のため保持しない）

  const handleSave = () => {
    const dates = Object.keys(selectedDates).sort();
    console.log("保存(モック):", { dates, selectedDates, note });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // カウント：出勤と休み
  const workCount = useMemo(
    () =>
      Object.values(selectedDates).filter((v) => v.status === "work").length,
    [selectedDates]
  );
  const offCount = useMemo(
    () => Object.values(selectedDates).filter((v) => v.status === "off").length,
    [selectedDates]
  );

  return (
    <Container sx={{ py: 3 }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>
          希望シフト入力（1ヶ月選択）
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

        {/* カウント表示 */}
        <Box sx={{ mb: 1 }}>
          <Typography variant="body2">
            出勤: {workCount}日 / 休み: {offCount}日
          </Typography>
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
            {days.map((d) => {
              const key = d.format("YYYY-MM-DD");
              const selected = selectedDates[key]?.status;
              const weekday = ["日", "月", "火", "水", "木", "金", "土"][
                d.day()
              ];
              return (
                <TableRow key={key} hover>
                  <TableCell
                    sx={{ whiteSpace: "nowrap", width: 140 }}
                  >{`${d.format("M/D")}(${weekday})`}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Button
                        size="small"
                        variant={selected === "work" ? "contained" : "outlined"}
                        color={selected === "work" ? "success" : "inherit"}
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
                        size="small"
                        variant={selected === "off" ? "contained" : "outlined"}
                        color={selected === "off" ? "error" : "inherit"}
                        onClick={() =>
                          setSelectedDates((prev) => ({
                            ...prev,
                            [key]: { status: "off" },
                          }))
                        }
                      >
                        休み
                      </Button>

                      <Button
                        size="small"
                        variant={selected === "auto" ? "contained" : "outlined"}
                        onClick={() =>
                          setSelectedDates((prev) => ({
                            ...prev,
                            [key]: { status: "auto" },
                          }))
                        }
                      >
                        おまかせ
                      </Button>

                      {selected && (
                        <Button
                          size="small"
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
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems="center"
          >
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Button onClick={() => selectAll("work")}>全て出勤</Button>
              <Button onClick={() => selectAll("off")} color="error">
                全て休み
              </Button>
              <Button onClick={() => selectAll("auto")}>全ておまかせ</Button>
              <Button onClick={() => clearAll()} sx={{ ml: 1 }}>
                クリア
              </Button>
              <Button
                sx={{ ml: 1 }}
                onClick={() => {
                  // 新規パターンを現在の選択から作成する
                  setNewPatternMapping(deriveMappingFromSelected());
                  setNewPatternName("");
                  setNewPatternDialogOpen(true);
                }}
              >
                現在の選択でパターン作成
              </Button>
            </Box>

            <TextField
              label="備考"
              multiline
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              sx={{ flex: 1 }}
            />

            <Box>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={Object.keys(selectedDates).length === 0}
              >
                保存 (モック)
              </Button>
              {saved && (
                <Typography
                  sx={{ display: "inline", ml: 2 }}
                  color="success.main"
                >
                  保存しました
                </Typography>
              )}
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
                              `${
                                ["日", "月", "火", "水", "木", "金", "土"][
                                  Number(k)
                                ]
                              }:${v}`
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
                    <InputLabel>
                      {["日", "月", "火", "水", "木", "金", "土"][i]}
                    </InputLabel>
                    <Select
                      label={["日", "月", "火", "水", "木", "金", "土"][i]}
                      value={newPatternMapping[i]}
                      onChange={(e) =>
                        setNewPatternMapping((prev) => ({
                          ...prev,
                          [i]: e.target.value as Status,
                        }))
                      }
                    >
                      <MenuItem value="work">出勤</MenuItem>
                      <MenuItem value="off">休み</MenuItem>
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
