import { type FC, memo } from "react";

import type { DataSyncStatus } from "../types/collaborative.types";
import { InlineAlert } from "./ui/InlineAlert";

export type SyncPanelProps = {
  syncError: string | null;
  onClearError?: () => void;
};

export const dataSyncStatusConfig: Record<
  DataSyncStatus,
  {
    label: string;
    color: "default" | "primary" | "success" | "warning" | "error";
    showSpinner: boolean;
  }
> = {
  idle: { label: "未同期", color: "default", showSpinner: false },
  saving: { label: "保存中", color: "warning", showSpinner: true },
  syncing: { label: "同期中", color: "primary", showSpinner: true },
  saved: { label: "保存完了", color: "success", showSpinner: false },
  synced: { label: "同期完了", color: "success", showSpinner: false },
  error: { label: "エラー", color: "error", showSpinner: false },
};

export const SyncPanelBase: FC<SyncPanelProps> = ({ syncError, onClearError }) => {
  return (
    <>
      {syncError && (
        <InlineAlert tone="error" className="mb-2" onClose={onClearError}>
          同期に失敗しました。再試行してください。({syncError})
        </InlineAlert>
      )}
    </>
  );
};

export const SyncPanel = memo(SyncPanelBase);
