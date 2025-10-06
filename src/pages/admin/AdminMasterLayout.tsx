import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
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
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import CommonBreadcrumbs from "@/components/common/CommonBreadcrumbs";

export default function AdminMasterLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  // initialize from localStorage
  useEffect(() => {
    try {
      const v = localStorage.getItem("adminSidebarCollapsed");
      if (v !== null) setSidebarCollapsed(v === "true");
      const s = localStorage.getItem("adminSettingsOpen");
      if (s !== null) setSettingsOpen(s === "true");
    } catch (e) {
      // ignore
    }
  }, []);

  // persist changes
  useEffect(() => {
    try {
      localStorage.setItem(
        "adminSidebarCollapsed",
        sidebarCollapsed ? "true" : "false"
      );
    } catch (e) {}
  }, [sidebarCollapsed]);
  useEffect(() => {
    try {
      localStorage.setItem(
        "adminSettingsOpen",
        settingsOpen ? "true" : "false"
      );
    } catch (e) {}
  }, [settingsOpen]);

  const menuList = [
    { name: "集計対象月", path: "/admin/master/job_term" },
    { name: "休日カレンダー", path: "/admin/master/holiday_calendar" },
    {
      name: "勤怠",
      path: "/admin/master/feature_management",
      children: [
        {
          name: "勤務時間",
          path: "/admin/master/feature_management/working_time",
        },
        {
          name: "午前/午後休",
          path: "/admin/master/feature_management/am_pm_holiday",
        },
        {
          name: "出勤モード",
          path: "/admin/master/feature_management/office_mode",
        },
        { name: "外部リンク", path: "/admin/master/feature_management/links" },
        { name: "打刻理由", path: "/admin/master/feature_management/reasons" },
        {
          name: "クイック入力",
          path: "/admin/master/feature_management/quick_input",
        },
        {
          name: "特別休暇",
          path: "/admin/master/feature_management/special_holiday",
        },
        { name: "欠勤", path: "/admin/master/feature_management/absent" },
      ],
    },
  ];

  const menuBoxList = menuList.map((item, index) => {
    const selected =
      location.pathname === item.path ||
      location.pathname.startsWith(item.path + "/");
    if (item.children) {
      return (
        <Box key={index}>
          <ListItemButton
            sx={{ p: 2 }}
            onClick={() => setSettingsOpen((s: boolean) => !s)}
            selected={selected}
          >
            <ListItemText primary={item.name} />
            {settingsOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={settingsOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children.map((c, i) => (
                <ListItemButton
                  key={i}
                  sx={{ p: 1, pl: 4 }}
                  onClick={() => {
                    navigate(c.path);
                    if (!isMdUp) setMobileOpen(false);
                  }}
                  selected={location.pathname === c.path}
                >
                  <ListItemText primary={c.name} />
                </ListItemButton>
              ))}
            </List>
          </Collapse>
        </Box>
      );
    }

    return (
      <Box key={index}>
        <ListItemButton
          sx={{ p: 2 }}
          onClick={() => {
            navigate(item.path);
            if (!isMdUp) setMobileOpen(false);
          }}
          selected={selected}
        >
          <ListItemText primary={item.name} />
        </ListItemButton>
      </Box>
    );
  });

  const drawerContent = (
    <Box
      sx={{
        width: sidebarCollapsed ? 72 : 260,
        p: 1,
        transition: "width 200ms",
      }}
      role="presentation"
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: sidebarCollapsed ? "center" : "flex-end",
          mb: 1,
        }}
      >
        <Tooltip
          title={sidebarCollapsed ? "メニューを開く" : "メニューを折りたたむ"}
        >
          <IconButton
            size="small"
            onClick={() => setSidebarCollapsed((s) => !s)}
          >
            {sidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
          </IconButton>
        </Tooltip>
      </Box>
      <List>{menuBoxList}</List>
    </Box>
  );

  return (
    <Container maxWidth="xl">
      <Stack direction="row" sx={{ height: 1, pt: 2 }}>
        {/* Mobile menu button */}
        {!isMdUp && (
          <Box sx={{ position: "absolute", left: 16, top: 12 }}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={() => setMobileOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        )}

        {/* Sidebar: permanent on md+, drawer on mobile */}
        {isMdUp ? (
          <Box
            sx={{
              width: sidebarCollapsed ? 72 : 260,
              pr: 2,
              transition: "width 200ms",
            }}
          >
            {drawerContent}
          </Box>
        ) : (
          <Drawer
            anchor="left"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
          >
            {drawerContent}
          </Drawer>
        )}

        <Box sx={{ flexGrow: 2 }}>
          <Stack spacing={1} sx={{ px: 5 }}>
            <Box>
              <CommonBreadcrumbs
                items={[{ label: "TOP", href: "/" }]}
                current="マスタ管理"
              />
            </Box>
            <Box>
              <Outlet />
            </Box>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}
