import CheckIcon from "@mui/icons-material/Check";
import LockIcon from "@mui/icons-material/Lock";
import { Box, Divider, Stack, Tooltip, Typography } from "@mui/material";
import dayjs from "dayjs";
import { MouseEvent, useCallback, useRef } from "react";

import {
  ShiftCellData,
  ShiftDataMap,
  ShiftState,
} from "../../types/collaborative.types";

const STATE_CONFIG: Record<
  ShiftState,
  { label: string; bg: string; text: string }
> = {
  work: { label: "出", bg: "rgb(76 175 80)", text: "#fff" },
  requestedOff: { label: "希", bg: "rgb(255 152 0)", text: "#fff" },
  fixedOff: { label: "固", bg: "rgb(244 67 54)", text: "#fff" },
  auto: { label: "自", bg: "rgb(33 150 243)", text: "#fff" },
  empty: { label: "-", bg: "rgb(210 210 210)", text: "#666" },
};

interface DayCellProps {
  day: dayjs.Dayjs;
  cellData: ShiftCellData | undefined;
  isSelected: boolean;
  isSelfEditing: boolean;
  isOtherEditing: boolean;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  buttonRef?: (element: HTMLButtonElement | null) => void;
  onFocusMove?: (direction: "left" | "right") => void;
}

const DayCell = ({
  day,
  cellData,
  isSelected,
  isSelfEditing,
  isOtherEditing,
  onClick,
  buttonRef,
  onFocusMove,
}: DayCellProps) => {
  const state = cellData?.state ?? "empty";
  const config = STATE_CONFIG[state];
  const dayOfWeek = day.day();
  const isSunday = dayOfWeek === 0;
  const isSaturday = dayOfWeek === 6;
  const isToday = day.isSame(dayjs(), "day");

  return (
    <Tooltip
      title={`${day.format("M/D(ddd)")} ${state === "empty" ? "未入力" : config.label === "出" ? "出勤" : state === "requestedOff" ? "希望休" : state === "fixedOff" ? "固定休" : "自動調整"}${cellData?.isLocked ? "（確定済み）" : isSelfEditing ? "（編集中）" : isOtherEditing ? "（他ユーザー編集中）" : ""}`}
      arrow
    >
      <Box
        component="button"
        ref={buttonRef}
        type="button"
        onClick={onClick}
        onKeyDown={(event) => {
          if (!onFocusMove) return;
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            onFocusMove("left");
          }
          if (event.key === "ArrowRight") {
            event.preventDefault();
            onFocusMove("right");
          }
        }}
        tabIndex={isSelected ? 0 : -1}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2px",
          minWidth: 26,
          border: "none",
          background: "transparent",
          padding: 0,
          cursor: isSelected ? "pointer" : "default",
          outline: "none",
        }}
      >
        {/* 日付数字 */}
        <Typography
          variant="caption"
          sx={{
            fontSize: 9,
            lineHeight: 1,
            fontWeight: isToday ? 700 : 400,
            color: isToday
              ? "primary.main"
              : isSunday
                ? "error.main"
                : isSaturday
                  ? "info.main"
                  : "text.secondary",
          }}
        >
          {day.format("D")}
        </Typography>

        {/* 状態セル */}
        <Box
          sx={{
            width: 22,
            height: 22,
            borderRadius: "4px",
            bgcolor: config.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: isSelected ? "2px solid" : "1px solid transparent",
            borderColor: isSelected ? "primary.main" : "transparent",
            boxSizing: "border-box",
            boxShadow: isSelected ? "0 0 0 1px #1976d2" : "none",
            opacity: cellData?.isLocked ? 0.65 : 1,
            position: "relative",
          }}
        >
          <Typography
            sx={{
              fontSize: 8,
              fontWeight: 700,
              color: config.text,
              lineHeight: 1,
              userSelect: "none",
            }}
          >
            {config.label}
          </Typography>
          {/* 確定アイコン */}
          {cellData?.isLocked && (
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 8,
                height: 8,
                bgcolor: "success.main",
                borderRadius: "2px 0 2px 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckIcon sx={{ fontSize: 6, color: "#fff" }} />
            </Box>
          )}

          {!cellData?.isLocked && (isSelfEditing || isOtherEditing) && (
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 8,
                height: 8,
                bgcolor: isSelfEditing ? "info.main" : "warning.main",
                borderRadius: "2px 0 2px 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LockIcon sx={{ fontSize: 6, color: "#fff" }} />
            </Box>
          )}
        </Box>
      </Box>
    </Tooltip>
  );
};

