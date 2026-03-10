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
  IconButton,
  Paper,
  Stack,
  Tooltip,
} from "@mui/material";
import React from "react";

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
      elevation={1}
      sx={{
        mb: 2,
        p: 1,
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
            <IconButton
              size="small"
              onClick={onUndo}
              disabled={!canUndo}
              color="primary"
              aria-label="undo"
            >
              <UndoIcon />
            </IconButton>
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
            <IconButton
              size="small"
              onClick={onRedo}
              disabled={!canRedo}
              color="primary"
              aria-label="redo"
            >
              <RedoIcon />
            </IconButton>
          </span>
        </Tooltip>

        {onPrint && (
          <>
            <Divider orientation="vertical" flexItem sx={{ mx: 1, my: 0.5 }} />
            <Tooltip title="シフト調整表を印刷">
              <IconButton
                size="small"
                onClick={onPrint}
                color="primary"
                aria-label="print"
              >
                <PrintIcon />
              </IconButton>
            </Tooltip>

            {onSync && (
              <Tooltip
                title={
                  syncTooltip || (isSyncBusy ? "同期中です" : "最新状態を取得")
                }
              >
                <span>
                  <IconButton
                    size="small"
                    onClick={onSync}
                    color={syncColor}
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
                  </IconButton>
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
              <IconButton
                size="small"
                onClick={onShowSuggestions}
                color="primary"
                aria-label="show suggestions"
              >
                <LightbulbIcon />
              </IconButton>
            </Badge>
          </Tooltip>
        )}

        {onShowHelp && (
          <Tooltip title="ヘルプ">
            <IconButton
              size="small"
              onClick={onShowHelp}
              color="default"
              aria-label="show help"
            >
              <HelpOutlineIcon />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    </Paper>
  );
};
