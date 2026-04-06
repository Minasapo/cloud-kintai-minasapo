import ViewAgendaIcon from "@mui/icons-material/ViewAgenda";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import ViewWeekIcon from "@mui/icons-material/ViewWeek";
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
  const labelByMode: Record<SplitViewMode, string> = {
    single: "2分割モードに切り替え",
    split: "3分割モードに切り替え",
    triple: "シングルモードに切り替え",
  };

  const iconByMode: Record<SplitViewMode, React.ReactNode> = {
    single: <ViewColumnIcon />,
    split: <ViewWeekIcon />,
    triple: <ViewAgendaIcon />,
  };

  const label = labelByMode[mode];

  return (
    <Tooltip title={label}>
      <span>
        <IconButton
          onClick={onToggle}
          disabled={disabled}
          aria-label={label}
          size="medium"
        >
          {iconByMode[mode]}
        </IconButton>
      </span>
    </Tooltip>
  );
};
