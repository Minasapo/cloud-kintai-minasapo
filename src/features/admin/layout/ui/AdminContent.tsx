import type { UseHeaderMenuResult } from "@features/admin/layout/model/useHeaderMenu";
import { AdminNavigation } from "@features/admin/layout/ui/AdminNavigation";
import { AdminSplitView } from "@features/admin/layout/ui/AdminSplitView";
import { Box, Stack } from "@mui/material";
import React, { memo } from "react";
import { Outlet } from "react-router-dom";

const MemoizedOutlet = memo(function MemoizedOutlet() {
  return <Outlet />;
});

export interface AdminContentProps {
  menuItems: UseHeaderMenuResult;
  activeMenuHref: string;
  currentPath: string;
  onSelect: (itemHref: string) => void;
  isMobile: boolean;
  isMobileRailOpen: boolean;
  isSplitMode: boolean;
  isTripleMode: boolean;
  splitPanelPosition: "left" | "right";
  splitPanelTitle?: string;
  splitPanelScreen: string;
  middlePanelTitle?: string;
  rightPanelTitle?: string;
  selectedMiddleScreen: string;
  selectedRightScreen: string;
  onCloseMiddlePanel: () => void;
  onCloseRightPanel: () => void;
  onMiddleScreenChange: (screenValue: string) => void;
  onRightScreenChange: (screenValue: string) => void;
  SplitPanelComponent?: React.ComponentType<{ panelId: string }>;
  MiddlePanelComponent?: React.ComponentType<{ panelId: string }>;
  RightPanelComponent?: React.ComponentType<{ panelId: string }>;
}

export const AdminContent = memo(function AdminContent({
  menuItems,
  activeMenuHref,
  currentPath,
  onSelect,
  isMobile,
  isMobileRailOpen,
  isSplitMode,
  isTripleMode,
  splitPanelPosition,
  splitPanelTitle,
  splitPanelScreen,
  middlePanelTitle,
  rightPanelTitle,
  selectedMiddleScreen,
  selectedRightScreen,
  onCloseMiddlePanel,
  onCloseRightPanel,
  onMiddleScreenChange,
  onRightScreenChange,
  SplitPanelComponent,
  MiddlePanelComponent,
  RightPanelComponent,
}: AdminContentProps) {
  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      sx={{ width: "100%", flex: 1 }}
    >
      {!isMobile && (
        <AdminNavigation
          menuItems={menuItems}
          activeMenuHref={activeMenuHref}
          currentPath={currentPath}
          onSelect={onSelect}
        />
      )}

      <Box sx={{ flex: 1, minWidth: 0 }}>
        {isMobile && isMobileRailOpen && (
          <Box sx={{ borderBottom: "1px solid rgba(226,232,240,0.85)" }}>
            <AdminNavigation
              compact
              menuItems={menuItems}
              activeMenuHref={activeMenuHref}
              currentPath={currentPath}
              onSelect={onSelect}
            />
          </Box>
        )}

        <AdminSplitView
          isSplitMode={isSplitMode}
          isTripleMode={isTripleMode}
          middlePanelTitle={middlePanelTitle}
          rightPanelTitle={rightPanelTitle}
          selectedMiddleScreen={selectedMiddleScreen}
          selectedRightScreen={selectedRightScreen}
          splitPanelPosition={splitPanelPosition}
          splitPanelTitle={splitPanelTitle}
          splitPanelScreen={splitPanelScreen}
          onCloseMiddlePanel={onCloseMiddlePanel}
          onCloseRightPanel={onCloseRightPanel}
          onMiddleScreenChange={onMiddleScreenChange}
          onRightScreenChange={onRightScreenChange}
          SplitPanelComponent={SplitPanelComponent}
          MiddlePanelComponent={MiddlePanelComponent}
          RightPanelComponent={RightPanelComponent}
          outlet={<MemoizedOutlet />}
        />
      </Box>
    </Stack>
  );
});
