import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import {
  alpha,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { AppButton } from "@shared/ui/button";
import dayjs from "dayjs";
import React, { useMemo } from "react";

import { PendingLockAction } from "../../hooks/useVirtualizedShiftTableState";
import {
  CollaborativeUser,
  ShiftCellEditLockOwner,
  ShiftState,
} from "../../types/collaborative.types";

type ShiftCellComponentProps = {
  staffId: string;
  date: string;
  state: ShiftState;
  isLocked: boolean;
  isEditing: boolean;
  editLockOwner?: ShiftCellEditLockOwner;
  editorName?: string;
  editorColor?: string;
  lastChangedBy?: string;
  lastChangedAt?: string;
  onClick: (event: React.MouseEvent) => void;
  onRegisterRef: (element: HTMLElement | null) => void;
  onMouseDown: (event: React.MouseEvent) => void;
  onMouseEnter: () => void;
  onContextMenu?: (event: React.MouseEvent) => void;
  isFocused: boolean;
  isSelected: boolean;
};

interface StaffTableRowProps {
  staffId: string;
  staffName: string;
  staffData: Map<
    string,
    {
      state: ShiftState;
      isLocked: boolean;
      lastChangedBy?: string;
      lastChangedAt?: string;
    }
  >;
  days: dayjs.Dayjs[];
  isAdmin?: boolean;
  currentUserId?: string;
  isCellBeingEdited: (staffId: string, date: string) => boolean;
  getCellEditor: (staffId: string, date: string) => CollaborativeUser | undefined;
  focusedCell: { staffId: string; date: string } | null;
  isCellSelected: (staffId: string, date: string) => boolean;
  onCellClick: (staffId: string, date: string, event: React.MouseEvent) => void;
  onCellRegisterRef: (
    staffId: string,
    date: string,
    element: HTMLElement | null,
  ) => void;
  onCellMouseDown: (staffId: string, date: string, event: React.MouseEvent) => void;
  onCellMouseEnter: (staffId: string, date: string) => void;
  onCellContextMenu?: (
    staffId: string,
    date: string,
    event: React.MouseEvent,
  ) => void;
  ShiftCellComponent: React.ComponentType<ShiftCellComponentProps>;
  onRequestPendingAction: (action: PendingLockAction) => void;
}

const StaffTableRow = ({
  staffId,
  staffName,
  staffData,
  days,
  isAdmin,
  currentUserId,
  isCellBeingEdited,
  getCellEditor,
  focusedCell,
  isCellSelected,
  onCellClick,
  onCellRegisterRef,
  onCellMouseDown,
  onCellMouseEnter,
  onCellContextMenu,
  ShiftCellComponent,
  onRequestPendingAction,
}: StaffTableRowProps) => {
  const isCurrentUser = staffId === currentUserId;
  const nonEmptyCells = useMemo(
    () => Array.from(staffData.values()).filter((c) => c.state !== "empty"),
    [staffData],
  );
  const allLocked =
    nonEmptyCells.length > 0 && nonEmptyCells.every((cell) => cell.isLocked);

  return (
    <TableRow
      sx={{
        backgroundColor: isCurrentUser ? alpha("#2196F3", 0.1) : "transparent",
        "&:hover": {
          backgroundColor: isCurrentUser ? alpha("#2196F3", 0.15) : undefined,
        },
      }}
    >
      <TableCell
        sx={{
          position: "sticky",
          left: 0,
          zIndex: 2,
          bgcolor: isCurrentUser ? alpha("#2196F3", 0.1) : "background.paper",
          fontWeight: isCurrentUser ? 700 : 600,
          color: isCurrentUser ? "primary.main" : undefined,
          whiteSpace: "nowrap",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {staffName}
          {isAdmin && (
            <AppButton
              size="sm"
              variant="outline"
              tone="neutral"
              startIcon={
                allLocked ? <LockOpenIcon fontSize="inherit" /> : <LockIcon fontSize="inherit" />
              }
              onClick={() =>
                onRequestPendingAction(
                  allLocked
                    ? { kind: "unlockStaff", staffId, staffName }
                    : { kind: "lockStaff", staffId, staffName },
                )
              }
              sx={{
                fontSize: "0.7rem",
                py: 0.25,
                px: 1,
                color: allLocked ? "warning.main" : "primary.main",
                borderColor: allLocked ? "warning.main" : "primary.main",
              }}
            >
              {allLocked ? "解除" : "確定"}
            </AppButton>
          )}
        </Box>
      </TableCell>
      {days.map((day) => {
        const dayKey = day.format("DD");
        const cell = staffData.get(dayKey);

        if (!cell) {
          return <TableCell key={dayKey}>-</TableCell>;
        }

        const isEditing = isCellBeingEdited(staffId, dayKey);
        const editor = getCellEditor(staffId, dayKey);
        const editLockOwner: ShiftCellEditLockOwner = editor
          ? editor.userId === currentUserId
            ? "self"
            : "other"
          : null;
        const isFocused = focusedCell?.staffId === staffId && focusedCell?.date === dayKey;
        const isSelected = isCellSelected(staffId, dayKey);

        return (
          <ShiftCellComponent
            key={dayKey}
            staffId={staffId}
            date={dayKey}
            state={cell.state}
            isLocked={cell.isLocked}
            isEditing={isEditing}
            editLockOwner={editLockOwner}
            editorName={editor?.userName}
            editorColor={editor?.color}
            lastChangedBy={cell.lastChangedBy}
            lastChangedAt={cell.lastChangedAt}
            onClick={(event) => onCellClick(staffId, dayKey, event)}
            onRegisterRef={(element) => onCellRegisterRef(staffId, dayKey, element)}
            onMouseDown={(event) => onCellMouseDown(staffId, dayKey, event)}
            onMouseEnter={() => onCellMouseEnter(staffId, dayKey)}
            onContextMenu={
              onCellContextMenu
                ? (event: React.MouseEvent) => onCellContextMenu(staffId, dayKey, event)
                : undefined
            }
            isFocused={isFocused}
            isSelected={isSelected}
          />
        );
      })}
    </TableRow>
  );
};

interface ShiftTableHeaderProps {
  days: dayjs.Dayjs[];
  isAdmin?: boolean;
  isAllMonthLocked: boolean;
  calculateDailyCount: (day: dayjs.Dayjs) => {
    work: number;
    fixedOff: number;
    requestedOff: number;
    plannedCapacity: number;
  };
  isWeekend: (day: dayjs.Dayjs) => boolean;
  onPendingAction: (action: PendingLockAction) => void;
}

const ShiftTableHeader = ({
  days,
  isAdmin,
  isAllMonthLocked,
  calculateDailyCount,
  isWeekend,
  onPendingAction,
}: ShiftTableHeaderProps) => (
  <TableHead>
    <TableRow>
      <TableCell
        sx={{
          position: "sticky",
          left: 0,
          zIndex: 3,
          bgcolor: "background.paper",
          whiteSpace: "nowrap",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          スタッフ名
          {isAdmin && (
            <AppButton
              size="sm"
              variant="outline"
              tone="neutral"
              startIcon={
                isAllMonthLocked ? (
                  <LockOpenIcon fontSize="inherit" />
                ) : (
                  <LockIcon fontSize="inherit" />
                )
              }
              onClick={() =>
                onPendingAction(
                  isAllMonthLocked ? { kind: "unlockMonth" } : { kind: "lockMonth" },
                )
              }
              sx={{
                fontSize: "0.7rem",
                py: 0.25,
                px: 1,
                color: isAllMonthLocked ? "warning.main" : "primary.main",
                borderColor: isAllMonthLocked ? "warning.main" : "primary.main",
              }}
            >
              {isAllMonthLocked ? "全員解除" : "全員確定"}
            </AppButton>
          )}
        </Box>
      </TableCell>
      {days.map((day) => {
        const dayKey = day.format("DD");
        const count = calculateDailyCount(day);
        return (
          <TableCell
            key={dayKey}
            align="center"
            sx={{
              bgcolor: isWeekend(day) ? alpha("#f44336", 0.05) : "background.paper",
              minWidth: 50,
            }}
          >
            <Typography variant="caption" display="block">
              {day.format("M/D")}
            </Typography>
            <Typography variant="caption" display="block">
              ({day.format("ddd")})
            </Typography>
            <Typography
              variant="caption"
              color={count.work !== count.plannedCapacity ? "warning.main" : "text.secondary"}
            >
              {count.work}人
            </Typography>
          </TableCell>
        );
      })}
    </TableRow>
  </TableHead>
);

interface ShiftRemarksRowProps {
  days: dayjs.Dayjs[];
  getEventsForDay: (day: dayjs.Dayjs) => Array<{
    label: string;
    start: dayjs.Dayjs;
    end?: dayjs.Dayjs;
    color: string;
  }>;
}

const ShiftRemarksRow = ({ days, getEventsForDay }: ShiftRemarksRowProps) => (
  <TableRow>
    <TableCell
      sx={{
        position: "sticky",
        left: 0,
        zIndex: 2,
        bgcolor: "background.paper",
        fontWeight: 600,
      }}
    >
      備考
    </TableCell>
    {days.map((day) => {
      const events = getEventsForDay(day);
      return (
        <TableCell
          key={`remark-${day.format("DD")}`}
          sx={{ minWidth: 50, px: 2, py: 2, textAlign: "start", verticalAlign: "top" }}
        >
          {events.length > 0 && (
            <Box sx={{ display: "inline-block", writingMode: "vertical-rl" }}>
              {events.map((event) => (
                <Typography
                  key={`${event.label}-${event.start.format("YYYY-MM-DD")}`}
                  variant="caption"
                  component="span"
                  sx={{ fontWeight: 700, lineHeight: 1.2, display: "block" }}
                >
                  {event.label}
                </Typography>
              ))}
            </Box>
          )}
        </TableCell>
      );
    })}
  </TableRow>
);

interface VirtualizedShiftTableTableProps {
  days: dayjs.Dayjs[];
  staffIds: string[];
  shiftDataMap: Map<
    string,
    Map<
      string,
      {
        state: ShiftState;
        isLocked: boolean;
        lastChangedBy?: string;
        lastChangedAt?: string;
      }
    >
  >;
  staffMap: Map<string, string>;
  isCellBeingEdited: (staffId: string, date: string) => boolean;
  getCellEditor: (staffId: string, date: string) => CollaborativeUser | undefined;
  focusedCell: { staffId: string; date: string } | null;
  isCellSelected: (staffId: string, date: string) => boolean;
  onCellClick: (staffId: string, date: string, event: React.MouseEvent) => void;
  onCellRegisterRef: (
    staffId: string,
    date: string,
    element: HTMLElement | null,
  ) => void;
  onCellMouseDown: (staffId: string, date: string, event: React.MouseEvent) => void;
  onCellMouseEnter: (staffId: string, date: string) => void;
  onCellContextMenu?: (
    staffId: string,
    date: string,
    event: React.MouseEvent,
  ) => void;
  getEventsForDay: (day: dayjs.Dayjs) => Array<{
    label: string;
    start: dayjs.Dayjs;
    end?: dayjs.Dayjs;
    color: string;
  }>;
  ShiftCellComponent: React.ComponentType<ShiftCellComponentProps>;
  isWeekend: (day: dayjs.Dayjs) => boolean;
  calculateDailyCount: (day: dayjs.Dayjs) => {
    work: number;
    fixedOff: number;
    requestedOff: number;
    plannedCapacity: number;
  };
  currentUserId?: string;
  isAdmin?: boolean;
  isAllMonthLocked: boolean;
  onPendingAction: (action: PendingLockAction) => void;
}

export const VirtualizedShiftTableTable = ({
  days,
  staffIds,
  shiftDataMap,
  staffMap,
  isCellBeingEdited,
  getCellEditor,
  focusedCell,
  isCellSelected,
  onCellClick,
  onCellRegisterRef,
  onCellMouseDown,
  onCellMouseEnter,
  onCellContextMenu,
  getEventsForDay,
  ShiftCellComponent,
  isWeekend,
  calculateDailyCount,
  currentUserId,
  isAdmin,
  isAllMonthLocked,
  onPendingAction,
}: VirtualizedShiftTableTableProps) => (
  <TableContainer
    component={Paper}
    sx={{
      borderRadius: "24px",
      border: "1px solid rgba(226,232,240,0.8)",
      boxShadow: "0 24px 48px -36px rgba(15,23,42,0.35)",
      bgcolor: "#ffffff",
      overflowX: "auto",
      overflowY: "hidden",
    }}
  >
    <Table
      size="small"
      stickyHeader
      sx={{
        minWidth: "max-content",
        "& .MuiTableCell-root": {
          borderRight: "1px solid",
          borderColor: "divider",
        },
        "& .MuiTableCell-root:last-child": {
          borderRight: "none",
        },
        "& .MuiTableHead-root .MuiTableCell-root": {
          bgcolor: "#f8fafc",
        },
      }}
    >
      <ShiftTableHeader
        days={days}
        isAdmin={isAdmin}
        isAllMonthLocked={isAllMonthLocked}
        calculateDailyCount={calculateDailyCount}
        isWeekend={isWeekend}
        onPendingAction={onPendingAction}
      />
      <TableBody>
        {staffIds.map((staffId) => {
          const staffData = shiftDataMap.get(staffId);
          const staffName = staffMap.get(staffId) || staffId;

          if (!staffData) return null;

          return (
            <StaffTableRow
              key={staffId}
              staffId={staffId}
              staffName={staffName}
              staffData={staffData}
              days={days}
              isAdmin={isAdmin}
              currentUserId={currentUserId}
              isCellBeingEdited={isCellBeingEdited}
              getCellEditor={getCellEditor}
              focusedCell={focusedCell}
              isCellSelected={isCellSelected}
              onCellClick={onCellClick}
              onCellRegisterRef={onCellRegisterRef}
              onCellMouseDown={onCellMouseDown}
              onCellMouseEnter={onCellMouseEnter}
              onCellContextMenu={onCellContextMenu}
              ShiftCellComponent={ShiftCellComponent}
              onRequestPendingAction={onPendingAction}
            />
          );
        })}

        <ShiftRemarksRow days={days} getEventsForDay={getEventsForDay} />
      </TableBody>
    </Table>
  </TableContainer>
);
