import { AuthContext } from "@app/providers/auth/AuthContext";
import { useStaffs } from "@entities/staff/model/useStaffs/useStaffs";
import { PageContent } from "@shared/ui/layout";
import Page from "@shared/ui/page/Page";
import { memo, useContext, useState } from "react";

import AdminShiftSettingsDialog from "@/features/admin-config-shift/AdminShiftSettingsDialog";

import { useCollaborativePageState } from "../hooks/useCollaborativePageState";
import { useShiftPageDerivedState } from "../hooks/useShiftPageDerivedState";
import { isWeekend } from "../lib/shiftPageHelpers";
import { CollaborativeHeader } from "./CollaborativeHeader";
import { KeyboardShortcutsHelp } from "./KeyboardShortcutsHelp";
import { PrintShiftDialog } from "./PrintShiftDialog";
import { ProgressPanel } from "./ProgressPanel";
import { ShiftCell, type ShiftCellProps } from "./ShiftCell";
import { ShiftCellPanel } from "./ShiftCellPanel";
import { ShiftConnectionAlerts } from "./ShiftConnectionAlerts";
import { ShiftSuggestionsPanel } from "./ShiftSuggestionsPanel";
import { SyncPanel } from "./SyncPanel";
import { UndoRedoToolbar } from "./UndoRedoToolbar";
import { VirtualizedShiftTable } from "./VirtualizedShiftTable";

const ShiftCellWithComments = ({
  staffId,
  date,
  ...restProps
}: ShiftCellProps) => {
  return <ShiftCell {...restProps} staffId={staffId} date={date} />;
};