interface SingleStaffBandProps {
  staffId: string;
  staffName: string;
  days: dayjs.Dayjs[];
  shiftDataMap: ShiftDataMap;
  selectedDates: Set<string>;
  hasEditLock?: (staffId: string, date: string) => boolean;
  isCellBeingEdited?: (staffId: string, date: string) => boolean;
  onDayClick?: (
    staffId: string,
    date: string,
    event: MouseEvent<HTMLButtonElement>,
  ) => void;
}

const SingleStaffBand = ({
  staffId,
  staffName,
  days,
  shiftDataMap,
  selectedDates,
  hasEditLock,
  isCellBeingEdited,
  onDayClick,
}: SingleStaffBandProps) => {
  const staffDayMap = shiftDataMap.get(staffId);
  const cellRefs = useRef(new Map<string, HTMLButtonElement | null>());

  const focusNeighborCell = useCallback(
    (currentDateStr: string, direction: "left" | "right") => {
      const currentIndex = days.findIndex(
        (day) => day.format("YYYY-MM-DD") === currentDateStr,
      );
      if (currentIndex < 0) return;

      const nextIndex =
        direction === "left"
          ? Math.max(0, currentIndex - 1)
          : Math.min(days.length - 1, currentIndex + 1);
      const nextDateStr = days[nextIndex]?.format("YYYY-MM-DD");
      if (!nextDateStr) return;

      cellRefs.current.get(nextDateStr)?.focus();
    },
    [days],
  );

  const registerCell = useCallback(
    (dateStr: string, element: HTMLButtonElement | null) => {
      if (element) {
        cellRefs.current.set(dateStr, element);
      } else {
        cellRefs.current.delete(dateStr);
      }
    },
    [],
  );

  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mb: 0.5, display: "block", fontWeight: 500 }}
      >
        {staffName}
      </Typography>
      <Box
        sx={{
          overflowX: "auto",
          overflowY: "hidden",
          pb: 0.5,
          "&::-webkit-scrollbar": { height: 4 },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "action.disabled",
            borderRadius: 2,
          },
        }}
      >
        <Box sx={{ display: "flex", gap: "2px", width: "max-content" }}>
          {days.map((day) => {
            const dayKey = day.format("DD");
            const dateKey = day.format("DD");
            const cellData = staffDayMap?.get(dayKey);
            const isSelected = selectedDates.has(dateKey);
            const isSelfEditing = hasEditLock?.(staffId, dateKey) ?? false;
            const isOtherEditing =
              isCellBeingEdited?.(staffId, dateKey) ?? false;

            return (
              <DayCell
                key={dayKey}
                day={day}
                cellData={cellData}
                isSelected={isSelected}
                isSelfEditing={isSelfEditing}
                isOtherEditing={isOtherEditing}
                onClick={(event) => onDayClick?.(staffId, dateKey, event)}
                buttonRef={(element) => registerCell(dateKey, element)}
                onFocusMove={(direction) =>
                  focusNeighborCell(dateKey, direction)
                }
              />
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export interface StaffMonthlyBandProps {
  /** 表示するスタッフIDリスト（選択中の一意スタッフ） */
  staffIds: string[];
  staffNameMap: Map<string, string>;
  days: dayjs.Dayjs[];
  shiftDataMap: ShiftDataMap;
  /** 選択セルの日付文字列セット ("YYYY-MM-DD") */
  selectedDates: Set<string>;
  hasEditLock?: (staffId: string, date: string) => boolean;
  isCellBeingEdited?: (staffId: string, date: string) => boolean;
  onDayClick?: (
    staffId: string,
    date: string,
    event: MouseEvent<HTMLButtonElement>,
  ) => void;
}

export const StaffMonthlyBand = ({
  staffIds,
  staffNameMap,
  days,
  shiftDataMap,
  selectedDates,
  hasEditLock,
  isCellBeingEdited,
  onDayClick,
}: StaffMonthlyBandProps) => {
  if (staffIds.length === 0 || days.length === 0) return null;

  return (
    <Box sx={{ mb: 1 }}>
      {/* スタッフ別月次帯 */}
      <Stack spacing={1}>
        {staffIds.map((staffId, index) => (
          <Box key={staffId}>
            {index > 0 && <Divider sx={{ mb: 1 }} />}
            <SingleStaffBand
              staffId={staffId}
              staffName={staffNameMap.get(staffId) ?? staffId}
              days={days}
              shiftDataMap={shiftDataMap}
              selectedDates={selectedDates}
              hasEditLock={hasEditLock}
              isCellBeingEdited={isCellBeingEdited}
              onDayClick={onDayClick}
            />
          </Box>
        ))}
      </Stack>
    </Box>
  );
};
