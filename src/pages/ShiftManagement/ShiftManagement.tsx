import {
  Alert,
  Box,
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
import React, { useMemo, useState } from "react";

import useCompanyHolidayCalendars from "../../hooks/useCompanyHolidayCalendars/useCompanyHolidayCalendars";
import useHolidayCalendar from "../../hooks/useHolidayCalendars/useHolidayCalendars";
import useStaffs from "../../hooks/useStaffs/useStaffs";

export default function ShiftManagement() {
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

  // 祝日・会社休日を取得してセットにする（高速参照用）
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

    // 優先順位: 祝祭日/日曜(同じ色) > 会社休日 > 土曜
    const day = d.day();

    // 日曜または祝日は同じ濃いめの色にする
    if (holidaySet.has(dateKey) || day === 0) {
      return { minWidth: 56, bgcolor: "rgba(244,67,54,0.18)" }; // 日祝: 濃い赤
    }

    if (companyHolidaySet.has(dateKey)) {
      return { minWidth: 56, bgcolor: "rgba(255,152,0,0.18)" }; // 会社休日: 濃いオレンジ
    }

    if (day === 6) {
      return { minWidth: 56, bgcolor: "rgba(33,150,243,0.12)" }; // 土曜: 濃いめの青
    }

    return { minWidth: 56 };
  };

  // モックのシフト割当を生成（当面のUI確認用）
  const mockShifts = useMemo(() => {
    // 例: 'work' または 'off' をランダムに割り当てる
    const map = new Map<string, Record<string, "work" | "off">>();
    shiftStaffs.forEach((s) => {
      const perDay: Record<string, "work" | "off"> = {};
      days.forEach((d) => {
        // 乱数で割当（再現性不要）
        perDay[d.format("YYYY-MM-DD")] = Math.random() > 0.3 ? "work" : "off";
      });
      map.set(s.id, perDay);
    });
    return map;
  }, [shiftStaffs, days]);

  const prevMonth = () => setCurrentMonth((m) => m.subtract(1, "month"));
  const nextMonth = () => setCurrentMonth((m) => m.add(1, "month"));

  return (
    <Container sx={{ py: 3 }}>
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
        <Box>
          <Chip label="前月" onClick={prevMonth} sx={{ mr: 1 }} clickable />
          <Chip label={monthStart.format("YYYY年 M月")} sx={{ mr: 1 }} />
          <Chip label="翌月" onClick={nextMonth} clickable />
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
        // position: 'relative' を与えることで内部の sticky 要素が期待通り動作します
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
            sx={{ minWidth: 220 + days.length * 56 }}
          >
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    // ヘッダー行の左固定セル。top: 0 を指定してヘッダーの上部にも固定されるようにする
                    position: "sticky",
                    left: 0,
                    top: 0,
                    zIndex: 3,
                    bgcolor: "background.paper",
                    minWidth: 220,
                    pl: 1,
                    borderRight: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  スタッフ
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
                    <TableCell key={key} align="center" sx={getHeaderCellSx(d)}>
                      {title ? (
                        <Tooltip title={title}>{content}</Tooltip>
                      ) : (
                        content
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>

            <TableBody>
              {shiftStaffs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={days.length + 1}>
                    <Typography sx={{ py: 2 }}>
                      シフト勤務のスタッフは見つかりませんでした。
                    </Typography>
                  </TableCell>
                </TableRow>
              )}

              {shiftStaffs.map((s) => (
                <TableRow key={s.id} hover>
                  <TableCell
                    sx={{
                      // 本文側の左固定セル。ヘッダーより zIndex が低くなるように調整
                      position: "sticky",
                      left: 0,
                      zIndex: 2,
                      bgcolor: "background.paper",
                      pl: 1,
                      minWidth: 220,
                      borderRight: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography variant="body2">{`${s.familyName} ${s.givenName}`}</Typography>
                  </TableCell>

                  {days.map((d) => {
                    const key = d.format("YYYY-MM-DD");
                    const state = mockShifts.get(s.id)?.[key];
                    return (
                      <TableCell
                        key={key}
                        sx={{ p: 0, width: 56, height: 40 }}
                        align="center"
                      >
                        {state === "work" ? (
                          <Chip label="出" size="small" color="primary" />
                        ) : (
                          <Chip label="休" size="small" color="default" />
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
