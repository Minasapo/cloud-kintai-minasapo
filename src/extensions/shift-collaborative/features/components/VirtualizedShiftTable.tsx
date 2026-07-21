import { Typography } from "@mui/material";
import AppButton from "@shared/ui/button/AppButton";
import AppDialog from "@shared/ui/feedback/AppDialog";
import dayjs from "dayjs";
import { memo } from "react";

import { useVirtualizedShiftTableState } from "../hooks/useVirtualizedShiftTableState";
import {
  type CollaborativeUser,
  type ShiftCellEditLockOwner,
  type ShiftState,
} from "../types/collaborative.types";
import { VirtualizedShiftTableTable } from "./virtualized-shift-table/VirtualizedShiftTableTable";

interface VirtualizedShiftTableProps {
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
  staffs: Array<{
    id: string;
    familyName?: string | null;
    givenName?: string | null;
  }>;
  isCellBeingEdited: (staffId: string, date: string) => boolean;
  getCellEditor: (
    staffId: string,
    date: string,
  ) => CollaborativeUser | undefined;
  focusedCell: { staffId: string; date: string } | null;
  isCellSelected: (staffId: string, date: string) => boolean;
  onCellClick: (staffId: string, date: string, event: React.MouseEvent) => void;
  onCellRegisterRef: (
    staffId: string,
    date: string,
    element: HTMLElement | null,
  ) => void;
  onCellMouseDown: (
    staffId: string,
    date: string,
    event: React.MouseEvent,
  ) => void;
  onCellMouseEnter: (staffId: string, date: string) => void;
  onCellContextMenu?: (
    staffId: string,
    date: string,
    event: React.MouseEvent,
  ) => void;
  isLoading?: boolean;
  getEventsForDay: (day: dayjs.Dayjs) => Array<{
    label: string;
    start: dayjs.Dayjs;
    end?: dayjs.Dayjs;
    color: string;
  }>;
  ShiftCellComponent: React.ComponentType<{
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
  }>;
  isWeekend: (day: dayjs.Dayjs) => boolean;
  calculateDailyCount: (day: dayjs.Dayjs) => {
    work: number;
    fixedOff: number;
    requestedOff: number;
    plannedCapacity: number;
  };
  currentUserId?: string;
  isAdmin?: boolean;
  onLockStaffRow?: (staffId: string) => void;
  onLockMonth?: () => void;
  currentMonth?: string;
}

/* eslint-disable react/prop-types */

/**
 * 仮想スクロール対応シフトテーブルコンポーネント
 * 大量のスタッフ（100名以上）をスムーズに表示
 * TypeScriptの型定義で十分に型安全なため、PropTypesは省略
 */
export const VirtualizedShiftTable = memo<VirtualizedShiftTableProps>(
  ({
    days,
    staffIds,
    shiftDataMap,
    staffs,
    isCellBeingEdited,
    getCellEditor,
    focusedCell,
    isCellSelected,
    onCellClick,
    onCellRegisterRef,
    onCellMouseDown,
    onCellMouseEnter,
    onCellContextMenu,
    isLoading,
    getEventsForDay,
    ShiftCellComponent,
    isWeekend,
    calculateDailyCount,
    currentUserId,
    isAdmin,
    onLockStaffRow,
    onLockMonth,
    currentMonth,
  }) => {
    const {
      staffMap,
      setPendingAction,
      confirmDialogProps,
      handleConfirm,
      isAllMonthLocked,
    } = useVirtualizedShiftTableState({
      staffs,
      staffIds,
      shiftDataMap,
      currentMonth,
      onLockStaffRow,
      onLockMonth,
    });

    if (isLoading) {
      return <Typography>読み込み中...</Typography>;
    }

    return (
      <>
        <VirtualizedShiftTableTable
          days={days}
          staffIds={staffIds}
          shiftDataMap={shiftDataMap}
          staffMap={staffMap}
          isCellBeingEdited={isCellBeingEdited}
          getCellEditor={getCellEditor}
          focusedCell={focusedCell}
          isCellSelected={isCellSelected}
          onCellClick={onCellClick}
          onCellRegisterRef={onCellRegisterRef}
          onCellMouseDown={onCellMouseDown}
          onCellMouseEnter={onCellMouseEnter}
          onCellContextMenu={onCellContextMenu}
          getEventsForDay={getEventsForDay}
          ShiftCellComponent={ShiftCellComponent}
          isWeekend={isWeekend}
          calculateDailyCount={calculateDailyCount}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          isAllMonthLocked={isAllMonthLocked}
          onPendingAction={setPendingAction}
        />

        {confirmDialogProps && (
          <AppDialog
            open
            onClose={() => setPendingAction(null)}
            title={confirmDialogProps.title}
            description={confirmDialogProps.message}
            maxWidth="xs"
            actions={
              <>
                <AppButton
                  variant="outline"
                  tone="neutral"
                  onClick={() => setPendingAction(null)}
                >
                  キャンセル
                </AppButton>
                <AppButton
                  variant="solid"
                  tone="primary"
                  onClick={handleConfirm}
                >
                  {confirmDialogProps.confirmLabel}
                </AppButton>
              </>
            }
          />
        )}
      </>
    );
  },
);

VirtualizedShiftTable.displayName = "VirtualizedShiftTable";

/* eslint-enable react/prop-types */
