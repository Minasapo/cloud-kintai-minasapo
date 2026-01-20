import { Stack } from "@mui/material";
import { useCallback, useMemo } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import {
  PanelContainer,
  SplitModeToggle,
  SplitViewProvider,
  useSplitView,
} from "@/features/splitView";
import { designTokenVar } from "@/shared/designSystem";
import { PageSection } from "@/shared/ui/layout";

import AdminHeader from "./components/AdminHeader";
import AdminMenu from "./components/AdminMenu";
import useHeaderMenu from "./components/useHeaderMenu";

const PAGE_PADDING_X = {
  xs: designTokenVar("spacing.lg", "16px"),
  md: designTokenVar("spacing.xxl", "32px"),
};

const PAGE_PADDING_Y = {
  xs: designTokenVar("spacing.xl", "24px"),
  md: designTokenVar("spacing.xxl", "32px"),
};

const PAGE_SECTION_GAP = designTokenVar("spacing.xl", "24px");

/**
 * AdminDashboardContent
 * 実際のダッシュボードコンテンツ
 */
function AdminDashboardContent() {
  const menuItems = useHeaderMenu();
  const navigate = useNavigate();
  const location = useLocation();
  const { state, enableSplitMode, disableSplitMode, setRightPanel } =
    useSplitView();

  const handleSelect = useCallback(
    (itemHref: string) => {
      if (location.pathname === itemHref) return;
      navigate(itemHref);
    },
    [location.pathname, navigate]
  );

  const activeMenuHref = useMemo(() => {
    const currentPath = location.pathname;
    const exactMatch = menuItems.find((item) => item.href === currentPath);
    if (exactMatch) return exactMatch.href;

    const prefixMatch = menuItems.find((item) =>
      currentPath.startsWith(`${item.href}/`)
    );
    return prefixMatch?.href ?? menuItems[0]?.href ?? "";
  }, [location.pathname, menuItems]);

  const handleToggleSplitMode = useCallback(() => {
    if (state.mode === "single") {
      enableSplitMode();
    } else {
      disableSplitMode();
      setRightPanel(null);
    }
  }, [state.mode, enableSplitMode, disableSplitMode, setRightPanel]);

  const handleCloseRightPanel = useCallback(() => {
    disableSplitMode();
    setRightPanel(null);
  }, [disableSplitMode, setRightPanel]);

  const isSplitMode = state.mode === "split";

  return (
    <Stack
      component="section"
      sx={{
        flex: 1,
        width: "100%",
        boxSizing: "border-box",
        px: PAGE_PADDING_X,
        py: PAGE_PADDING_Y,
        gap: PAGE_SECTION_GAP,
      }}
    >
      <PageSection variant="surface" layoutVariant="dashboard" sx={{ gap: 0 }}>
        <AdminHeader
          actions={
            <>
              <SplitModeToggle
                mode={state.mode}
                onToggle={handleToggleSplitMode}
              />
              <AdminMenu
                items={menuItems}
                selectedHref={activeMenuHref}
                onSelect={(item) => handleSelect(item.href)}
              />
            </>
          }
        />
      </PageSection>
      <PageSection
        variant="surface"
        layoutVariant="dashboard"
        sx={{ gap: 0, flex: 1, overflow: "hidden" }}
      >
        {isSplitMode ? (
          <Group orientation="horizontal">
            <Panel defaultSize={50} minSize={30}>
              <PanelContainer onClose={undefined}>
                <Outlet />
              </PanelContainer>
            </Panel>
            <Separator
              style={{
                width: "8px",
                backgroundColor: "#e0e0e0",
                cursor: "col-resize",
              }}
            />
            <Panel defaultSize={50} minSize={30}>
              <PanelContainer
                title={state.rightPanel?.title}
                onClose={handleCloseRightPanel}
              >
                {state.rightPanel?.component ? (
                  <state.rightPanel.component panelId={state.rightPanel.id} />
                ) : (
                  <div>パネルが選択されていません</div>
                )}
              </PanelContainer>
            </Panel>
          </Group>
        ) : (
          <Outlet />
        )}
      </PageSection>
    </Stack>
  );
}

export default function AdminDashboard() {
  return (
    <SplitViewProvider>
      <AdminDashboardContent />
    </SplitViewProvider>
  );
}
