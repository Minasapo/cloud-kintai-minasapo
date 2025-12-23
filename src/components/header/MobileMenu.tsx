import LogoutIcon from "@mui/icons-material/Logout";
import ViewListIcon from "@mui/icons-material/ViewList";
import { useTheme } from "@mui/material/styles";
import MobileMenuView, { MobileMenuItem } from "@shared/ui/header/MobileMenu";
import { useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { designTokenVar } from "@/shared/designSystem";
import { AuthContext } from "../../context/AuthContext";
import { useMobileDrawer } from "../../hooks/useMobileDrawer";

interface MobileMenuProps {
  pathName: string;
}

export default function MobileMenu({ pathName }: MobileMenuProps) {
  const { signOut } = useContext(AuthContext);
  const navigate = useNavigate();
  const { isOpen, closeDrawer, openDrawer } = useMobileDrawer();
  const theme = useTheme();
  const signOutBackground = designTokenVar(
    "color.feedback.danger.base",
    theme.palette.error.main
  );
  const signOutText = designTokenVar(
    "color.brand.primary.contrastText",
    theme.palette.error.contrastText
  );

  const menuItems = useMemo<MobileMenuItem[]>(
    () => [
      {
        label: "勤怠一覧",
        icon: <ViewListIcon />,
        onClick: () => navigate("/attendance/list"),
      },
      {
        label: "日報",
        icon: <ViewListIcon />,
        onClick: () => navigate("/attendance/report"),
      },
      {
        label: "サインアウト",
        icon: <LogoutIcon sx={{ color: signOutText }} />,
        onClick: signOut,
        divider: true,
        styles: {
          backgroundColor: signOutBackground,
          color: signOutText,
        },
      },
    ],
    [navigate, signOut, signOutBackground, signOutText]
  );

  if (pathName === "/login") return null;

  return (
    <MobileMenuView
      menuItems={menuItems}
      isOpen={isOpen}
      onOpen={openDrawer}
      onClose={closeDrawer}
    />
  );
}
