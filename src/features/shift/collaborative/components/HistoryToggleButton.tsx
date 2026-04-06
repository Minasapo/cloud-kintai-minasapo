import { HistoryToggleOff as HistoryIcon } from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import React from "react";

import { AppIconButton } from "@/shared/ui/button";

/**
 * 変更履歴表示トグルボタンのProps
 */
export interface HistoryToggleButtonProps {
  showHistory: boolean;
  onToggle: () => void;
}

/**
 * 変更履歴表示トグルボタン
 * ツールバー内に配置して履歴パネルの表示/非表示を切り替える
 */
export const HistoryToggleButton: React.FC<HistoryToggleButtonProps> = ({
  showHistory,
  onToggle,
}) => {
  return (
    <Tooltip title={showHistory ? "変更履歴を非表示" : "変更履歴を表示"}>
      <AppIconButton
        onClick={onToggle}
        aria-label="toggle history"
        tone="primary"
        size="sm"
        active={showHistory}
      >
        <HistoryIcon />
      </AppIconButton>
    </Tooltip>
  );
};
