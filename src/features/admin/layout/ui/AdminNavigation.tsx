import { getAdminSettingsNavigationGroups } from "@features/admin/layout/model/adminSettingsNavigation";
import type { UseHeaderMenuResult } from "@features/admin/layout/model/useHeaderMenu";
import NavItemPanelMenu from "@features/admin/layout/ui/NavItemPanelMenu";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import { Box, Divider, Stack, Tooltip, Typography } from "@mui/material";
import { AppButton } from "@shared/ui/button";
import React, { memo, useCallback, useState } from "react";

const MENU_ICONS: Record<string, React.ReactElement> = {
  "/admin": <DashboardOutlinedIcon fontSize="small" />,
  "/admin/attendances": <AccessTimeOutlinedIcon fontSize="small" />,
  "/admin/staff": <PeopleOutlinedIcon fontSize="small" />,
  "/admin/shift": <EventNoteOutlinedIcon fontSize="small" />,
  "/admin/shift-plan": <CalendarMonthOutlinedIcon fontSize="small" />,
  "/admin/daily-report": <AssignmentOutlinedIcon fontSize="small" />,
  "/admin/workflow": <TaskAltOutlinedIcon fontSize="small" />,
  "/admin/logs": <HistoryOutlinedIcon fontSize="small" />,
  "/admin/master": <SettingsOutlinedIcon fontSize="small" />,
};

const SETTINGS_HREF = "/admin/master";
const SETTINGS_NAV_GROUPS = getAdminSettingsNavigationGroups();
const NAV_COLLAPSED_KEY = "admin-nav-collapsed";

const RAIL_ITEM_CONTAINER_SX = {
  display: "flex",
  alignItems: "center",
  gap: 0.5,
  "&:hover .rail-panel-menu-trigger, &:focus-within .rail-panel-menu-trigger": {
    visibility: "visible",
  },
} as const;

const SETTINGS_EXPAND_BUTTON_SX = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 26,
  height: 26,
  borderRadius: "6px",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  color: "rgb(100 116 139)",
  fontSize: "0.75rem",
  "&:hover": { backgroundColor: "rgba(148,163,184,0.15)" },
} as const;

const COLLAPSE_TOGGLE_SX = (collapsed: boolean) =>
  ({
    display: "flex",
    alignItems: "center",
    justifyContent: collapsed ? "center" : "flex-end",
    width: "100%",
    height: 32,
    borderRadius: "10px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    color: "rgb(100 116 139)",
    transition: "background-color 150ms ease",
    "&:hover": { backgroundColor: "rgba(148,163,184,0.15)" },
  }) as const;

const RAIL_ITEM_BUTTON_SX = (isActive: boolean, collapsed: boolean) =>
  ({
    flex: 1,
    justifyContent: collapsed ? "center" : "flex-start",
    textTransform: "none",
    borderRadius: "10px",
    px: collapsed ? 0 : 1.25,
    py: 1,
    minWidth: 0,
    color: isActive ? "rgb(6 95 70)" : "rgb(30 41 59)",
    backgroundColor: isActive ? "rgba(16,185,129,0.14)" : "transparent",
    fontWeight: isActive ? 700 : 500,
    "&:hover": {
      backgroundColor: isActive
        ? "rgba(16,185,129,0.2)"
        : "rgba(148,163,184,0.12)",
    },
  }) as const;

function useNavCollapsed() {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(NAV_COLLAPSED_KEY) === "true";
    } catch {
      return false;
    }
  });

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(NAV_COLLAPSED_KEY, String(next));
      } catch {
        // storage unavailable
      }
      return next;
    });
  }, []);

  return { collapsed, toggle };
}

const RailItemButton = memo(function RailItemButton({
  isActive,
  primaryLabel,
  icon,
  collapsed,
  onClick,
}: {
  isActive: boolean;
  primaryLabel: string;
  icon?: React.ReactElement;
  collapsed: boolean;
  onClick: () => void;
}) {
  const button = (
    <AppButton
      variant="ghost"
      tone="neutral"
      onClick={onClick}
      sx={RAIL_ITEM_BUTTON_SX(isActive, collapsed)}
    >
      {icon && (
        <Box
          component="span"
          sx={{ display: "flex", alignItems: "center", flexShrink: 0 }}
        >
          {icon}
        </Box>
      )}
      {!collapsed && (
        <Box component="span" sx={{ ml: icon ? 1 : 0 }}>
          {primaryLabel}
        </Box>
      )}
    </AppButton>
  );

  if (collapsed) {
    return (
      <Tooltip title={primaryLabel} placement="right" arrow>
        {button}
      </Tooltip>
    );
  }
  return button;
});

export interface AdminNavigationProps {
  menuItems: UseHeaderMenuResult;
  activeMenuHref: string;
  currentPath: string;
  onSelect: (itemHref: string) => void;
  compact?: boolean;
}

