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
import { type ReactElement, useContext } from "react";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "../../context/AuthContext";
import { useMobileDrawer } from "../../hooks/useMobileDrawer";
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
              sx={item.styles || {}}
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
    {
      label: "勤怠一覧",
      path: "/attendance/list",
      icon: <ViewListIcon />,
      onClick: () => navigate("/attendance/list"),
    },
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
      </Drawer>
    </Box>
  );
}
