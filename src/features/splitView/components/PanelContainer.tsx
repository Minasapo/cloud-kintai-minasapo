import { Box } from "@mui/material";
import React from "react";

import { PanelHeader, ScreenOption } from "./PanelHeader";

export interface PanelContainerProps {
  title?: string;
  onClose?: () => void;
  screenOptions?: ScreenOption[];
  selectedScreen?: string;
  onScreenChange?: (screenValue: string) => void;
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
  screenOptions,
  selectedScreen,
  onScreenChange,
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
      {(title || onClose || screenOptions) && (
        <PanelHeader
          title={title}
          onClose={onClose}
          screenOptions={screenOptions}
          selectedScreen={selectedScreen}
          onScreenChange={onScreenChange}
        />
      )}
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
