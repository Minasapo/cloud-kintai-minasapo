import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import ViewListIcon from "@mui/icons-material/ViewList";
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { type ReactElement, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "../../context/AuthContext";
import { useMobileDrawer } from "../../hooks/useMobileDrawer";
import { StaffRole } from "../../hooks/useStaffs/useStaffs";
import { theme } from "../../lib/theme";

// 型定義
interface MenuItem {
  label: string;
  path?: string;
  icon: ReactElement;
  onClick?: () => void;
  divider?: boolean;
  styles?: object;
}

interface MobileMenuProps {
  pathName: string;
}

// メニューリストコンポーネント
const MenuList = ({
  menuItems,
  onClose,
}: {
  menuItems: MenuItem[];
  onClose: () => void;
}) => (
  <Box
    sx={{ width: 250 }}
    role="presentation"
    onClick={onClose}
    onKeyDown={onClose}
  >
    <List>
      {menuItems.map((item, index) => (
        <div key={index}>
          <ListItem disablePadding>
            <ListItemButton
              sx={{
                ...(item.styles || {}),
                "&:hover, &:focus": {
                  backgroundColor: "transparent",
                },
              }}
              onClick={item.onClick || (() => {})}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
          {item.divider && <Divider />}
        </div>
      ))}
    </List>
    <Divider />
  </Box>
);

// メインコンポーネント
export default function MobileMenu({ pathName }: MobileMenuProps) {
  const { signOut } = useContext(AuthContext);
  const navigate = useNavigate();
  const { isOpen, closeDrawer, openDrawer } = useMobileDrawer();

  // メニュー項目の設定
  const menuItems: MenuItem[] = [
    /*
    {
      label: "ワークフロー",
      path: "/workflow",
      icon: <ViewListIcon />,
      onClick: () => navigate("/workflow"),
    },
    */
    {
      label: "勤怠一覧",
      path: "/attendance/list",
      icon: <ViewListIcon />,
      onClick: () => navigate("/attendance/list"),
    },
    // 設定は管理の後に表示するのでここでは定義しない
    {
      label: "サインアウト",
      icon: <LogoutIcon sx={{ color: theme.palette.error.contrastText }} />,
      onClick: signOut,
      divider: true,
      styles: {
        backgroundColor: theme.palette.error.main,
        color: theme.palette.error.contrastText,
      },
    },
  ];

  // 管理メニュー（管理者のみ表示）
  const adminItems: MenuItem[] = [
    {
      label: "スタッフ管理",
      path: "/admin/staff",
      icon: <ViewListIcon />,
      onClick: () => navigate("/admin/staff"),
    },
    {
      label: "勤怠管理",
      path: "/admin/attendances",
      icon: <ViewListIcon />,
      onClick: () => navigate("/admin/attendances"),
    },
    {
      label: "ワークフロー管理",
      path: "/admin/workflow",
      icon: <ViewListIcon />,
      onClick: () => navigate("/admin/workflow"),
    },
  ];

  const [adminOpen, setAdminOpen] = useState(false);
  const toggleAdmin = () => setAdminOpen((s) => !s);

  // ログインページでは表示しない
  if (pathName === "/login") return null;

  return (
    <Box
      sx={{
        textAlign: "right",
        display: { xs: "block", md: "none" },
      }}
    >
      <IconButton onClick={openDrawer}>
        <MenuIcon
          sx={{
            color: "white",
          }}
        />
      </IconButton>
      <Drawer anchor="right" open={isOpen} onClose={closeDrawer}>
        <MenuList menuItems={menuItems} onClose={closeDrawer} />

        {/* 管理セクション（管理者のみ） */}
        {(() => {
          const { isCognitoUserRole } = useContext(AuthContext);
          if (!isCognitoUserRole) return null;
          const canViewAdmin =
            isCognitoUserRole(StaffRole.ADMIN) ||
            isCognitoUserRole(StaffRole.STAFF_ADMIN);
          if (!canViewAdmin) return null;

          return (
            <Box sx={{ width: 250 }}>
              <List>
                <ListItem disablePadding>
                  <ListItemButton onClick={toggleAdmin} sx={{ height: 48 }}>
                    <ListItemText primary="管理" />
                    {adminOpen ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>
                {adminOpen &&
                  adminItems.map((item, idx) => (
                    <ListItem key={idx} disablePadding>
                      <ListItemButton
                        onClick={() => {
                          item.onClick && item.onClick();
                          closeDrawer();
                        }}
                        sx={{
                          pl: 4,
                          height: 48,
                          "&:hover, &:focus": {
                            backgroundColor: "transparent",
                          },
                        }}
                      >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.label} />
                      </ListItemButton>
                    </ListItem>
                  ))}
              </List>
              <Divider />
              {/* 管理の後に設定を表示 */}
              <List>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => {
                      navigate("/admin/master");
                      closeDrawer();
                    }}
                    sx={{
                      height: 48,
                      "&:hover, &:focus": { backgroundColor: "transparent" },
                    }}
                  >
                    <ListItemIcon>
                      <ViewListIcon />
                    </ListItemIcon>
                    <ListItemText primary="設定" />
                  </ListItemButton>
                </ListItem>
              </List>
            </Box>
          );
        })()}
      </Drawer>
    </Box>
  );
}