interface ShiftCollaborativePageInnerProps {
  staffs: ReturnType<typeof useStaffs>["staffs"];
  staffNameMap: Map<string, string>;
  targetMonth: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export const ShiftCollaborativePageInner =
  memo<ShiftCollaborativePageInnerProps>(
    ({
      staffs,
      staffNameMap,
      targetMonth,
      onPrevMonth,
      onNextMonth,
    }: ShiftCollaborativePageInnerProps) => {
      const { cognitoUser } = useContext(AuthContext);
      const pageState = useCollaborativePageState(targetMonth);
      const {
        state,
        isCellBeingEdited,
        getCellEditor,
        focusedCell,
        isCellSelected,
        registerCell,
        handleCellClick,
        handleCellMouseDown,
        handleCellMouseEnter,
        handleMouseUp,
        handleSync: _handleSync,
        clearSyncError: _clearSyncError,
        progress,
        calculateDailyCount,
        getEventsForDay,
        selectedCells,
        selectionCount,
        hasLocked,
        hasUnlocked,
        clearSelection,
        handleChangeState,
        handleLockCells,
        handleUnlockCells,
        handleLockStaffRow,
        handleUnlockStaffRow,
        handleLockMonth,
        handleUnlockMonth,
        handleApplySuggestion,
        violations,
        isAnalyzing,
        analyzeShifts,
        showHelp,
        setShowHelp,
        isAdmin,
        currentMonth,
        days,
        staffIds,
        isBatchUpdating,
        getCommentsByCell,
        hasEditLockForSelected,
        isOthersEditingSelected,
        editLockError,
        clearEditLockError,
        handleAcquireEditLock,
        handleReleaseEditLock,
        handleForceReleaseLock,
      } = pageState;

      const [suggestionsDrawerOpen, setSuggestionsDrawerOpen] =
        useState<boolean>(false);
      const [isSettingsOpen, setIsSettingsOpen] = useState(false);

      const {
        currentUserId,
        isPrintDialogOpen,
        openPrintDialog,
        closePrintDialog,
        cellEditLockHolders,
        cellHistory,
        suggestionsBadgeCount,
        syncButtonColor,
        syncTooltipTitle,
        handleAddCommentsToSelectedCells,
        dialog,
      } = useShiftPageDerivedState(
        pageState,
        cognitoUser,
        staffs,
        staffNameMap,
        setShowHelp,
      );

      return (
        <Page title="シフト調整(共同)" width="full" showDefaultHeader={false}>
          {dialog}
          <PageContent
            width="full"
            className="px-1.5 py-1 sm:px-2.5"
            onMouseUp={handleMouseUp}
          >
            <CollaborativeHeader
              currentMonth={currentMonth}
              activeUsers={state.activeUsers}
              editingCells={state.editingCells}
              onPrevMonth={onPrevMonth}
              onNextMonth={onNextMonth}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />

            <UndoRedoToolbar
              onShowHelp={() => setShowHelp(true)}
              onPrint={openPrintDialog}
              onSync={() => {
                void _handleSync();
              }}
              syncTooltip={syncTooltipTitle}
              syncColor={syncButtonColor}
              isSyncing={state.isSyncing}
              onShowSuggestions={() => setSuggestionsDrawerOpen(true)}
              suggestionsBadgeCount={suggestionsBadgeCount}
            />

            <SyncPanel syncError={state.error} onClearError={_clearSyncError} />

            <ShiftConnectionAlerts
              isOnline={state.isOnline}
              connectionState={state.connectionState}
              editLockError={editLockError}
              clearEditLockError={clearEditLockError}
            />

            <ProgressPanel progress={progress} totalDays={days.length} />

            <VirtualizedShiftTable
              days={days}
              staffIds={staffIds}
              shiftDataMap={state.shiftDataMap}
              isLoading={state.isLoading}
              staffs={staffs.map((staff) => ({
                id: staff.id,
                familyName: staff.familyName ?? undefined,
                givenName: staff.givenName ?? undefined,
              }))}
              focusedCell={focusedCell}
              isCellSelected={isCellSelected}
              isCellBeingEdited={isCellBeingEdited}
              getCellEditor={getCellEditor}
              onCellClick={handleCellClick}
              onCellRegisterRef={registerCell}
              onCellMouseDown={handleCellMouseDown}
              onCellMouseEnter={handleCellMouseEnter}
              calculateDailyCount={(day) =>
                calculateDailyCount(day.format("DD"))
              }
              getEventsForDay={getEventsForDay}
              ShiftCellComponent={ShiftCellWithComments}
              isWeekend={isWeekend}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              onLockStaffRow={handleLockStaffRow}
              onUnlockStaffRow={handleUnlockStaffRow}
              onLockMonth={handleLockMonth}
              onUnlockMonth={handleUnlockMonth}
              currentMonth={currentMonth.format("YYYY年M月")}
            />

            <ShiftCellPanel
              selectionCount={selectionCount}
              selectedCells={
                selectionCount > 0
                  ? selectedCells
                  : focusedCell
                    ? [{ staffId: focusedCell.staffId, date: focusedCell.date }]
                    : []
              }
              comments={
                focusedCell
                  ? getCommentsByCell(
                      `${focusedCell.staffId}#${focusedCell.date}`,
                    )
                  : []
              }
              cellHistory={cellHistory}
              onClear={clearSelection}
              onChangeState={handleChangeState}
              onLock={handleLockCells}
              onUnlock={handleUnlockCells}
              onAddComments={handleAddCommentsToSelectedCells}
              canUnlock={isAdmin}
              showLock={hasUnlocked && isAdmin}
              showUnlock={hasLocked}
              isUpdating={isBatchUpdating}
              cellEditLockHolders={cellEditLockHolders}
              hasEditLockForSelected={hasEditLockForSelected}
              isOthersEditingSelected={isOthersEditingSelected}
              onAcquireEditLock={handleAcquireEditLock}
              onReleaseEditLock={handleReleaseEditLock}
              onForceReleaseLock={handleForceReleaseLock}
            />

            <KeyboardShortcutsHelp
              open={showHelp}
              onClose={() => setShowHelp(false)}
            />

            <PrintShiftDialog
              open={isPrintDialogOpen}
              onClose={closePrintDialog}
              days={days}
              staffs={staffs
                .filter(
                  (staff) =>
                    staff.enabled &&
                    (staff as unknown as Record<string, unknown>).workType ===
                      "shift",
                )
                .map((staff) => ({
                  id: staff.id,
                  familyName: staff.familyName ?? undefined,
                  givenName: staff.givenName ?? undefined,
                }))}
              shiftDataMap={state.shiftDataMap}
              targetMonth={targetMonth}
            />

            <AdminShiftSettingsDialog
              open={isSettingsOpen}
              onClose={() => setIsSettingsOpen(false)}
            />
          </PageContent>

          <ShiftSuggestionsPanel
            open={suggestionsDrawerOpen}
            onClose={() => setSuggestionsDrawerOpen(false)}
            violations={violations}
            isAnalyzing={isAnalyzing}
            onApplyAction={handleApplySuggestion}
            onRefresh={analyzeShifts}
          />
        </Page>
      );
    },
  );

ShiftCollaborativePageInner.displayName = "ShiftCollaborativePageInner";
