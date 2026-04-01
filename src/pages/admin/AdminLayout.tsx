import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Box,
  Button,
  Collapse,
  Divider,
  Skeleton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { memo, Suspense, useCallback, useMemo } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import {
  PAGE_PADDING_X,
  PAGE_PADDING_Y,
} from "@/features/admin/layout/adminLayoutTokens";
import {
  ADMIN_SPLIT_PANEL_COMPONENTS,
  ADMIN_SPLIT_PANEL_OPTIONS,
} from "@/features/admin/layout/model/adminSplitPanelRegistry";
import { resolveActiveMenuHref } from "@/features/admin/layout/model/resolveActiveMenuHref";
import useHeaderMenu from "@/features/admin/layout/model/useHeaderMenu";
import { ActiveMenuInfo } from "@/features/admin/layout/ui/ActiveMenuInfo";
import AdminHeader from "@/features/admin/layout/ui/AdminHeader";
import AdminMenu from "@/features/admin/layout/ui/AdminMenu";
import {
  PanelContainer,
  SplitViewProvider,
  useSplitView,
} from "@/features/splitView";
import { designTokenVar } from "@/shared/designSystem";
import { PageSection } from "@/shared/ui/layout";
import { getPageWidthMaxWidth } from "@/shared/ui/layout/pageWidthPresets";

const PAGE_SECTION_GAP = designTokenVar("spacing.xl", "24px");

const SplitPanelSkeleton = () => (
  <Stack spacing={1.5} sx={{ p: 2 }}>
    <Skeleton variant="text" width="38%" height={32} />
    <Skeleton variant="rounded" height={54} />
    <Skeleton variant="rounded" height={54} />
    <Skeleton variant="rounded" height={54} />
    <Skeleton variant="rounded" height={54} />
  </Stack>
);

const PAGE_CONTAINER_SX = {
  flex: 1,
  width: "100%",
  boxSizing: "border-box",
  px: PAGE_PADDING_X,
  py: PAGE_PADDING_Y,
  gap: PAGE_SECTION_GAP,
  maxWidth: getPageWidthMaxWidth("wide"),
  mx: "auto",
} as const;

const SURFACE_SECTION_SX = {
  gap: 0,
  flex: 1,
  overflow: "hidden",
  borderRadius: "16px",
  border: "1px solid rgba(226,232,240,0.8)",
  backgroundColor: "#ffffff",
  boxShadow: "0 28px 60px -42px rgba(15,23,42,0.35)",
} as const;

const RAIL_ACTION_LINKS = [
  { label: "勤怠修正申請", href: "/admin/attendances" },
  { label: "シフト運用", href: "/admin/shift" },
  { label: "ワークフロー承認", href: "/admin/workflow" },
  { label: "設定ハブ", href: "/admin/master" },
] as const;

