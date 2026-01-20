import { Box } from "@mui/material";
import React from "react";

import { PanelHeader } from "./PanelHeader";

export interface PanelContainerProps {
  title?: string;
  onClose?: () => void;
  children: React.ReactNode;
}

/**
 * PanelContainer
 * パネルコンテナコンポーネント
 * ヘッダーとコンテンツエリアを含む
 */
export const PanelContainer: React.FC<PanelContainerProps> = ({
  title,
  onClose,
  children,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
        backgroundColor: "background.paper",
      }}
    >
      {(title || onClose) && <PanelHeader title={title} onClose={onClose} />}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          padding: 2,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
