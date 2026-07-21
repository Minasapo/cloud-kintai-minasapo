import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import {
  Box,
  Divider,
  Stack,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { AppButton } from "@shared/ui/button";
import AppDialog from "@shared/ui/feedback/AppDialog";
import dayjs from "dayjs";
import { memo, MouseEvent, useEffect, useMemo, useState } from "react";

import { useShiftCellPanelState } from "../hooks/useShiftCellPanelState";
import {
  buildShiftLockChangedSystemMessage,
  CHAT_SYSTEM_MESSAGE_PREFIX,
} from "../lib/chatSystemMessages";
import {
  CellComment,
  Mention,
  ShiftDataMap,
  ShiftState,
} from "../types/collaborative.types";
import {
  CellAcquireEditLockSection,
  CellCommentsSection,
  CellStateButtons,
} from "./shift-cell-panel/ShiftCellPanelSections";
import { StaffMonthlyBand } from "./shift-cell-panel/StaffMonthlyBand";
import { InfoBadge } from "./ui/Badges";
import { InlineAlert } from "./ui/InlineAlert";

interface ShiftCellPanelProps {
  currentUserId: string;
  currentUserName: string;
  selectionCount: number;
  selectedCells?: Array<{ staffId: string; date: string }>;
  comments?: CellComment[];
  onClear: () => void;
  onChangeState: (state: ShiftState) => void;
  onLock: () => Promise<boolean>;
  onAddComments?: (content: string, mentions: Mention[]) => Promise<void>;
  canUnlock: boolean;
  showLock: boolean;
  isUpdating?: boolean;
  hasEditLock?: (staffId: string, date: string) => boolean;
  isCellBeingEdited?: (staffId: string, date: string) => boolean;
  hasEditLockForSelected: boolean;
  isOthersEditingSelected: boolean;
  editLockError: string | null;
  onClearEditLockError: () => void;
  onAcquireEditLock: () => Promise<boolean>;
  onReleaseEditLock: () => Promise<boolean>;
  onForceReleaseLock: () => void;
  /** 月次帯表示用 */
  shiftDataMap?: ShiftDataMap;
  days?: dayjs.Dayjs[];
  staffNameMap?: Map<string, string>;
  onDateCellClick?: (
    staffId: string,
    date: string,
    event: MouseEvent<HTMLButtonElement>,
  ) => void;
}

const ShiftCellPanelBase = ({
  currentUserId,
  currentUserName,
  selectionCount,
  selectedCells = [],
  comments = [],
  onClear,
  onChangeState,
  onLock,
  onAddComments,
  canUnlock,
  showLock,
  isUpdating = false,
  hasEditLock,
  isCellBeingEdited,
  hasEditLockForSelected,
  isOthersEditingSelected,
  editLockError,
  onClearEditLockError,
  onAcquireEditLock,
  onReleaseEditLock,
  onForceReleaseLock,
  shiftDataMap,
  days,
  staffNameMap,
  onDateCellClick,
}: ShiftCellPanelProps) => {
  const showCommentsPanel = Boolean(onAddComments) && selectedCells.length > 0;
  const [isLockActionPending, setIsLockActionPending] = useState(false);
  const [activeStepOverride, setActiveStepOverride] = useState<number | null>(
    null,
  );
  const [isLockConfirmed, setIsLockConfirmed] = useState(false);
  const isBusy = isUpdating || isLockActionPending;

  const { commentText, isAddingComment, setCommentText, handleAddComment } =
    useShiftCellPanelState({
      onAddComments,
    });

  const runLockAction = async (
    stepIndex: number,
    action: () => Promise<void>,
  ) => {
    setActiveStepOverride(stepIndex);
    setIsLockActionPending(true);
    try {
      await action();
    } finally {
      setIsLockActionPending(false);
      setActiveStepOverride(null);
    }
  };

  /** 選択セルに含まれる一意スタッフIDリスト（選択順を保持） */
  const selectedStaffIds = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const cell of selectedCells) {
      if (!seen.has(cell.staffId)) {
        seen.add(cell.staffId);
        result.push(cell.staffId);
      }
    }
    return result;
  }, [selectedCells]);

  /** 選択セルの日付セット */
  const selectedDates = useMemo(
    () => new Set(selectedCells.map((c) => c.date)),
    [selectedCells],
  );

  const showMonthlyBand =
    shiftDataMap != null &&
    days != null &&
    days.length > 0 &&
    selectedStaffIds.length > 0 &&
    staffNameMap != null;

  const selectedCurrentState = useMemo<ShiftState | null>(() => {
    if (!shiftDataMap || selectedCells.length === 0) {
      return null;
    }

    const states = selectedCells
      .map((cell) => shiftDataMap.get(cell.staffId)?.get(cell.date)?.state)
      .filter((state): state is ShiftState => state != null);

    if (states.length !== selectedCells.length) {
      return null;
    }

    const firstState = states[0];
    return states.every((state) => state === firstState) ? firstState : null;
  }, [selectedCells, shiftDataMap]);

  const isShiftConfirmed = useMemo(() => {
    if (!shiftDataMap || selectedCells.length === 0) {
      return false;
    }

    const lockStates = selectedCells
      .map((cell) => shiftDataMap.get(cell.staffId)?.get(cell.date)?.isLocked)
      .filter((isLocked): isLocked is boolean => isLocked != null);

    if (lockStates.length !== selectedCells.length) {
      return false;
    }

    return lockStates.every((isLocked) => isLocked);
  }, [selectedCells, shiftDataMap]);

  const hasCompletedStateSelection =
    selectedCurrentState != null && selectedCurrentState !== "empty";

  const selectedCellKeys = useMemo(
    () => selectedCells.map((cell) => `${cell.staffId}#${cell.date}`).join("|"),
    [selectedCells],
  );

  const isFlowUnlockedByEditLock = hasEditLockForSelected || isLockConfirmed;

  const currentFlowStep =
    activeStepOverride ??
    (!isFlowUnlockedByEditLock
      ? 0
      : isLockConfirmed || isShiftConfirmed
        ? 3
        : hasCompletedStateSelection
          ? 2
          : 1);

  useEffect(() => {
    if (selectionCount === 0) {
      setIsLockConfirmed(false);
      setActiveStepOverride(null);
    }
  }, [selectionCount]);

  useEffect(() => {
    setIsLockConfirmed(false);
    setActiveStepOverride(null);
  }, [selectedCellKeys]);

  const handleAcquireEditLock = async () => {
    await runLockAction(0, async () => {
      const acquired = await onAcquireEditLock();
      if (!acquired) {
        return;
      }

      if (!onAddComments) {
        return;
      }

      await onAddComments(
        `${CHAT_SYSTEM_MESSAGE_PREFIX}${currentUserName}が編集ロックを取得しました`,
        [],
      );
    });
  };

  const handleForceReleaseLock = async () => {
    await runLockAction(2, async () => {
      await onForceReleaseLock();
    });
  };

  const handleClose = async () => {
    if (hasEditLockForSelected) {
      await runLockAction(2, async () => {
        const released = await onReleaseEditLock();
        if (!released) {
          return;
        }

        if (onAddComments) {
          await onAddComments(
            `${CHAT_SYSTEM_MESSAGE_PREFIX}${currentUserName}が編集ロックを解除しました`,
            [],
          );
        }
      });
    }
    onClear();
  };

  const handleLockCells = async () => {
    await runLockAction(3, async () => {
      const locked = await onLock();
      if (!locked) {
        return;
      }

      setIsLockConfirmed(true);

      if (!onAddComments) {
        return;
      }

      await onAddComments(
        buildShiftLockChangedSystemMessage(currentUserName, true),
        [],
      );
    });
  };

  if (selectionCount === 0) return null;

  const isForceReleaseLoading = isBusy && canUnlock;
  const closeButtonLabel = hasEditLockForSelected
    ? "ロックを解除して閉じる"
    : "閉じる";

  return (
    <AppDialog
      open={selectionCount > 0}
      onClose={onClear}
      maxWidth="lg"
      fullWidth
      loading={isBusy}
      PaperSx={{
        height: { xs: "min(92vh, 920px)", md: "min(90vh, 920px)" },
        display: "flex",
        "& .MuiDialogContent-root": {
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        },
      }}
      title={
        <Stack direction="row" spacing={1} alignItems="center">
          <CheckIcon color="primary" />
          <Typography variant="subtitle1" fontWeight={600} component="span">
            {selectionCount}セル選択中
          </Typography>
        </Stack>
      }
      actions={
        <Stack direction="row" spacing={1}>
          {canUnlock && (
            <AppButton
              variant="ghost"
              tone="danger"
              size="sm"
              onClick={() => {
                void handleForceReleaseLock();
              }}
              startIcon={<LockOpenIcon />}
              disabled={isBusy}
              loading={isForceReleaseLoading}
            >
              {isForceReleaseLoading ? "処理中..." : "編集ロックを強制解除"}
            </AppButton>
          )}
          <AppButton
            variant="ghost"
            tone="neutral"
            size="sm"
            onClick={handleClose}
            startIcon={<CloseIcon />}
            disabled={isBusy}
          >
            {closeButtonLabel}
          </AppButton>
        </Stack>
      }
    >
      <Stack spacing={2} sx={{ height: "100%", minHeight: 0 }}>
        {/* 月次帯ビュー：選択スタッフの1ヶ月分を横スクロールで表示 */}
        {showMonthlyBand && (
          <>
            <StaffMonthlyBand
              staffIds={selectedStaffIds}
              staffNameMap={staffNameMap!}
              days={days!}
              shiftDataMap={shiftDataMap!}
              selectedDates={selectedDates}
              hasEditLock={hasEditLock}
              isCellBeingEdited={isCellBeingEdited}
              onDayClick={onDateCellClick}
            />
            <Divider />
          </>
        )}

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems="stretch"
          sx={{ flex: 1, minHeight: 0, overflow: "hidden" }}
        >
          <Stack spacing={2} sx={{ flex: 1, minWidth: 0, minHeight: 0 }}>
            {editLockError && (
              <InlineAlert
                tone="warning"
                icon={<InfoBadge />}
                onClose={onClearEditLockError}
              >
                {editLockError}
              </InlineAlert>
            )}

            <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", pr: 1 }}>
              <Stepper
                orientation="vertical"
                activeStep={currentFlowStep}
                sx={{
                  "& .MuiStepLabel-label": {
                    fontFamily: "var(--ds-typography-font-family)",
                    fontWeight: 600,
                  },
                  "& .MuiStepContent-root": {
                    borderLeftColor: "divider",
                    pb: 2,
                  },
                }}
              >
                <Step expanded>
                  <StepLabel>編集ロック取得</StepLabel>
                  <StepContent>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      まず編集ロックを取得して、対象セルを編集可能な状態にします。
                    </Typography>
                    <CellAcquireEditLockSection
                      hasEditLockForSelected={hasEditLockForSelected}
                      isOthersEditingSelected={isOthersEditingSelected}
                      isUpdating={isBusy}
                      onAcquireEditLock={handleAcquireEditLock}
                    />
                  </StepContent>
                </Step>

                <Step expanded={isFlowUnlockedByEditLock}>
                  <StepLabel>状態を変更</StepLabel>
                  <StepContent>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      選択したセルの勤務状態を変更します。
                    </Typography>
                    <CellStateButtons
                      isUpdating={isBusy}
                      hasEditLockForSelected={hasEditLockForSelected}
                      onChangeState={onChangeState}
                      currentState={selectedCurrentState}
                      showTitle={false}
                    />
                  </StepContent>
                </Step>

                <Step expanded={isFlowUnlockedByEditLock}>
                  <StepLabel>シフトを確定</StepLabel>
                  <StepContent>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      管理者のみ操作可能です。確定すると選択したシフトがロックされ、スタッフは編集できなくなります。
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <AppButton
                        variant="solid"
                        startIcon={<CheckIcon />}
                        onClick={() => {
                          void handleLockCells();
                        }}
                        size="sm"
                        disabled={
                          isUpdating || !showLock || !hasEditLockForSelected
                        }
                      >
                        確定
                      </AppButton>
                    </Stack>
                  </StepContent>
                </Step>

                <Step
                  expanded={isFlowUnlockedByEditLock}
                  completed={isLockConfirmed || isShiftConfirmed}
                >
                  <StepLabel>完了</StepLabel>
                  <StepContent>
                    <Typography variant="body2" color="text.secondary">
                      管理者が確定を実行するとこのステップに遷移します。変更の反映が完了しました。
                    </Typography>
                  </StepContent>
                </Step>
              </Stepper>
            </Box>
          </Stack>

          {showCommentsPanel && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                flex: { xs: 1, md: "0 0 420px" },
                width: { xs: "100%", md: 420 },
                minHeight: 0,
                pl: { xs: 0, md: 2 },
                pb: { xs: 1, md: 1.5 },
                borderLeft: { xs: "none", md: "1px solid" },
                borderColor: "divider",
              }}
            >
              <CellCommentsSection
                currentUserId={currentUserId}
                selectedCells={selectedCells}
                comments={comments}
                onAddComments={onAddComments}
                isUpdating={isUpdating}
                commentText={commentText}
                onCommentTextChange={setCommentText}
                onAddComment={handleAddComment}
                isAddingComment={isAddingComment}
              />
            </Box>
          )}
        </Stack>
      </Stack>
    </AppDialog>
  );
};

export const ShiftCellPanel = memo(ShiftCellPanelBase);