function AdminHeaderActions({
  isMobile,
  isMenuExpanded,
  onToggleMenu,
  menuItems,
  activeMenuHref,
  onSelect,
  activeMenuItem,
  splitMode,
  onToggleSplitMode,
}: {
  isMobile: boolean;
  isMenuExpanded: boolean;
  onToggleMenu: () => void;
  menuItems: ReturnType<typeof useHeaderMenu>;
  activeMenuHref: string;
  onSelect: (itemHref: string) => void;
  activeMenuItem: ReturnType<typeof useHeaderMenu>[number] | null;
  splitMode: "single" | "split";
  onToggleSplitMode: () => void;
}) {
  return (
    <Stack spacing={1} alignItems="flex-start">
      {isMobile && (
        <Button
          variant="text"
          size="small"
          onClick={onToggleMenu}
          startIcon={isMenuExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          sx={{ fontWeight: 600 }}
        >
          {isMenuExpanded ? "メニューを閉じる" : "メニューを開く"}
        </Button>
      )}
      <Collapse in={isMenuExpanded} timeout="auto" unmountOnExit={false}>
        <AdminMenu
          items={menuItems}
          selectedHref={activeMenuHref}
          onSelect={(item) => onSelect(item.href)}
        />
      </Collapse>
      {activeMenuItem && (
        <ActiveMenuInfo
          primaryLabel={activeMenuItem.primaryLabel}
          description={activeMenuItem.description}
          ctaLabel={activeMenuItem.ctaLabel}
          isMobile={isMobile}
          splitMode={splitMode}
          onToggleSplitMode={onToggleSplitMode}
        />
      )}
    </Stack>
  );
}

const MemoizedAdminHeaderActions = memo(AdminHeaderActions);

const AdminContextRail = memo(function AdminContextRail({
  menuItems,
  activeMenuHref,
  activeMenuItem,
  onSelect,
}: {
  menuItems: ReturnType<typeof useHeaderMenu>;
  activeMenuHref: string;
  activeMenuItem: ReturnType<typeof useHeaderMenu>[number] | null;
  onSelect: (itemHref: string) => void;
}) {
  return (
    <Stack
      spacing={2}
      sx={{
        width: 280,
        minWidth: 280,
        borderRight: "1px solid rgba(226,232,240,0.85)",
        background:
          "linear-gradient(180deg, rgba(248,250,252,0.95) 0%, rgba(255,255,255,0.9) 100%)",
        p: 2,
      }}
    >
      <Stack spacing={0.5}>
        <Typography
          sx={{ fontSize: "0.74rem", fontWeight: 700, color: "#0f766e" }}
        >
          CONTROL RAIL
        </Typography>
        <Typography
          sx={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}
        >
          {activeMenuItem?.primaryLabel ?? "カテゴリ"}
        </Typography>
        <Typography
          sx={{ fontSize: "0.82rem", color: "#64748b", lineHeight: 1.6 }}
        >
          {activeMenuItem?.ctaLabel ?? "頻出操作へすばやく遷移できます。"}
        </Typography>
      </Stack>

      <Divider flexItem />

      <Stack spacing={1}>
        {menuItems.map((item) => {
          const isActive = item.href === activeMenuHref;
          return (
            <Button
              key={item.href}
              variant="text"
              onClick={() => onSelect(item.href)}
              sx={{
                justifyContent: "space-between",
                textTransform: "none",
                borderRadius: "10px",
                px: 1.25,
                py: 1,
                color: isActive ? "#065f46" : "#1e293b",
                backgroundColor: isActive
                  ? "rgba(16,185,129,0.14)"
                  : "transparent",
                fontWeight: isActive ? 700 : 500,
                "&:hover": {
                  backgroundColor: isActive
                    ? "rgba(16,185,129,0.2)"
                    : "rgba(148,163,184,0.12)",
                },
              }}
            >
              <Box component="span">{item.primaryLabel}</Box>
              <Box component="span" sx={{ fontSize: "0.72rem", opacity: 0.75 }}>
                {item.secondaryLabel ?? ""}
              </Box>
            </Button>
          );
        })}
      </Stack>

      <Divider flexItem />

      <Stack spacing={0.8}>
        <Typography
          sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#334155" }}
        >
          QUICK ROUTES
        </Typography>
        {RAIL_ACTION_LINKS.map((link) => (
          <Button
            key={link.href}
            variant="outlined"
            onClick={() => onSelect(link.href)}
            sx={{
              justifyContent: "flex-start",
              textTransform: "none",
              borderColor: "rgba(148,163,184,0.38)",
              color: "#0f172a",
              borderRadius: "999px",
            }}
          >
            {link.label}
          </Button>
        ))}
      </Stack>
    </Stack>
  );
});

const MemoizedOutlet = memo(function MemoizedOutlet() {
  return <Outlet />;
});

const SinglePanelContent = memo(function SinglePanelContent() {
  return <MemoizedOutlet />;
});

const SplitLayoutPanels = memo(function SplitLayoutPanels({
  rightPanelTitle,
  selectedScreen,
  onCloseRightPanel,
  onScreenChange,
  RightPanelComponent,
}: {
  rightPanelTitle?: string;
  selectedScreen: string;
  onCloseRightPanel: () => void;
  onScreenChange: (screenValue: string) => void;
  RightPanelComponent?: React.ComponentType<{ panelId: string }>;
}) {
  return (
    <Group orientation="horizontal">
      <Panel defaultSize={50} minSize={30}>
        <PanelContainer onClose={undefined}>
          <MemoizedOutlet />
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
          title={rightPanelTitle || "画面を選択"}
          onClose={onCloseRightPanel}
          screenOptions={ADMIN_SPLIT_PANEL_OPTIONS}
          selectedScreen={selectedScreen}
          onScreenChange={onScreenChange}
          contentSx={selectedScreen === "daily-report" ? { pt: 0 } : undefined}
        >
          {RightPanelComponent ? (
            <Suspense fallback={<SplitPanelSkeleton />}>
              <RightPanelComponent panelId={selectedScreen} />
            </Suspense>
          ) : (
            <div>パネルが選択されていません</div>
          )}
        </PanelContainer>
      </Panel>
    </Group>
  );
});

/**
 * AdminLayoutContent
 * 実際のダッシュボードコンテンツ
 */
function AdminLayoutContent() {
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
    return resolveActiveMenuHref({ currentPath: location.pathname, menuItems });
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
      const selectedOption = ADMIN_SPLIT_PANEL_OPTIONS.find(
        (option) => option.value === screenValue,
      );
      const component = ADMIN_SPLIT_PANEL_COMPONENTS[screenValue];
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
  const RightPanelComponent = state.rightPanel?.component;
  const handleToggleMenu = useCallback(() => {
    setIsMenuExpanded((prev) => !prev);
  }, []);

  return (
    <Stack component="section" sx={PAGE_CONTAINER_SX}>
      <PageSection
        variant="plain"
        layoutVariant="dashboard"
        className="gap-0"
        sx={{ px: 0 }}
      >
        <AdminHeader
          title={activeMenuItem?.primaryLabel ?? undefined}
          subtitle={activeMenuItem?.description ?? undefined}
        >
          <MemoizedAdminHeaderActions
            isMobile={isMobile}
            isMenuExpanded={isMenuExpanded}
            onToggleMenu={handleToggleMenu}
            menuItems={menuItems}
            activeMenuHref={activeMenuHref}
            onSelect={handleSelect}
            activeMenuItem={activeMenuItem}
            splitMode={state.mode}
            onToggleSplitMode={handleToggleSplitMode}
          />
        </AdminHeader>
      </PageSection>
      <PageSection
        variant="surface"
        layoutVariant="dashboard"
        sx={SURFACE_SECTION_SX}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          sx={{ width: "100%", flex: 1 }}
        >
          {!isMobile && (
            <AdminContextRail
              menuItems={menuItems}
              activeMenuHref={activeMenuHref}
              activeMenuItem={activeMenuItem}
              onSelect={handleSelect}
            />
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {isSplitMode ? (
              <SplitLayoutPanels
                rightPanelTitle={state.rightPanel?.title}
                selectedScreen={selectedScreen}
                onCloseRightPanel={handleCloseRightPanel}
                onScreenChange={handleScreenChange}
                RightPanelComponent={RightPanelComponent}
              />
            ) : (
              <SinglePanelContent />
            )}
          </Box>
        </Stack>
      </PageSection>
    </Stack>
  );
}

export default function AdminLayout() {
  return (
    <SplitViewProvider>
      <AdminLayoutContent />
    </SplitViewProvider>
  );
}
