import { GraphQLResult } from "@aws-amplify/api";
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
import { API } from "aws-amplify";
import dayjs from "dayjs";
import React, { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ListShiftRequestsQuery, ShiftRequestStatus } from "@/API";
import CommonBreadcrumbs from "@/components/common/CommonBreadcrumbs";
import { AppConfigContext } from "@/context/AppConfigContext";
import { listShiftRequests } from "@/graphql/queries";

import useCompanyHolidayCalendars from "../../hooks/useCompanyHolidayCalendars/useCompanyHolidayCalendars";
import useHolidayCalendar from "../../hooks/useHolidayCalendars/useHolidayCalendars";
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

const hashString = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
};

const getAutoRestState = (staffId: string, dateKey: string): ShiftState =>
  hashString(`${staffId}-${dateKey}`) % 2 === 0 ? "fixedOff" : "requestedOff";

const statusVisualMap: Record<ShiftState, { label: string; color: string }> = {
  work: { label: "○", color: "success.main" },
  fixedOff: { label: "固", color: "error.main" },
  requestedOff: { label: "希", color: "warning.main" },
  auto: { label: "△", color: "info.main" },
};

const defaultStatusVisual = { label: "-", color: "text.secondary" };

type ShiftGroupConstraints = {
  min: number | null;
  max: number | null;
  fixed: number | null;
};

