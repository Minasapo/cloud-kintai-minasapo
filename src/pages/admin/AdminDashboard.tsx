import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Box,
  Button,
  Collapse,
  Skeleton,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { lazy, Suspense, useCallback, useMemo } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { resolveActiveMenuHref } from "@/features/admin/layout/model/resolveActiveMenuHref";
import useHeaderMenu from "@/features/admin/layout/model/useHeaderMenu";
import AdminHeader from "@/features/admin/layout/ui/AdminHeader";
import AdminMenu from "@/features/admin/layout/ui/AdminMenu";
import {
  PanelContainer,
  ScreenOption,
  SplitModeToggle,
  SplitViewProvider,
  useSplitView,
} from "@/features/splitView";
import { designTokenVar } from "@/shared/designSystem";
import { PageSection } from "@/shared/ui/layout";

const PAGE_PADDING_X = {
  xs: designTokenVar("spacing.lg", "16px"),
  md: designTokenVar("spacing.xxl", "32px"),
};

const PAGE_PADDING_Y = {
  xs: designTokenVar("spacing.xl", "24px"),
  md: designTokenVar("spacing.xxl", "32px"),
};

const PAGE_SECTION_GAP = designTokenVar("spacing.xl", "24px");

// 右側パネル用のコンポーネント
const AdminAttendanceComponent = lazy(() => import("./AdminAttendance"));
const AdminDailyReportManagementComponent = lazy(
  () => import("./AdminDailyReportManagement/AdminDailyReportManagement"),
);
const AdminStaffComponent = lazy(
  () => import("@/features/admin/staff/ui/AdminStaff"),
);
const ShiftPlanManagementComponent = lazy(
  () => import("./ShiftPlanManagement/ShiftPlanManagement"),
);

// 画面IDとコンポーネントのマッピング
const SCREEN_COMPONENTS: Record<
  string,
  React.ComponentType<{ panelId: string }>
> = {
  "attendance-edit": AdminAttendanceComponent as React.ComponentType<{
    panelId: string;
  }>,
  "daily-report": AdminDailyReportManagementComponent as React.ComponentType<{
    panelId: string;
  }>,
  "staff-list": AdminStaffComponent as React.ComponentType<{ panelId: string }>,
  "shift-plan": ShiftPlanManagementComponent as React.ComponentType<{
    panelId: string;
  }>,
};

// 右側パネルで選択可能な画面オプション
const SCREEN_OPTIONS: ScreenOption[] = [
  {
    value: "attendance-edit",
    label: "勤怠編集",
    route: "/admin/attendances",
  },
  {
    value: "daily-report",
    label: "日報詳細",
    route: "/admin/daily-report",
  },
  {
    value: "staff-list",
    label: "スタッフ一覧",
    route: "/admin/staffs",
  },
  {
    value: "shift-plan",
    label: "シフト管理",
    route: "/admin/shift",
  },
];