const SettingsNavItem = memo(function SettingsNavItem({
  isActive,
  primaryLabel,
  icon,
  navCollapsed,
  currentPath,
  onSelect,
}: {
  isActive: boolean;
  primaryLabel: string;
  icon: React.ReactElement | undefined;
  navCollapsed: boolean;
  currentPath: string;
  onSelect: (path: string) => void;
}) {
  const [settingsExpanded, setSettingsExpanded] = useState(isActive);

  React.useEffect(() => {
    if (isActive) setSettingsExpanded(true);
  }, [isActive]);

  const toggleExpanded = useCallback(
    () => setSettingsExpanded((prev) => !prev),
    [],
  );

  return (
    <React.Fragment>
      <Box sx={RAIL_ITEM_CONTAINER_SX}>
        <RailItemButton
          isActive={isActive}
          primaryLabel={primaryLabel}
          icon={icon}
          collapsed={navCollapsed}
          onClick={() => onSelect(SETTINGS_HREF)}
        />
        {!navCollapsed && (
          <Box
            component="button"
            type="button"
            aria-label={
              settingsExpanded ? "設定メニューを閉じる" : "設定メニューを開く"
            }
            onClick={toggleExpanded}
            sx={{
              ...SETTINGS_EXPAND_BUTTON_SX,
              transition: "transform 160ms ease",
              transform: settingsExpanded ? "rotate(0deg)" : "rotate(-90deg)",
            }}
          >
            ▾
          </Box>
        )}
        {!navCollapsed && (
          <NavItemPanelMenu
            href={SETTINGS_HREF}
            label={primaryLabel}
            className="rail-panel-menu-trigger"
            sx={{ visibility: "hidden" }}
          />
        )}
      </Box>

      {settingsExpanded && !navCollapsed && (
        <Box
          sx={{ ml: 1, pl: 1.25, borderLeft: "2px solid rgba(16,185,129,0.2)" }}
        >
          {SETTINGS_NAV_GROUPS.map((group) => (
            <Box key={group.key} sx={{ mb: 1.5 }}>
              <Typography
                sx={{
                  fontSize: "0.63rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  color: "rgb(148 163 184)",
                  textTransform: "uppercase",
                  px: 0.5,
                  pb: 0.5,
                }}
              >
                {group.title}
              </Typography>
              {group.items.map((subItem) => {
                const isSubActive = currentPath === subItem.path;
                return (
                  <AppButton
                    key={subItem.path}
                    variant="ghost"
                    tone="neutral"
                    onClick={() => onSelect(subItem.path)}
                    sx={{
                      display: "flex",
                      width: "100%",
                      justifyContent: "flex-start",
                      textTransform: "none",
                      borderRadius: "7px",
                      px: 1,
                      py: 0.55,
                      minHeight: 0,
                      fontSize: "0.83rem",
                      lineHeight: 1.4,
                      color: isSubActive ? "rgb(6 95 70)" : "rgb(51 65 85)",
                      backgroundColor: isSubActive
                        ? "rgba(16,185,129,0.12)"
                        : "transparent",
                      fontWeight: isSubActive ? 700 : 400,
                      "&:hover": {
                        backgroundColor: isSubActive
                          ? "rgba(16,185,129,0.18)"
                          : "rgba(148,163,184,0.1)",
                      },
                    }}
                  >
                    {subItem.title}
                  </AppButton>
                );
              })}
            </Box>
          ))}
        </Box>
      )}
    </React.Fragment>
  );
});

export const AdminNavigation = memo(function AdminNavigation({
  menuItems,
  activeMenuHref,
  currentPath,
  onSelect,
  compact = false,
}: AdminNavigationProps) {
  const { collapsed: navCollapsed, toggle: toggleNavCollapsed } =
    useNavCollapsed();

  return (
    <Stack
      spacing={navCollapsed ? 1 : 2}
      sx={{
        width: compact ? "100%" : navCollapsed ? 64 : 280,
        minWidth: compact ? "auto" : navCollapsed ? 64 : 280,
        borderRight: compact ? "none" : "1px solid rgba(226,232,240,0.85)",
        background:
          "linear-gradient(180deg, rgba(248,250,252,0.95) 0%, rgba(255,255,255,0.9) 100%)",
        p: navCollapsed ? 1 : 2,
        overflowY: "auto",
        overflowX: "hidden",
        transition:
          "width 200ms ease, min-width 200ms ease, padding 200ms ease",
      }}
    >
      {!compact && (
        <Tooltip
          title={navCollapsed ? "メニューを展開" : "メニューを折りたたむ"}
          placement="right"
          arrow
        >
          <Box
            component="button"
            type="button"
            aria-label={
              navCollapsed ? "メニューを展開" : "メニューを折りたたむ"
            }
            onClick={toggleNavCollapsed}
            sx={COLLAPSE_TOGGLE_SX(navCollapsed)}
          >
            {navCollapsed ? (
              <ChevronRightIcon fontSize="small" />
            ) : (
              <ChevronLeftIcon fontSize="small" />
            )}
          </Box>
        </Tooltip>
      )}

      {!navCollapsed && !compact && <Divider flexItem />}

      <Stack spacing={1} sx={{ flex: 1 }}>
        {menuItems.map((item) => {
          const isActive = item.href === activeMenuHref;
          const icon = MENU_ICONS[item.href];

          if (item.href === SETTINGS_HREF) {
            return (
              <SettingsNavItem
                key={item.href}
                isActive={isActive}
                primaryLabel={item.primaryLabel}
                icon={icon}
                navCollapsed={navCollapsed}
                currentPath={currentPath}
                onSelect={onSelect}
              />
            );
          }

          return (
            <Box key={item.href} sx={RAIL_ITEM_CONTAINER_SX}>
              <RailItemButton
                isActive={isActive}
                primaryLabel={item.primaryLabel}
                icon={icon}
                collapsed={navCollapsed}
                onClick={() => onSelect(item.href)}
              />
              {!navCollapsed && (
                <NavItemPanelMenu
                  href={item.href}
                  label={item.primaryLabel}
                  className="rail-panel-menu-trigger"
                  sx={{ visibility: "hidden" }}
                />
              )}
            </Box>
          );
        })}
      </Stack>
    </Stack>
  );
});
