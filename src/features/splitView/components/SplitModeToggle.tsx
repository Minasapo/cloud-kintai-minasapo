import ViewAgendaIcon from "@mui/icons-material/ViewAgenda";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import { IconButton, Tooltip } from "@mui/material";
import React from "react";

import { SplitViewMode } from "../types/splitView.types";

export interface SplitModeToggleProps {
  mode: SplitViewMode;
  onToggle: () => void;
  disabled?: boolean;
}

/**
 * SplitModeToggle
 * シングル/スプリットモード切り替えボタン
 */
export const SplitModeToggle: React.FC<SplitModeToggleProps> = ({
  mode,
  onToggle,
  disabled = false,
}) => {
  const isSplitMode = mode === "split";
  const label = isSplitMode
    ? "シングルモードに切り替え"
    : "スプリットモードに切り替え";

  return (
    <Tooltip title={label}>
      <span>
        <IconButton
          onClick={onToggle}
          disabled={disabled}
          aria-label={label}
          size="medium"
        >
          {isSplitMode ? <ViewAgendaIcon /> : <ViewColumnIcon />}
        </IconButton>
      </span>
    </Tooltip>
  );
};
