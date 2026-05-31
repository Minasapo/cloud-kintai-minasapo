import { createLogger } from "@shared/lib/logger";
import dayjs from "dayjs";

import type { useCollaborativePageState } from "../hooks/useCollaborativePageState";
import type { DataSyncStatus, Mention } from "../types/collaborative.types";

const logger = createLogger("ShiftCollaborative");

export const isWeekend = (day: dayjs.Dayjs): boolean =>
  day.day() === 0 || day.day() === 6;

export const buildCellEditLockHolders = (
  selectionCount: number,
  selectedCells: Array<{ staffId: string; date: string }>,
  focusedCell: { staffId: string; date: string } | null,
  getCellEditor: ReturnType<typeof useCollaborativePageState>["getCellEditor"],
  currentUserId: string,
) => {
  const cells =
    selectionCount > 0
      ? Array.from(selectedCells)
      : focusedCell
        ? [{ staffId: focusedCell.staffId, date: focusedCell.date }]
        : [];

  return cells
    .map(({ staffId, date }) => {
      const editor = getCellEditor(staffId, date);
      if (!editor) return null;
      return {
        staffId,
        date,
        editorName: editor.userName,
        editorColor: editor.color,
        isSelf: editor.userId === currentUserId,
      };
    })
    .filter((v): v is NonNullable<typeof v> => v !== null);
};

export const buildSyncStatusConfig = (
  dataStatus: DataSyncStatus,
  lastAutoSyncedAt: number,
  isSyncing: boolean,
) => {
  const dataSyncStatusConfigLabel: Record<DataSyncStatus, string> = {
    idle: "未同期",
    saving: "保存中",
    syncing: "同期中",
    saved: "保存完了",
    synced: "同期完了",
    error: "エラー",
  };

  const formattedLastSyncedAt =
    lastAutoSyncedAt > 0
      ? dayjs(lastAutoSyncedAt).format("YYYY/MM/DD HH:mm:ss")
      : "未同期";

  const syncButtonColor: "default" | "primary" | "success" | "error" =
    dataStatus === "error"
      ? "error"
      : dataStatus === "synced" || dataStatus === "saved"
        ? "success"
        : dataStatus === "syncing"
          ? "primary"
          : "default";

  return {
    syncStatusLabel: dataSyncStatusConfigLabel[dataStatus],
    syncButtonColor,
    syncTooltipTitle: (
      <div className="text-xs leading-5">
        <div>同期状態: {dataSyncStatusConfigLabel[dataStatus]}</div>
        <div>最後に自動同期された日時: {formattedLastSyncedAt}</div>
        <div>{isSyncing ? "同期中です" : "最新状態を取得"}</div>
      </div>
    ),
  };
};

export const addCommentsToSelectedCells = async ({
  content,
  selectionCount,
  shiftDataMap,
  isCellSelected,
  addComment,
}: {
  content: string;
  selectionCount: number;
  shiftDataMap: Map<string, Map<string, unknown>>;
  isCellSelected: (staffId: string, dateKey: string) => boolean;
  addComment: (
    cellKey: string,
    content: string,
    mentions: Mention[],
  ) => Promise<unknown>;
}) => {
  const cellCount = Math.min(selectionCount, 10);
  let addedCount = 0;

  const staffIds = Array.from(shiftDataMap.keys());
  for (const staffId of staffIds) {
    if (addedCount >= cellCount) break;

    const staffData = shiftDataMap.get(staffId);
    if (!staffData) continue;

    for (const dateKey of staffData.keys()) {
      if (addedCount >= cellCount) break;

      if (isCellSelected(staffId, dateKey)) {
        try {
          const cellKey = `${staffId}#${dateKey}`;
          await addComment(cellKey, content, []);
          addedCount++;
        } catch (error) {
          logger.error("Failed to add comment:", error);
        }
      }
    }
  }
};
