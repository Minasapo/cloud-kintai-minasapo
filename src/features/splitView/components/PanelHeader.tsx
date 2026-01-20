import CloseIcon from "@mui/icons-material/Close";
import { Box, IconButton, Typography } from "@mui/material";
import React from "react";

export interface PanelHeaderProps {
  title?: string;
  onClose?: () => void;
}

/**
 * PanelHeader
 * パネルのヘッダーコンポーネント（タイトルと閉じるボタン）
 */
export const PanelHeader: React.FC<PanelHeaderProps> = ({ title, onClose }) => {
  if (!title && !onClose) {
    return null;
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 2,
        borderBottom: 1,
        borderColor: "divider",
        backgroundColor: "background.paper",
      }}
    >
      <Typography variant="h6" component="h2">
        {title}
      </Typography>
      {onClose && (
        <IconButton
          onClick={onClose}
          size="small"
          aria-label="パネルを閉じる"
          sx={{ marginLeft: 2 }}
        >
          <CloseIcon />
        </IconButton>
      )}
    </Box>
  );
};