const SplitPanelSkeleton = () => (
  <Stack spacing={1.5} sx={{ p: 2 }}>
    <Skeleton variant="text" width="38%" height={32} />
    <Skeleton variant="rounded" height={54} />
    <Skeleton variant="rounded" height={54} />
    <Skeleton variant="rounded" height={54} />
    <Skeleton variant="rounded" height={54} />
  </Stack>
);

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [isMenuExpanded, setIsMenuExpanded] = React.useState(!isMobile);

  const handleSelect = useCallback(
    (itemHref: string) => {
      if (location.pathname === itemHref) return;
      navigate(itemHref);
    },
    [location.pathname, navigate],
  );

  const activeMenuHref = useMemo(() => {
    return resolveActiveMenuHref({
      currentPath: location.pathname,
      menuItems,
    });
  }, [location.pathname, menuItems]);

  const activeMenuItem = useMemo(
    () => menuItems.find((item) => item.href === activeMenuHref) ?? null,
    [activeMenuHref, menuItems],
  );

  React.useEffect(() => {
    if (!isMobile) {
      setIsMenuExpanded(true);
      return;
    }
    setIsMenuExpanded(false);
  }, [isMobile]);

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

  const handleScreenChange = useCallback(
    (screenValue: string) => {
      const selectedOption = SCREEN_OPTIONS.find(
        (option) => option.value === screenValue,
      );
      const component = SCREEN_COMPONENTS[screenValue];
      if (selectedOption && component) {
        setRightPanel({
          id: selectedOption.value,
          title: selectedOption.label,
          component: component,
        });
      }
    },
    [setRightPanel],
  );

  const selectedScreen = useMemo(() => {
    if (!state.rightPanel) return "";
    return state.rightPanel.id;
  }, [state.rightPanel]);

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
        maxWidth: "1360px",
        mx: "auto",
      }}
    >
      <PageSection
        variant="plain"
        layoutVariant="dashboard"
        className="gap-0"
        sx={{ px: 0 }}
      >
        <AdminHeader
          actions={
            <Stack spacing={1} alignItems="flex-start">
              {isMobile && (
                <Button
                  variant="text"
                  size="small"
                  onClick={() => setIsMenuExpanded((prev) => !prev)}
                  startIcon={
                    isMenuExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />
                  }
                  sx={{ fontWeight: 600 }}
                >
                  {isMenuExpanded ? "メニューを閉じる" : "メニューを開く"}
                </Button>
              )}
              <Collapse
                in={isMenuExpanded}
                timeout="auto"
                unmountOnExit={false}
              >
                <AdminMenu
                  items={menuItems}
                  selectedHref={activeMenuHref}
                  onSelect={(item) => handleSelect(item.href)}
                />
              </Collapse>
              {activeMenuItem && (
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  alignItems={{ xs: "flex-start", md: "center" }}
                  justifyContent="space-between"
                  spacing={1.5}
                  sx={{
                    width: "100%",
                    borderRadius: "22px",
                    border: "1px solid rgba(255,255,255,0.6)",
                    bgcolor: "rgba(255,255,255,0.78)",
                    px: { xs: 1.5, md: 2 },
                    py: 1.5,
                  }}
                >
                  <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                    <Box
                      sx={{
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        letterSpacing: "0.04em",
                        color: "#0f766e",
                      }}
                    >
                      現在のカテゴリ
                    </Box>
                    <Box
                      sx={{
                        fontSize: "1rem",
                        fontWeight: 700,
                        color: "#020617",
                      }}
                    >
                      {activeMenuItem.primaryLabel}
                    </Box>
                    {activeMenuItem.description ? (
                      <Box
                        sx={{
                          color: "#64748b",
                          lineHeight: 1.7,
                          fontSize: "0.92rem",
                        }}
                      >
                        {activeMenuItem.description}
                      </Box>
                    ) : null}
                  </Stack>
                  {!isMobile && (
                    <SplitModeToggle
                      mode={state.mode}
                      onToggle={handleToggleSplitMode}
                    />
                  )}
                </Stack>
              )}
            </Stack>
          }
        />
      </PageSection>
      <PageSection
        variant="surface"
        layoutVariant="dashboard"
        sx={{
          gap: 0,
          flex: 1,
          overflow: "hidden",
          borderRadius: "28px",
          border: "1px solid rgba(226,232,240,0.8)",
          backgroundColor: "#ffffff",
          boxShadow: "0 28px 60px -42px rgba(15,23,42,0.35)",
        }}
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
                backgroundColor: "#e2e8f0",
                cursor: "col-resize",
              }}
            />
            <Panel defaultSize={50} minSize={30}>
              <PanelContainer
                title={state.rightPanel?.title || "画面を選択"}
                onClose={handleCloseRightPanel}
                screenOptions={SCREEN_OPTIONS}
                selectedScreen={selectedScreen}
                onScreenChange={handleScreenChange}
                contentSx={
                  selectedScreen === "daily-report" ? { pt: 0 } : undefined
                }
              >
                {state.rightPanel?.component ? (
                  <Suspense fallback={<SplitPanelSkeleton />}>
                    <state.rightPanel.component panelId={state.rightPanel.id} />
                  </Suspense>
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
