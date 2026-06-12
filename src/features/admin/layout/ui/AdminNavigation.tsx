import { getAdminSettingsNavigationGroups } from "@features/admin/layout/model/adminSettingsNavigation";
import type {
  AdminHeaderMenuItem,
  UseHeaderMenuResult,
} from "@features/admin/layout/model/useHeaderMenu";
import NavItemPanelMenu from "@features/admin/layout/ui/NavItemPanelMenu";
import { Box, Divider, Stack, Typography } from "@mui/material";
import { AppButton } from "@shared/ui/button";
import React, { memo } from "react";

const SETTINGS_HREF = "/admin/master";
const SETTINGS_NAV_GROUPS = getAdminSettingsNavigationGroups();

const RAIL_ITEM_CONTAINER_SX = {
  display: "flex",
  alignItems: "center",
  gap: 0.5,
  "&:hover .rail-panel-menu-trigger, &:focus-within .rail-panel-menu-trigger": {
    visibility: "visible",
  },
} as const;

const RAIL_ITEM_BUTTON_SX = (isActive: boolean) =>
  ({
    flex: 1,
    justifyContent: "space-between",
    textTransform: "none",
    borderRadius: "10px",
    px: 1.25,
    py: 1,
    color: isActive ? "rgb(6 95 70)" : "rgb(30 41 59)",
    backgroundColor: isActive ? "rgba(16,185,129,0.14)" : "transparent",
    fontWeight: isActive ? 700 : 500,
    "&:hover": {
      backgroundColor: isActive
        ? "rgba(16,185,129,0.2)"
        : "rgba(148,163,184,0.12)",
    },
  }) as const;

const RailItemButton = memo(function RailItemButton({
  isActive,
  primaryLabel,
  secondaryLabel,
  onClick,
}: {
  isActive: boolean;
  primaryLabel: string;
  secondaryLabel?: string;
  onClick: () => void;
}) {
  return (
    <AppButton
      variant="ghost"
      tone="neutral"
      onClick={onClick}
      sx={RAIL_ITEM_BUTTON_SX(isActive)}
    >
      <Box component="span">{primaryLabel}</Box>
      <Box component="span" sx={{ fontSize: "0.72rem", opacity: 0.75 }}>
        {secondaryLabel ?? ""}
      </Box>
    </AppButton>
  );
});

export interface AdminNavigationProps {
  menuItems: UseHeaderMenuResult;
  activeMenuHref: string;
  activeMenuItem: AdminHeaderMenuItem | null;
  currentPath: string;
  onSelect: (itemHref: string) => void;
  compact?: boolean;
}

export const AdminNavigation = memo(function AdminNavigation({
  menuItems,
  activeMenuHref,
  activeMenuItem,
  currentPath,
  onSelect,
  compact = false,
}: AdminNavigationProps) {
  const isSettingsActive = activeMenuHref === SETTINGS_HREF;
  const [settingsExpanded, setSettingsExpanded] =
    React.useState(isSettingsActive);

  React.useEffect(() => {
    if (isSettingsActive) {
      setSettingsExpanded(true);
    }
  }, [isSettingsActive]);

  return (
    <Stack
      spacing={2}
      sx={{
        width: compact ? "100%" : 280,
        minWidth: compact ? "auto" : 280,
        borderRight: compact ? "none" : "1px solid rgba(226,232,240,0.85)",
        background:
          "linear-gradient(180deg, rgba(248,250,252,0.95) 0%, rgba(255,255,255,0.9) 100%)",
        p: 2,
        overflowY: "auto",
      }}
    >
      <Stack spacing={0.5}>
        <Typography
          sx={{ fontSize: "1rem", fontWeight: 700, color: "rgb(15 23 42)" }}
        >
          {activeMenuItem?.primaryLabel ?? "カテゴリ"}
        </Typography>
        <Typography
          sx={{
            fontSize: "0.82rem",
            color: "rgb(100 116 139)",
            lineHeight: 1.6,
          }}
        >
          {activeMenuItem?.ctaLabel ?? "頻出操作へすばやく遷移できます。"}
        </Typography>
      </Stack>

      <Divider flexItem />

      <Stack spacing={1}>
        {menuItems.map((item) => {
          const isActive = item.href === activeMenuHref;

          if (item.href === SETTINGS_HREF) {
            return (
              <React.Fragment key={item.href}>
                <Box sx={RAIL_ITEM_CONTAINER_SX}>
                  <RailItemButton
                    isActive={isActive}
                    primaryLabel={item.primaryLabel}
                    secondaryLabel={item.secondaryLabel}
                    onClick={() => onSelect(item.href)}
                  />
                  <Box
                    component="button"
                    type="button"
                    aria-label={
                      settingsExpanded
                        ? "設定メニューを閉じる"
                        : "設定メニューを開く"
                    }
                    onClick={() => setSettingsExpanded((prev) => !prev)}
                    sx={{
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
                      transition: "transform 160ms ease",
                      transform: settingsExpanded
                        ? "rotate(0deg)"
                        : "rotate(-90deg)",
                      "&:hover": {
                        backgroundColor: "rgba(148,163,184,0.15)",
                      },
                    }}
                  >
                    ▾
                  </Box>
                  <NavItemPanelMenu
                    href={item.href}
                    label={item.primaryLabel}
                    className="rail-panel-menu-trigger"
                    sx={{ visibility: "hidden" }}
                  />
                </Box>

                {settingsExpanded && (
                  <Box
                    sx={{
                      ml: 1,
                      pl: 1.25,
                      borderLeft: "2px solid rgba(16,185,129,0.2)",
                    }}
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
                                color: isSubActive
                                  ? "rgb(6 95 70)"
                                  : "rgb(51 65 85)",
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
          }

          return (
            <Box key={item.href} sx={RAIL_ITEM_CONTAINER_SX}>
              <RailItemButton
                isActive={isActive}
                primaryLabel={item.primaryLabel}
                secondaryLabel={item.secondaryLabel}
                onClick={() => onSelect(item.href)}
              />
              <NavItemPanelMenu
                href={item.href}
                label={item.primaryLabel}
                className="rail-panel-menu-trigger"
                sx={{ visibility: "hidden" }}
              />
            </Box>
          );
        })}
      </Stack>
    </Stack>
  );
});