const resolveGroupTargetForSummary = (
  constraints: ShiftGroupConstraints,
  fallback: number
) => {
  if (constraints.fixed !== null) return constraints.fixed;
  if (constraints.min !== null) return constraints.min;
  if (constraints.max !== null) return constraints.max;
  return fallback;
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

// ShiftManagement: シフト管理テーブル。左固定列を前面に出し、各日ごとの出勤人数を集計して表示する。
export default function ShiftManagement() {
  const navigate = useNavigate();
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

  // シミュレーションシナリオを選べるようにする（デフォルトは実際の希望シフト）
  const [scenario, setScenario] = React.useState<string>("actual");

  // mockShifts を state 化し、scenario/shiftStaffs/days に応じて生成する
  const [mockShifts, setMockShifts] = React.useState<
    Map<string, Record<string, ShiftState>>
  >(new Map());

  const [shiftRequestAssignments, setShiftRequestAssignments] = React.useState<
    Map<string, Record<string, ShiftState>>
  >(new Map());
  const [shiftRequestsLoading, setShiftRequestsLoading] = useState(false);
  const [shiftRequestsError, setShiftRequestsError] = useState<string | null>(
    null
  );

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
          });

          nextToken = response.data?.listShiftRequests?.nextToken ?? null;
        } while (nextToken);

        if (!isMounted) return;
        setShiftRequestAssignments(nextAssignments);
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

  // 想定人数: 今はシンプルにシフト勤務スタッフ数を全員出勤とした想定値を表示する
  const expectedCounts = useMemo(() => {
    const expectedTotal = groupedShiftStaffs.reduce((sum, group) => {
      return (
        sum +
        resolveGroupTargetForSummary(group.constraints, group.members.length)
      );
    }, 0);

    const m = new Map<string, number>();
    days.forEach((d) => {
      const key = d.format("YYYY-MM-DD");
      m.set(key, expectedTotal);
    });
    return m;
  }, [days, groupedShiftStaffs]);

  const prevMonth = () => setCurrentMonth((m) => m.subtract(1, "month"));
  const nextMonth = () => setCurrentMonth((m) => m.add(1, "month"));

  // （削除）行ごとの自動調整は廃止し、全体を見て日ごとに割り当てる方式にする

  // 全スタッフに対して自動調整を行う
  // 全スタッフの状況を見て、日ごとに 'auto' を持つスタッフの中から
  // 必要分だけ 'work' を割り当て、残りを 'off' にするロジック
  const autoAdjustAll = () => {
    if (scenario === "actual") return;
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
            ShiftState
          >;
          if (per[key] === "auto") {
            per[key] = selected.has(s.id)
              ? "work"
              : getAutoRestState(s.id, key);
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
            disabled={scenario === "actual"}
          />

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="scenario-label">シミュレーション</InputLabel>
            <Select
              labelId="scenario-label"
              value={scenario}
              label="シミュレーション"
              onChange={(e) => setScenario(String(e.target.value))}
            >
              <MenuItem value="actual">希望シフト</MenuItem>
              <MenuItem value="patterned">平日中心 (patterned)</MenuItem>
              <MenuItem value="balanced">均等ローテ (balanced)</MenuItem>
              <MenuItem value="sparse">出勤少なめ (sparse)</MenuItem>
              <MenuItem value="random">ランダム (random)</MenuItem>
            </Select>
          </FormControl>
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
                  STAFF_COL_WIDTH + days.length * 56 + AGG_COL_WIDTH * 3,
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
                      whiteSpace: "nowrap",
                      borderRight: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    出勤
                  </TableCell>

                  <TableCell
                    align="center"
                    aria-label="固定休"
                    title="固定休"
                    sx={{
                      bgcolor: "background.paper",
                      width: AGG_COL_WIDTH,
                      boxSizing: "border-box",
                      position: "sticky",
                      top: 0,
                      left: `${STAFF_COL_WIDTH + AGG_COL_WIDTH}px`,
                      zIndex: 3,
                      whiteSpace: "nowrap",
                      borderRight: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    固定休
                  </TableCell>

                  <TableCell
                    align="center"
                    aria-label="希望休"
                    title="希望休"
                    sx={{
                      bgcolor: "background.paper",
                      width: AGG_COL_WIDTH,
                      boxSizing: "border-box",
                      position: "sticky",
                      top: 0,
                      left: `${STAFF_COL_WIDTH + AGG_COL_WIDTH * 2}px`,
                      zIndex: 3,
                      whiteSpace: "nowrap",
                      borderRight: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    希望休
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
                        colSpan={4}
                        sx={{
                          bgcolor: "background.paper",
                          pl: 1,
                          pr: 1,
                          width: STAFF_COL_WIDTH + AGG_COL_WIDTH * 3,
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
                        <Typography variant="body2">出勤人数</Typography>
                      </TableCell>

                      {days.map((d) => {
                        const key = d.format("YYYY-MM-DD");
                        const actual = dailyCounts.get(key) ?? 0;
                        return (
                          <TableCell
                            key={key}
                            sx={{
                              p: 0,
                              width: 56,
                              height: 40,
                              position: "relative",
                              borderLeft: "1px solid",
                              borderColor: "divider",
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
                    <TableCell colSpan={days.length + 4}>
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
                            colSpan={4}
                            sx={{
                              py: 1.5,
                              pl: 1,
                              pr: 1,
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
                              py: 1.5,
                              bgcolor: "grey.100",
                              borderBottom: "1px solid",
                              borderColor: "divider",
                            }}
                          />
                        </TableRow>

                        {!isUnassignedGroup && (
                          <TableRow sx={{ cursor: "default" }}>
                            <TableCell
                              colSpan={4}
                              sx={{
                                bgcolor: "background.paper",
                                pl: 1,
                                pr: 1,
                                width: STAFF_COL_WIDTH + AGG_COL_WIDTH * 3,
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
                                {groupName} の日別稼働
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
                                    p: 0,
                                    width: 56,
                                    height: 40,
                                    position: "relative",
                                    borderLeft: "1px solid",
                                    borderColor: "divider",
                                    bgcolor: highlightBg,
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

                        {members.map((s) => (
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
                                    <Typography variant="body2">
                                      {workCount}
                                    </Typography>
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
                                      left: `${
                                        STAFF_COL_WIDTH + AGG_COL_WIDTH
                                      }px`,
                                      zIndex: 1,
                                    }}
                                    align="center"
                                  >
                                    <Typography variant="body2">
                                      {fixedOffCount}
                                    </Typography>
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
                                      left: `${
                                        STAFF_COL_WIDTH + AGG_COL_WIDTH * 2
                                      }px`,
                                      zIndex: 1,
                                    }}
                                    align="center"
                                  >
                                    <Typography variant="body2">
                                      {requestedOffCount}
                                    </Typography>
                                  </TableCell>
                                </>
                              );
                            })()}

                            {days.map((d) => {
                              const key = d.format("YYYY-MM-DD");
                              const state = displayShifts.get(s.id)?.[key];
                              const visual =
                                (state && statusVisualMap[state]) ||
                                defaultStatusVisual;
                              return (
                                <TableCell
                                  key={key}
                                  sx={{
                                    p: 0,
                                    width: 56,
                                    height: 40,
                                    position: "relative",
                                    borderLeft: "1px solid",
                                    borderColor: "divider",
                                  }}
                                  align="center"
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
                        ))}
                      </React.Fragment>
                    );
                  }
                )}
              </TableBody>
            </Table>
          </Box>
        </>
      )}
    </Container>
  );
}
