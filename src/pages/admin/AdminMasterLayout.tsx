import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import MenuIcon from "@mui/icons-material/Menu";
import {
  Box,
  Chip,
  Collapse,
  Container,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { memo, useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import type { AdminSettingsCategoryKey } from "@/features/admin/layout/model/adminSettingsNavigation";
import {
  findAdminSettingsItemByPath,
  getAdminSettingsNavigationGroups,
  resolveAdminSettingsCategory,
} from "@/features/admin/layout/model/adminSettingsNavigation";

const DRAWER_BOX_SX = {
  width: 260,
  p: 1.25,
  transition: "width 200ms",
  bgcolor: "transparent",
} as const;

const DRAWER_LIST_SX = {
  borderRadius: "24px",
  border: "1px solid rgba(226,232,240,0.85)",
  bgcolor: "#ffffff",
  boxShadow: "0 24px 48px -36px rgba(15,23,42,0.35)",
  overflow: "hidden",
} as const;

const MASTER_MENU_GROUPS = getAdminSettingsNavigationGroups();

const createCategoryOpenState = (activeCategoryKey: AdminSettingsCategoryKey | null) =>
  Object.fromEntries(
    MASTER_MENU_GROUPS.map((group) => [group.key, group.key === activeCategoryKey]),
  ) as Record<AdminSettingsCategoryKey, boolean>;

const SettingsContextHeader = memo(function SettingsContextHeader() {
  const location = useLocation();
  const currentItem = findAdminSettingsItemByPath(location.pathname);
  const currentCategory = resolveAdminSettingsCategory(location.pathname);

  if (!currentItem || !currentCategory) {
    return (
      <Stack spacing={1.25}>
        <Typography
          component="h1"
          sx={{
            m: 0,
            fontSize: { xs: "1.8rem", md: "2.15rem" },
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            color: "#020617",
          }}
        >
          設定
        </Typography>
        <Typography sx={{ color: "#64748b", lineHeight: 1.85, maxWidth: "72ch" }}>
          業務ごとに設定を整理しています。カテゴリから必要な項目を選んで詳細を確認してください。
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={1.25}>
      <Chip
        label={currentCategory.title}
        sx={{
          alignSelf: "flex-start",
          bgcolor: "rgba(16,185,129,0.12)",
          color: "#047857",
          fontWeight: 700,
        }}
      />
      <Typography
        component="h1"
        sx={{
          m: 0,
          fontSize: { xs: "1.8rem", md: "2.1rem" },
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: "-0.03em",
          color: "#020617",
        }}
      >
        {currentItem.title}
      </Typography>
      <Typography sx={{ color: "#64748b", lineHeight: 1.8, maxWidth: "72ch" }}>
        {currentItem.description}
      </Typography>
    </Stack>
  );
});

const MasterLayoutContent = memo(function MasterLayoutContent() {
  return (
    <Box sx={{ flexGrow: 2, minWidth: 0 }}>
      <Stack
        spacing={1}
        sx={{
          borderRadius: "28px",
          border: "1px solid rgba(226,232,240,0.8)",
          bgcolor: "#ffffff",
          boxShadow: "0 28px 60px -42px rgba(15,23,42,0.35)",
          px: { xs: 2, md: 3 },
          py: { xs: 2, md: 3 },
        }}
      >
        <SettingsContextHeader />
        <Box>
          <Outlet />
        </Box>
      </Stack>
    </Box>
  );
});

type MasterLayoutNavigationProps = {
  isMdUp: boolean;
  onNavigateComplete: () => void;
};

const MasterLayoutNavigation = memo(function MasterLayoutNavigation({
  isMdUp,
  onNavigateComplete,
}: MasterLayoutNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const activeCategoryKey = resolveAdminSettingsCategory(location.pathname)?.key ?? null;
  const [openGroups, setOpenGroups] = React.useState<Record<AdminSettingsCategoryKey, boolean>>(
    () => createCategoryOpenState(activeCategoryKey),
  );

  const menuBoxList = useMemo(
    () =>
      MASTER_MENU_GROUPS.map((group) => {
        const isOpen = openGroups[group.key] || activeCategoryKey === group.key;
        const isActiveGroup = activeCategoryKey === group.key;

        return (
          <Box key={group.key}>
            <ListItemButton
              sx={{
                p: 2,
                alignItems: "flex-start",
                borderBottom: isOpen ? "1px solid rgba(241,245,249,0.85)" : "none",
              }}
              onClick={() =>
                setOpenGroups((current) => ({
                  ...current,
                  [group.key]: !current[group.key],
                }))
              }
              selected={isActiveGroup}
            >
              <Box sx={{ flex: 1 }}>
                <ListItemText
                  primary={group.title}
                  secondary={group.description}
                  secondaryTypographyProps={{
                    sx: { mt: 0.5, color: "rgba(100,116,139,0.92)", lineHeight: 1.5 },
                  }}
                />
              </Box>
              {isOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={isOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding sx={{ py: 1 }}>
                {group.items.map((item) => (
                  <ListItemButton
                    key={item.path}
                    sx={{
                      p: 1.25,
                      pl: 3,
                      pr: 2,
                      mx: 1,
                      my: 0.25,
                      borderRadius: "14px",
                    }}
                    onClick={() => {
                      navigate(item.path);
                      if (!isMdUp) onNavigateComplete();
                    }}
                    selected={location.pathname === item.path}
                  >
                    <ListItemText
                      primary={item.title}
                      secondary={item.description}
                      secondaryTypographyProps={{
                        sx: { mt: 0.5, color: "rgba(100,116,139,0.92)", lineHeight: 1.45 },
                      }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
          </Box>
        );
      }),
    [activeCategoryKey, isMdUp, location.pathname, navigate, onNavigateComplete, openGroups],
  );

  return (
    <Box sx={DRAWER_BOX_SX} role="presentation">
      <List sx={DRAWER_LIST_SX}>
        <Box sx={{ px: 2, pt: 2, pb: 1 }}>
          <Typography
            sx={{
              fontSize: "0.82rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#64748b",
            }}
          >
            設定
          </Typography>
        </Box>
        {menuBoxList}
      </List>
    </Box>
  );
});

export default function AdminMasterLayout() {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <Container
      maxWidth={false}
      sx={{ maxWidth: "1360px !important", pt: 1, px: { xs: 1.5, sm: 2.5 } }}
    >
      <Stack direction="row" sx={{ height: 1, pt: 1, gap: 2 }}>
        {!isMdUp && (
          <Box sx={{ position: "absolute", left: 16, top: 12 }}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={() => setMobileOpen(true)}
              sx={{
                borderRadius: "9999px",
                border: "1px solid rgba(148,163,184,0.28)",
                bgcolor: "rgba(255,255,255,0.88)",
              }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        )}

        {isMdUp ? (
          <Box
            sx={{
              width: 260,
              transition: "width 200ms",
            }}
          >
            <MasterLayoutNavigation
              isMdUp={isMdUp}
              onNavigateComplete={() => setMobileOpen(false)}
            />
          </Box>
        ) : (
          <Drawer
            anchor="left"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
          >
            <MasterLayoutNavigation
              isMdUp={isMdUp}
              onNavigateComplete={() => setMobileOpen(false)}
            />
          </Drawer>
        )}

        <MasterLayoutContent />
      </Stack>
    </Container>
  );
}
