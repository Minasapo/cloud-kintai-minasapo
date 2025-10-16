import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Container,
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
import dayjs from "dayjs";
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import CommonBreadcrumbs from "@/components/common/CommonBreadcrumbs";

import useCompanyHolidayCalendars from "../../hooks/useCompanyHolidayCalendars/useCompanyHolidayCalendars";
import useHolidayCalendar from "../../hooks/useHolidayCalendars/useHolidayCalendars";
import useStaffs from "../../hooks/useStaffs/useStaffs";
import generateMockShifts from "./generateMockShifts";

// ShiftManagement: シフト管理テーブル。左固定列を前面に出し、各日ごとの出勤人数を集計して表示する。
export default function ShiftManagement() {
  const navigate = useNavigate();
  const { loading, error, staffs } = useStaffs();

  const shiftStaffs = useMemo(
    () => staffs.filter((s) => s.workType === "shift"),
    [staffs]
  );

  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const monthStart = currentMonth.startOf("month");
  const daysInMonth = monthStart.daysInMonth();

  const days = useMemo(
    () =>
      Array.from({ length: daysInMonth }).map((_, i) =>
        monthStart.add(i, "day")
      ),
    [monthStart.year(), monthStart.month(), daysInMonth]
  );

  const { holidayCalendars = [] } = useHolidayCalendar();
  const { companyHolidayCalendars = [] } = useCompanyHolidayCalendars();

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

  const getHeaderCellSx = (d: dayjs.Dayjs) => {
    const dateKey = d.format("YYYY-MM-DD");
    const day = d.day();
    if (holidaySet.has(dateKey) || day === 0)
      return { minWidth: 56, bgcolor: "rgba(244,67,54,0.18)" };
    if (companyHolidaySet.has(dateKey))
      return { minWidth: 56, bgcolor: "rgba(255,152,0,0.18)" };
    if (day === 6) return { minWidth: 56, bgcolor: "rgba(33,150,243,0.12)" };
    return { minWidth: 56 };
  };

  // シミュレーションシナリオを選べるようにする
  const [scenario, setScenario] = React.useState<string>("patterned");

  // mockShifts を state 化し、scenario/shiftStaffs/days に応じて生成する
  const [mockShifts, setMockShifts] = React.useState<
    Map<string, Record<string, "work" | "off" | "auto">>
  >(new Map());

  React.useEffect(() => {
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

  const dailyCounts = useMemo(() => {
    const m = new Map<string, number>();
    days.forEach((d) => {
      const key = d.format("YYYY-MM-DD");
      let cnt = 0;
      shiftStaffs.forEach((s) => {
        if (mockShifts.get(s.id)?.[key] === "work") cnt += 1;
      });
      m.set(key, cnt);
    });
    return m;
  }, [days, shiftStaffs, mockShifts]);

  // 想定人数: 今はシンプルにシフト勤務スタッフ数を全員出勤とした想定値を表示する
  const expectedCounts = useMemo(() => {
    const m = new Map<string, number>();
    days.forEach((d) => {
      const key = d.format("YYYY-MM-DD");
      m.set(key, shiftStaffs.length);
    });
    return m;
  }, [days, shiftStaffs]);

  const prevMonth = () => setCurrentMonth((m) => m.subtract(1, "month"));
  const nextMonth = () => setCurrentMonth((m) => m.add(1, "month"));

  // （削除）行ごとの自動調整は廃止し、全体を見て日ごとに割り当てる方式にする

  // 全スタッフに対して自動調整を行う
  // 全スタッフの状況を見て、日ごとに 'auto' を持つスタッフの中から
  // 必要分だけ 'work' を割り当て、残りを 'off' にするロジック
  const autoAdjustAll = () => {
    setMockShifts((prev) => {
      const next = new Map(prev);

      // まず、日ごとの現在の出勤数（'work' と確定している分）を計算
      const baseCounts = new Map<string, number>();
      days.forEach((d) => {
        const key = d.format("YYYY-MM-DD");
        let cnt = 0;
        shiftStaffs.forEach((s) => {
          const v = prev.get(s.id)?.[key];
          if (v === "work") cnt += 1;
        });
        baseCounts.set(key, cnt);
      });

      // 日ごとに 'auto' を希望しているスタッフ一覧を作る
      const autoMap = new Map<string, string[]>(); // date -> staffIds[]
      days.forEach((d) => autoMap.set(d.format("YYYY-MM-DD"), []));
      shiftStaffs.forEach((s) => {
        const per = prev.get(s.id) || {};
        days.forEach((d) => {
          const key = d.format("YYYY-MM-DD");
          if (per[key] === "auto") {
            autoMap.get(key)!.push(s.id);
          }
        });
      });

      // 日ごとに必要数を計算して、候補リストの先頭から割り当てる（公平性はスタッフ順）
      days.forEach((d) => {
        const key = d.format("YYYY-MM-DD");
        const expected = expectedCounts.get(key) ?? shiftStaffs.length;
        const current = baseCounts.get(key) ?? 0;
        const need = Math.max(0, expected - current);
        const candidates = autoMap.get(key) || [];

        // 選ばれた staffId の集合
        const selected = new Set<string>(candidates.slice(0, need));

        // 各スタッフの per を更新
        shiftStaffs.forEach((s) => {
          const per = { ...(next.get(s.id) || {}) } as Record<
            string,
            "work" | "off" | "auto"
          >;
          if (per[key] === "auto") {
            if (selected.has(s.id)) {
              per[key] = "work";
            } else {
              per[key] = "off";
            }
            next.set(s.id, per);
          }
        });
      });

      return next;
    });
  };

  // 固定幅を広めにしてスタッフ名や集計ヘッダーが切れないようにする
  const STAFF_COL_WIDTH = 280;
  // 出勤 / 休憩 等の集計列はヘッダーが切れないよう少し広めにする
  const AGG_COL_WIDTH = 64;

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
        <Typography>シフト勤務スタッフ: {shiftStaffs.length} 名</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Chip label="前月" onClick={prevMonth} sx={{ mr: 1 }} clickable />
          <Chip label={monthStart.format("YYYY年 M月")} sx={{ mr: 1 }} />
          <Chip label="翌月" onClick={nextMonth} clickable />
          <Chip
            label="自動調整(全員)"
            onClick={autoAdjustAll}
            sx={{ ml: 1 }}
            clickable
          />

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="scenario-label">シミュレーション</InputLabel>
            <Select
              labelId="scenario-label"
              value={scenario}
              label="シミュレーション"
              onChange={(e) => setScenario(String(e.target.value))}
            >
              <MenuItem value="patterned">平日中心 (patterned)</MenuItem>
              <MenuItem value="balanced">均等ローテ (balanced)</MenuItem>
              <MenuItem value="sparse">出勤少なめ (sparse)</MenuItem>
              <MenuItem value="random">ランダム (random)</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error">
          スタッフの取得中にエラーが発生しました: {error.message}
        </Alert>
      )}

      {!loading && !error && (
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
              minWidth: STAFF_COL_WIDTH + days.length * 56 + AGG_COL_WIDTH * 2,
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
                    pl: 1,
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
                  aria-label="出勤"
                  title="出勤"
                  sx={{
                    bgcolor: "background.paper",
                    width: AGG_COL_WIDTH,
                    boxSizing: "border-box",
                    // ヘッダー行は上に固定しておく
                    position: "sticky",
                    top: 0,
                    left: `${STAFF_COL_WIDTH}px`,
                    zIndex: 3,
                    whiteSpace: "normal",
                    borderRight: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  出勤
                </TableCell>

                <TableCell
                  align="center"
                  aria-label="休日"
                  title="休日"
                  sx={{
                    bgcolor: "background.paper",
                    width: AGG_COL_WIDTH,
                    boxSizing: "border-box",
                    position: "sticky",
                    top: 0,
                    left: `${STAFF_COL_WIDTH + AGG_COL_WIDTH}px`,
                    zIndex: 3,
                    whiteSpace: "normal",
                    borderRight: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  休日
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
                  return (
                    <TableCell
                      key={key}
                      align="center"
                      sx={{
                        ...getHeaderCellSx(d),
                        position: "relative",
                        top: 0,
                        zIndex: 0,
                        // 各日付カラムの区切り用の縦線
                        borderLeft: "1px solid",
                        borderColor: "divider",
                        px: 0,
                      }}
                    >
                      <Box
                        sx={{ cursor: "pointer", px: 0.5 }}
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
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>

            <TableBody>
              {shiftStaffs.length > 0 && (
                <>
                  {/* 想定人数と過不足を1行に統合 */}
                  <TableRow sx={{ cursor: "default" }}>
                    <TableCell
                      colSpan={3}
                      sx={{
                        bgcolor: "background.paper",
                        pl: 1,
                        pr: 1,
                        width: STAFF_COL_WIDTH + AGG_COL_WIDTH * 2,
                        boxSizing: "border-box",
                        borderRight: "1px solid",
                        borderColor: "divider",
                        // 左に固定して出勤/休日列も含めて結合
                        position: "sticky",
                        left: 0,
                        zIndex: 2,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        textAlign: "right",
                      }}
                    >
                      <Typography variant="body2">
                        想定人数（過不足）
                      </Typography>
                    </TableCell>

                    {days.map((d) => {
                      const key = d.format("YYYY-MM-DD");
                      const actual = dailyCounts.get(key) ?? 0;
                      const expected = expectedCounts.get(key) ?? 0;
                      const delta = actual - expected;
                      const deltaText = delta > 0 ? `+${delta}` : `${delta}`;
                      // deltaColor was used previously for text color; background highlight now used instead
                      return (
                        <TableCell
                          key={key}
                          sx={{
                            p: 0,
                            width: 56,
                            height: 40,
                            position: "relative",
                            // 日付ごとの区切り（左罫線）
                            borderLeft: "1px solid",
                            borderColor: "divider",
                          }}
                          align="center"
                        >
                          {/* 差分を上に、想定人数を下に小さく表示（縦並び） */}
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                            }}
                          >
                            {/* シンプルなテキストで差分を表示（背景のChip風表示を廃止） */}
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                fontSize: 14,
                                color:
                                  delta > 0
                                    ? "success.main"
                                    : delta < 0
                                    ? "error.main"
                                    : "text.primary",
                              }}
                            >
                              {deltaText}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "text.secondary",
                                lineHeight: 1,
                                mt: 0.5,
                              }}
                            >
                              （{expected}）
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

              {shiftStaffs.map((s) => (
                <TableRow
                  key={s.id}
                  hover
                  onClick={() => navigate(`/admin/shift/${s.id}`)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell
                    sx={{
                      bgcolor: "background.paper",
                      pl: 1,
                      width: STAFF_COL_WIDTH,
                      minWidth: STAFF_COL_WIDTH,
                      maxWidth: STAFF_COL_WIDTH,
                      boxSizing: "border-box",
                      borderRight: "1px solid",
                      borderColor: "divider",
                      // 左に固定
                      position: "sticky",
                      left: 0,
                      zIndex: 1,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    <Typography variant="body2">{`${s.familyName} ${s.givenName}`}</Typography>
                  </TableCell>

                  {(() => {
                    const per = mockShifts.get(s.id) || {};
                    const workCount = Object.values(per).filter(
                      (v) => v === "work"
                    ).length;
                    const offCount = Object.values(per).filter(
                      (v) => v === "off"
                    ).length;
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
                            left: `${STAFF_COL_WIDTH}px`,
                            zIndex: 1,
                          }}
                          align="center"
                        >
                          <Typography variant="body2">{workCount}</Typography>
                        </TableCell>
                        <TableCell
                          sx={{
                            p: 0,
                            width: AGG_COL_WIDTH,
                            height: 40,
                            bgcolor: "background.paper",
                            borderRight: "1px solid",
                            borderColor: "divider",
                            position: "sticky",
                            left: `${STAFF_COL_WIDTH + AGG_COL_WIDTH}px`,
                            zIndex: 1,
                          }}
                          align="center"
                        >
                          <Typography variant="body2">{offCount}</Typography>
                        </TableCell>
                      </>
                    );
                  })()}

                  {days.map((d) => {
                    const key = d.format("YYYY-MM-DD");
                    const state = mockShifts.get(s.id)?.[key];
                    return (
                      <TableCell
                        key={key}
                        sx={{
                          p: 0,
                          width: 56,
                          height: 40,
                          position: "relative",
                          // 各日付の左罫線
                          borderLeft: "1px solid",
                          borderColor: "divider",
                        }}
                        align="center"
                      >
                        {state === "work" ? (
                          <Typography
                            variant="body2"
                            sx={{ color: "success.main", fontWeight: 700 }}
                          >
                            ○
                          </Typography>
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{ color: "text.secondary", fontWeight: 700 }}
                          >
                            ×
                          </Typography>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Container>
  );
}
