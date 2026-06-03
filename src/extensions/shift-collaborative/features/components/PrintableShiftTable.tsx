import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import PropTypes from "prop-types";
import { memo, useMemo } from "react";

import { ShiftState } from "../types/collaborative.types";

interface PrintableShiftTableProps {
  days: Dayjs[];
  staffs: Array<{
    id: string;
    familyName?: string;
    givenName?: string;
  }>;
  shiftDataMap: Map<
    string,
    Map<
      string,
      {
        state: ShiftState;
        isLocked: boolean;
      }
    >
  >;
  targetMonth: string;
}

const shiftStateConfig: Record<
  ShiftState,
  { label: string; color: string; text: string }
> = {
  work: { label: "○", color: "rgb(76 175 80)", text: "出勤" },
  fixedOff: { label: "固", color: "rgb(244 67 54)", text: "固定休" },
  requestedOff: { label: "希", color: "rgb(255 152 0)", text: "希望休" },
  auto: { label: "△", color: "rgb(33 150 243)", text: "自動調整枠" },
  empty: { label: "-", color: "rgb(158 158 158)", text: "未入力" },
};

/**
 * 印刷用シフトテーブルコンポーネント
 * @description
 * 印刷レイアウト用のシフト調整テーブル
 * A4サイズの用紙に適した、読みやすい形式で表示
 */
const PrintableShiftTableComponent = ({
  days,
  staffs,
  shiftDataMap,
  targetMonth,
}: PrintableShiftTableProps) => {
  const staffNameMap = useMemo(
    () =>
      new Map(
        staffs.map((staff) => [
          staff.id,
          `${staff.familyName || ""}${staff.givenName || ""}`.trim() ||
            staff.id,
        ]),
      ),
    [staffs],
  );

  const getShiftState = (staffId: string, date: string): ShiftState => {
    return shiftDataMap.get(staffId)?.get(date)?.state ?? "empty";
  };

  const getShiftLabel = (state: ShiftState): string => {
    return shiftStateConfig[state].label;
  };

  const getCellColor = (state: ShiftState): string => {
    return shiftStateConfig[state].color;
  };

  const getWeekday = (day: Dayjs): string => {
    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
    return weekdays[day.day()];
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        p: 2,
        bgcolor: "white",
        color: "black",
      }}
    >
      {/* タイトル */}
      <Box sx={{ textAlign: "center", mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
          シフト調整表
        </Typography>
        <Typography variant="body2" sx={{ color: "rgb(102 102 102)" }}>
          {dayjs(targetMonth).format("YYYY年M月")}
        </Typography>
      </Box>

      {/* テーブル */}
      <Box sx={{ overflowX: "auto", pageBreakInside: "avoid" }}>
        <Table
          sx={{
            borderCollapse: "collapse",
            border: "1px solid rgb(51 51 51)",
            fontSize: "12px",
            width: "100%",
          }}
        >
          <TableHead>
            <TableRow sx={{ bgcolor: "rgb(245 245 245)" }}>
              <TableCell
                sx={{
                  border: "1px solid rgb(204 204 204)",
                  padding: "8px",
                  fontWeight: "bold",
                  textAlign: "center",
                  width: "120px",
                  whiteSpace: "nowrap",
                }}
              >
                スタッフ名
              </TableCell>
              {days.map((day) => (
                <TableCell
                  key={day.format("YYYY-MM-DD")}
                  sx={{
                    border: "1px solid rgb(204 204 204)",
                    padding: "4px",
                    fontWeight: "bold",
                    textAlign: "center",
                    width: "32px",
                    whiteSpace: "nowrap",
                    backgroundColor:
                      day.day() === 0 || day.day() === 6
                        ? "rgb(255 224 224)"
                        : undefined,
                  }}
                >
                  <Box sx={{ fontSize: "10px" }}>{day.format("D")}</Box>
                  <Box sx={{ fontSize: "9px", color: "rgb(102 102 102)" }}>
                    ({getWeekday(day)})
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {staffs.map((staff) => (
              <TableRow key={staff.id}>
                <TableCell
                  sx={{
                    border: "1px solid rgb(204 204 204)",
                    padding: "8px",
                    fontWeight: "500",
                    textAlign: "left",
                    whiteSpace: "nowrap",
                    width: "120px",
                  }}
                >
                  {staffNameMap.get(staff.id) || staff.id}
                </TableCell>
                {days.map((day) => {
                  const dayKey = day.format("DD");
                  const state = getShiftState(staff.id, dayKey);
                  const color = getCellColor(state);
                  const label = getShiftLabel(state);

                  return (
                    <TableCell
                      key={`${staff.id}-${dayKey}`}
                      sx={{
                        border: "1px solid rgb(204 204 204)",
                        padding: "4px",
                        textAlign: "center",
                        width: "32px",
                        backgroundColor: `${color}20`,
                        color: color,
                        fontWeight: "bold",
                        fontSize: "14px",
                      }}
                    >
                      {label}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      {/* 凡例 */}
      <Box
        sx={{
          pageBreakInside: "avoid",
          borderTop: "1px solid rgb(204 204 204)",
          pt: 2,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
          凡例
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 2,
          }}
        >
          {Object.entries(shiftStateConfig).map(([state, config]) => (
            <Box
              key={state}
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Box
                sx={{
                  width: "20px",
                  height: "20px",
                  backgroundColor: `${config.color}20`,
                  color: config.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  border: `1px solid ${config.color}`,
                  fontSize: "12px",
                }}
              >
                {config.label}
              </Box>
              <Typography variant="body2">{config.text}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* フッター */}
      <Box
        sx={{
          pageBreakInside: "avoid",
          borderTop: "1px solid rgb(204 204 204)",
          pt: 2,
          fontSize: "10px",
          color: "rgb(153 153 153)",
          textAlign: "right",
        }}
      >
        <Typography variant="caption">
          出力日時: {dayjs().format("YYYY年M月D日 HH:mm")}
        </Typography>
      </Box>
    </Box>
  );
};

PrintableShiftTableComponent.propTypes = {
  days: PropTypes.arrayOf(PropTypes.any).isRequired,
  staffs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      familyName: PropTypes.string,
      givenName: PropTypes.string,
    }),
  ).isRequired,
  shiftDataMap: PropTypes.instanceOf(Map).isRequired,
  targetMonth: PropTypes.string.isRequired,
};

export const PrintableShiftTable = memo(PrintableShiftTableComponent);

PrintableShiftTable.displayName = "PrintableShiftTable";

(
  PrintableShiftTable as React.ComponentType<PrintableShiftTableProps>
).propTypes = {
  days: PropTypes.arrayOf(PropTypes.any).isRequired,
  staffs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      familyName: PropTypes.string,
      givenName: PropTypes.string,
    }),
  ).isRequired,
  shiftDataMap: PropTypes.instanceOf(Map).isRequired,
  targetMonth: PropTypes.string.isRequired,
};
