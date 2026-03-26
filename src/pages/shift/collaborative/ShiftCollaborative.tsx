import { useStaffs } from "@entities/staff/model/useStaffs/useStaffs";
import Page from "@shared/ui/page/Page";
import dayjs from "dayjs";
import {
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { AuthContext } from "@/context/AuthContext";

import { BatchEditToolbar } from "../../../features/shift/collaborative/components/BatchEditToolbar";
import { ChangeHistoryPanel } from "../../../features/shift/collaborative/components/ChangeHistoryPanel";
import { CollaborativeHeader } from "../../../features/shift/collaborative/components/CollaborativeHeader";
import { ConflictResolutionDialog } from "../../../features/shift/collaborative/components/ConflictResolutionDialog";
import { KeyboardShortcutsHelp } from "../../../features/shift/collaborative/components/KeyboardShortcutsHelp";
import {
  PresenceNotificationContainer,
  usePresenceNotifications,
} from "../../../features/shift/collaborative/components/PresenceNotification";
import { PrintShiftDialog } from "../../../features/shift/collaborative/components/PrintShiftDialog";
import { ProgressPanel } from "../../../features/shift/collaborative/components/ProgressPanel";
import { ShiftCell, type ShiftCellProps } from "../../../features/shift/collaborative/components/ShiftCell";
import { ShiftSuggestionsPanel } from "../../../features/shift/collaborative/components/ShiftSuggestionsPanel";
import { SyncPanel } from "../../../features/shift/collaborative/components/SyncPanel";
import { InfoBadge } from "../../../features/shift/collaborative/components/ui/Badges";
import { InlineAlert } from "../../../features/shift/collaborative/components/ui/InlineAlert";
import { PageLoadingBar } from "../../../features/shift/collaborative/components/ui/PageLoadingBar";
import { UndoRedoToolbar } from "../../../features/shift/collaborative/components/UndoRedoToolbar";
import { VirtualizedShiftTable } from "../../../features/shift/collaborative/components/VirtualizedShiftTable";
import { useCollaborativePageState } from "../../../features/shift/collaborative/hooks/useCollaborativePageState";
import { useKeyboardShortcuts } from "../../../features/shift/collaborative/hooks/useKeyboardShortcuts";
import { usePrintShift } from "../../../features/shift/collaborative/hooks/usePrintShift";
import { CollaborativeShiftProvider } from "../../../features/shift/collaborative/providers/CollaborativeShiftProvider";
import type { DataSyncStatus } from "../../../features/shift/collaborative/types/collaborative.types";

const isWeekend = (day: dayjs.Dayjs): boolean =>
  day.day() === 0 || day.day() === 6;

interface ShiftCollaborativePageInnerProps {
  staffs: ReturnType<typeof useStaffs>["staffs"];
  targetMonth: string;
}

const ShiftCollaborativePageInner = memo<ShiftCollaborativePageInnerProps>(
  ({ staffs, targetMonth }: ShiftCollaborativePageInnerProps) => {
    const { cognitoUser } = useContext(AuthContext);
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
      hasClipboard,
      handleCopy,
      handlePaste,
      clearSelection,
      handleChangeState,
      handleLockCells,
      handleUnlockCells,
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
      canUndo,
      canRedo,
      undo,
      redo,
      getLastUndo,
      getLastRedo,
      undoHistory,
      redoHistory,
      isBatchUpdating,
      addComment,
      getCommentsByCell,
      getAllCellHistory,
      handleEscape,
      handleSelectAll,
      navigate,
    } = useCollaborativePageState(targetMonth);

    const currentUserId = useMemo(() => {
      if (!cognitoUser?.id) return "";
      const currentStaff = staffs.find(
        (staff) => staff.cognitoUserId === cognitoUser.id,
      );
      return currentStaff?.id ?? "";
    }, [cognitoUser, staffs]);

    const { notifications, addNotification, dismissNotification } =
      usePresenceNotifications();

    const { isPrintDialogOpen, openPrintDialog, closePrintDialog } =
      usePrintShift();

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

    useEffect(() => {
      if (!state.lastRemoteUpdate) return;
      const staffName =
        staffNameMap.get(state.lastRemoteUpdate.staffId) ??
        state.lastRemoteUpdate.staffId;
      addNotification("data-synced", "", { staffName, date: "" });
    }, [state.lastRemoteUpdate, staffNameMap, addNotification]);

    const [conflictDialogOpen, setConflictDialogOpen] = useState(false);

    const [cellHistoryDrawerOpen, setCellHistoryDrawerOpen] =
      useState<boolean>(false);
    const [cellHistoryFocusKey, setCellHistoryFocusKey] = useState<string>("");
    const [cellHistoryFocusToken, setCellHistoryFocusToken] =
      useState<number>(0);
    const [suggestionsDrawerOpen, setSuggestionsDrawerOpen] =
      useState<boolean>(false);

    const handleCellContextMenu = useCallback(
      (staffId: string, date: string, event: React.MouseEvent) => {
        event.preventDefault();
        const cellKey = `${staffId}#${date}`;
        setCellHistoryFocusKey(cellKey);
        setCellHistoryFocusToken(Date.now());
        setCellHistoryDrawerOpen(true);
      },
      [],
    );

    const handleCloseCellHistory = useCallback(() => {
      setCellHistoryDrawerOpen(false);
    }, []);

    const handleShowCellHistory = useCallback((cellKey: string) => {
      setCellHistoryFocusKey(cellKey);
      setCellHistoryFocusToken(Date.now());
      setCellHistoryDrawerOpen(true);
    }, []);

    const suggestionsBadgeCount = useMemo(
      () =>
        violations.filter(
          (violation) =>
            violation.severity === "error" || violation.severity === "warning",
        ).length,
      [violations],
    );

    const handleAddCommentsToSelectedCells = useCallback(
      async (content: string) => {
        const cellCount = Math.min(selectionCount, 10);
        let addedCount = 0;

        const staffIds = Array.from(state.shiftDataMap.keys());
        for (const staffId of staffIds) {
          if (addedCount >= cellCount) break;

          const staffData = state.shiftDataMap.get(staffId);
          if (!staffData) continue;

          for (const dateKey of staffData.keys()) {
            if (addedCount >= cellCount) break;

            if (isCellSelected(staffId, dateKey)) {
              try {
                const cellKey = `${staffId}#${dateKey}`;
                await addComment(cellKey, content, []);
                addedCount++;
              } catch (error) {
                console.error("Failed to add comment:", error);
              }
            }
          }
        }
      },
      [state.shiftDataMap, isCellSelected, addComment, selectionCount],
    );

    const ShiftCellWithComments = useMemo(() => {
      const ShiftCellWithCommentsComponent = ({
        staffId,
        date,
        ...restProps
      }: ShiftCellProps) => {
        return <ShiftCell {...restProps} staffId={staffId} date={date} />;
      };
      Object.defineProperty(ShiftCellWithCommentsComponent, "displayName", {
        value: "ShiftCellWithComments",
      });
      return ShiftCellWithCommentsComponent;
    }, []) as React.FC<ShiftCellProps>;

    const formattedLastSyncedAt =
      state.lastAutoSyncedAt > 0
        ? dayjs(state.lastAutoSyncedAt).format("YYYY/MM/DD HH:mm:ss")
        : "未同期";

    const dataSyncStatusConfigLabel: Record<DataSyncStatus, string> = {
      idle: "未同期",
      saving: "保存中",
      syncing: "同期中",
      saved: "保存完了",
      synced: "同期完了",
      error: "エラー",
    };

    const syncStatusLabel = dataSyncStatusConfigLabel[state.dataStatus];

    const syncButtonColor: "default" | "primary" | "success" | "error" =
      state.dataStatus === "error"
        ? "error"
        : state.dataStatus === "synced" || state.dataStatus === "saved"
          ? "success"
          : state.dataStatus === "syncing"
            ? "primary"
            : "default";

    const syncTooltipTitle = (
      <div className="text-xs leading-5">
        <div>同期状態: {syncStatusLabel}</div>
        <div>最後に自動同期された日時: {formattedLastSyncedAt}</div>
        <div>{state.isSyncing ? "同期中です" : "最新状態を取得"}</div>
      </div>
    );

    useKeyboardShortcuts({
      enabled: true,
      onNavigate: navigate,
      onChangeState: handleChangeState,
      onSelectAll: handleSelectAll,
      onShowHelp: () => setShowHelp(true),
      onEscape: handleEscape,
      onCopy: handleCopy,
      onPaste: handlePaste,
      onUndo: undo,
      onRedo: redo,
    });

    return (
      <Page title="シフト調整(共同)" maxWidth={false} showDefaultHeader={false}>
        <div
          className="mx-auto w-full max-w-[1360px] px-1.5 py-1 sm:px-2.5"
          onMouseUp={handleMouseUp}
        >
          <CollaborativeHeader
            currentMonth={currentMonth}
            activeUsers={state.activeUsers}
            editingCells={state.editingCells}
          />

          <UndoRedoToolbar
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={undo}
            onRedo={redo}
            lastUndoDescription={getLastUndo()?.description}
            lastRedoDescription={getLastRedo()?.description}
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
            onCellContextMenu={handleCellContextMenu}
            calculateDailyCount={(day) => calculateDailyCount(day.format("DD"))}
            getEventsForDay={getEventsForDay}
            ShiftCellComponent={ShiftCellWithComments}
            isWeekend={isWeekend}
            currentUserId={currentUserId}
          />

          <BatchEditToolbar
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
            onCopy={handleCopy}
            onPaste={handlePaste}
            onClear={clearSelection}
            onChangeState={handleChangeState}
            onLock={handleLockCells}
            onUnlock={handleUnlockCells}
            onAddComments={handleAddCommentsToSelectedCells}
            onShowCellHistory={(cellKey) => handleShowCellHistory(cellKey)}
            canUnlock={isAdmin}
            showLock={hasUnlocked}
            showUnlock={hasLocked}
            hasClipboard={hasClipboard}
            canPaste={focusedCell !== null}
            isUpdating={isBatchUpdating}
          />

          <ConflictResolutionDialog
            open={conflictDialogOpen}
            conflicts={[]}
            onResolve={async () => {}}
            onClose={() => setConflictDialogOpen(false)}
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

          <PresenceNotificationContainer
            notifications={notifications}
            onDismiss={dismissNotification}
          />
        </div>

        <ChangeHistoryPanel
          undoHistory={undoHistory}
          redoHistory={redoHistory}
          cellHistory={getAllCellHistory()}
          staffNameMap={staffNameMap}
          open={cellHistoryDrawerOpen}
          onClose={handleCloseCellHistory}
          initialCellKey={cellHistoryFocusKey || undefined}
          focusCellKey={
            cellHistoryFocusKey
              ? `${cellHistoryFocusKey}@${cellHistoryFocusToken}`
              : undefined
          }
          showOperationTab={false}
        />

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

export default function ShiftCollaborativePage() {
  const { authStatus, cognitoUser } = useContext(AuthContext);
  const isAuthenticated = authStatus === "authenticated";
  const { staffs, loading: staffsLoading } = useStaffs({ isAuthenticated });

  const targetMonth = dayjs().format("YYYY-MM");

  const currentUserId = useMemo(() => {
    if (!cognitoUser?.id) return "";
    const currentStaff = staffs.find(
      (staff) => staff.cognitoUserId === cognitoUser.id,
    );
    return currentStaff?.id ?? "";
  }, [cognitoUser, staffs]);

  const currentUserName = useMemo(() => {
    if (!cognitoUser?.id) return "Current User";
    const currentStaff = staffs.find(
      (staff) => staff.cognitoUserId === cognitoUser.id,
    );
    return currentStaff
      ? `${currentStaff.familyName || ""}${currentStaff.givenName || ""}`
      : "Current User";
  }, [cognitoUser, staffs]);

  const staffIds = useMemo(
    () =>
      staffs
        .filter(
          (staff) =>
            staff.enabled &&
            (staff as unknown as Record<string, unknown>).workType === "shift",
        )
        .map((staff) => staff.id),
    [staffs],
  );

  const shiftRequestId = staffIds[0] ?? "";

  if (staffsLoading) {
    return <PageLoadingBar />;
  }

  if (staffIds.length === 0) {
    return (
      <Page title="シフト調整(共同)" maxWidth={false} showDefaultHeader={false}>
        <div className="mx-auto w-full max-w-[1360px] px-1.5 py-1 sm:px-2.5">
          <div className="rounded-[28px] border border-emerald-500/15 bg-[linear-gradient(135deg,rgba(247,252,248,0.98)_0%,rgba(236,253,245,0.92)_58%,rgba(255,255,255,0.98)_100%)] p-4 shadow-[0_28px_60px_-42px_rgba(15,23,42,0.35)] md:p-5">
            <InlineAlert tone="info" icon={<InfoBadge />}>
              スタッフデータが見つかりません
            </InlineAlert>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <CollaborativeShiftProvider
      staffIds={staffIds}
      targetMonth={targetMonth}
      currentUserId={currentUserId}
      currentUserName={currentUserName}
      shiftRequestId={shiftRequestId}
    >
      <ShiftCollaborativePageInner staffs={staffs} targetMonth={targetMonth} />
    </CollaborativeShiftProvider>
  );
}
