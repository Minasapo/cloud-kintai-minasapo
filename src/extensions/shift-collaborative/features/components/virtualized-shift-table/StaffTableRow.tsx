import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import {
  alpha,
  Box,
  TableCell,
  TableRow,
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
        backgroundColor: isCurrentUser ? alpha("rgb(33 150 243)", 0.1) : "transparent",
        "&:hover": {
          backgroundColor: isCurrentUser ? alpha("rgb(33 150 243)", 0.15) : undefined,
        },
      }}
    >
      <TableCell
        sx={{
          position: "sticky",
          left: 0,
          zIndex: 2,
          bgcolor: isCurrentUser ? alpha("rgb(33 150 243)", 0.1) : "background.paper",
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

export default StaffTableRow;