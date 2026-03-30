import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import MenuIcon from "@mui/icons-material/Menu";
import {
  Box,
  Collapse,
  Container,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { memo, useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

type AdminMasterMenuItem = {
  name: string;
  path: string;
  children?: readonly AdminMasterMenuItem[];
};

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

const MASTER_MENU_ITEMS: readonly AdminMasterMenuItem[] = [
  { name: "集計対象月", path: "/admin/master/job_term" },
  { name: "カレンダー設定", path: "/admin/master/holiday_calendar" },
  { name: "テーマ", path: "/admin/master/theme" },
  { name: "シフト", path: "/admin/master/shift" },
  { name: "ワークフロー", path: "/admin/master/workflow" },
  {
    name: "勤怠",
    path: "/admin/master/feature_management",
    children: [
      { name: "勤務時間", path: "/admin/master/feature_management/working_time" },
      { name: "午前/午後休", path: "/admin/master/feature_management/am_pm_holiday" },
      { name: "出勤モード", path: "/admin/master/feature_management/office_mode" },
      {
        name: "稼働統計",
        path: "/admin/master/feature_management/attendance_statistics",
      },
      {
        name: "残業確認",
        path: "/admin/master/feature_management/overtime_confirmation",
      },
      { name: "外部リンク", path: "/admin/master/feature_management/links" },
      { name: "打刻理由", path: "/admin/master/feature_management/reasons" },
      { name: "クイック入力", path: "/admin/master/feature_management/quick_input" },
      { name: "特別休暇", path: "/admin/master/feature_management/special_holiday" },
      { name: "欠勤", path: "/admin/master/feature_management/absent" },
    ],
  },
  { name: "開発者", path: "/admin/master/developer" },
  { name: "打刻画面アナウンス", path: "/admin/master/time_recorder_announcement" },
  { name: "エクスポート", path: "/admin/master/export" },
];

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
  const [settingsOpen, setSettingsOpen] = React.useState(true);

  const menuBoxList = useMemo(
    () =>
      MASTER_MENU_ITEMS.map((item) => {
        const selected =
          location.pathname === item.path ||
          location.pathname.startsWith(item.path + "/");

        if (item.children) {
          return (
            <Box key={item.path}>
              <ListItemButton
                sx={{ p: 2 }}
                onClick={() => setSettingsOpen((current) => !current)}
                selected={selected}
              >
                <ListItemText primary={item.name} />
                {settingsOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse in={settingsOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.children.map((child) => (
                    <ListItemButton
                      key={child.path}
                      sx={{ p: 1, pl: 4 }}
                      onClick={() => {
                        navigate(child.path);
                        if (!isMdUp) onNavigateComplete();
                      }}
                      selected={location.pathname === child.path}
                    >
                      <ListItemText primary={child.name} />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            </Box>
          );
        }

        return (
          <Box key={item.path}>
            <ListItemButton
              sx={{ p: 2 }}
              onClick={() => {
                navigate(item.path);
                if (!isMdUp) onNavigateComplete();
              }}
              selected={selected}
            >
              <ListItemText primary={item.name} />
            </ListItemButton>
          </Box>
        );
      }),
    [isMdUp, location.pathname, navigate, onNavigateComplete, settingsOpen],
  );

  return (
    <Box sx={DRAWER_BOX_SX} role="presentation">
      <List sx={DRAWER_LIST_SX}>{menuBoxList}</List>
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
        {/* Mobile menu button */}
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

        {/* Sidebar: permanent on md+, drawer on mobile */}
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
