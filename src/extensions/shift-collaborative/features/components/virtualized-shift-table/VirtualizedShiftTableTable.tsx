import {
  Paper,
  Table,
  TableBody,
  TableContainer,
} from "@mui/material";
import dayjs from "dayjs";
import React from "react";

import { PendingLockAction } from "../../hooks/useVirtualizedShiftTableState";
import {
  CollaborativeUser,
  ShiftCellEditLockOwner,
  ShiftState,
} from "../../types/collaborative.types";
import ShiftRemarksRow from "./ShiftRemarksRow";
import ShiftTableHeader from "./ShiftTableHeader";
import StaffTableRow from "./StaffTableRow";

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
      bgcolor: "rgb(255 255 255)",
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
          bgcolor: "rgb(248 250 252)",
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