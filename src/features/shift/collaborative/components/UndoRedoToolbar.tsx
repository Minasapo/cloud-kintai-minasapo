import {
  HelpOutline as HelpOutlineIcon,
  Lightbulb as LightbulbIcon,
  Redo as RedoIcon,
  Sync as SyncIcon,
  Undo as UndoIcon,
} from "@mui/icons-material";
import PrintIcon from "@mui/icons-material/Print";
import {
  Badge,
  Divider,
  Paper,
  Stack,
  Tooltip,
} from "@mui/material";
import React from "react";

import { AppIconButton } from "@/shared/ui/button";

const MIN_SYNC_SPIN_DURATION_MS = 2000;

/**
 * 取り消し/やり直しツールバーのProps
 */
export interface UndoRedoToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  lastUndoDescription?: string;
  lastRedoDescription?: string;
  showHistory?: boolean;
  onToggleHistory?: () => void;
  onShowHelp?: () => void;
  onPrint?: () => void;
  onSync?: () => void;
  syncTooltip?: React.ReactNode;
  syncColor?: "default" | "primary" | "success" | "error";
  isSyncing?: boolean;
  onShowSuggestions?: () => void;
  suggestionsBadgeCount?: number;
}

/**
 * 取り消し/やり直しツールバー
 * 見出しの下に配置するツールバー
 */
export const UndoRedoToolbar: React.FC<UndoRedoToolbarProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  lastUndoDescription,
  lastRedoDescription,
  onShowHelp,
  onPrint,
  onSync,
  syncTooltip,
  syncColor = "default",
  isSyncing = false,
  onShowSuggestions,
  suggestionsBadgeCount,
}) => {
  const [isSyncAnimating, setIsSyncAnimating] = React.useState(isSyncing);
  const syncAnimationStartedAtRef = React.useRef<number | null>(null);
  const syncAnimationTimerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (syncAnimationTimerRef.current !== null) {
      window.clearTimeout(syncAnimationTimerRef.current);
      syncAnimationTimerRef.current = null;
    }

    if (isSyncing) {
      if (syncAnimationStartedAtRef.current === null) {
        syncAnimationStartedAtRef.current = Date.now();
      }
      setIsSyncAnimating(true);
      return;
    }

    if (syncAnimationStartedAtRef.current === null) {
      setIsSyncAnimating(false);
      return;
    }

    const elapsed = Date.now() - syncAnimationStartedAtRef.current;
    const remaining = Math.max(0, MIN_SYNC_SPIN_DURATION_MS - elapsed);

    if (remaining === 0) {
      syncAnimationStartedAtRef.current = null;
      setIsSyncAnimating(false);
      return;
    }

    syncAnimationTimerRef.current = window.setTimeout(() => {
      syncAnimationStartedAtRef.current = null;
      syncAnimationTimerRef.current = null;
      setIsSyncAnimating(false);
    }, remaining);
  }, [isSyncing]);

  React.useEffect(
    () => () => {
      if (syncAnimationTimerRef.current !== null) {
        window.clearTimeout(syncAnimationTimerRef.current);
      }
    },
    [],
  );

  const isSyncBusy = isSyncing || isSyncAnimating;

  return (
    <Paper
      sx={{
        mb: 2,
        p: 1.25,
        borderRadius: "24px",
        border: "1px solid rgba(226,232,240,0.8)",
        boxShadow: "0 24px 48px -36px rgba(15,23,42,0.35)",
        bgcolor: "#ffffff",
      }}
    >
      <Stack direction="row" spacing={0} alignItems="center">
        <Tooltip
          title={
            canUndo
              ? lastUndoDescription || "操作を取り消す (Ctrl/Cmd + Z)"
              : "取り消せる操作はありません"
          }
        >
          <span>
            <AppIconButton
              onClick={onUndo}
              disabled={!canUndo}
              tone="primary"
              size="sm"
              aria-label="undo"
            >
              <UndoIcon />
            </AppIconButton>
          </span>
        </Tooltip>

        <Tooltip
          title={
            canRedo
              ? lastRedoDescription || "操作をやり直す (Ctrl/Cmd + Shift + Z)"
              : "やり直せる操作はありません"
          }
        >
          <span>
            <AppIconButton
              onClick={onRedo}
              disabled={!canRedo}
              tone="primary"
              size="sm"
              aria-label="redo"
            >
              <RedoIcon />
            </AppIconButton>
          </span>
        </Tooltip>

        {onPrint && (
          <>
            <Divider orientation="vertical" flexItem sx={{ mx: 1, my: 0.5 }} />
            <Tooltip title="シフト調整表を印刷">
              <AppIconButton
                onClick={onPrint}
                tone="primary"
                size="sm"
                aria-label="print"
              >
                <PrintIcon />
              </AppIconButton>
            </Tooltip>

            {onSync && (
              <Tooltip
                title={
                  syncTooltip || (isSyncBusy ? "同期中です" : "最新状態を取得")
                }
              >
                <span>
                  <AppIconButton
                    onClick={onSync}
                    tone={
                      syncColor === "error"
                        ? "danger"
                        : syncColor === "primary" || syncColor === "success"
                          ? "primary"
                          : "neutral"
                    }
                    size="sm"
                    disabled={isSyncBusy}
                    aria-label="sync"
                  >
                    <SyncIcon
                      sx={{
                        animation: isSyncAnimating
                          ? "copilot-sync-spin 1s linear infinite"
                          : "none",
                        "@keyframes copilot-sync-spin": {
                          from: { transform: "rotate(0deg)" },
                          to: { transform: "rotate(-360deg)" },
                        },
                      }}
                    />
                  </AppIconButton>
                </span>
              </Tooltip>
            )}
          </>
        )}

        {onShowSuggestions && (
          <Tooltip title="シフト提案を表示">
            <Badge
              color="error"
              badgeContent={suggestionsBadgeCount}
              max={9}
              invisible={!suggestionsBadgeCount || suggestionsBadgeCount <= 0}
            >
              <AppIconButton
                onClick={onShowSuggestions}
                tone="primary"
                size="sm"
                aria-label="show suggestions"
              >
                <LightbulbIcon />
              </AppIconButton>
            </Badge>
          </Tooltip>
        )}

        {onShowHelp && (
          <Tooltip title="ヘルプ">
            <AppIconButton
              onClick={onShowHelp}
              tone="neutral"
              size="sm"
              aria-label="show help"
            >
              <HelpOutlineIcon />
            </AppIconButton>
          </Tooltip>
        )}
      </Stack>
    </Paper>
  );
};
