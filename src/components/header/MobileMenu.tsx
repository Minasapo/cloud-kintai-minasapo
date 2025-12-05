import LogoutIcon from "@mui/icons-material/Logout";
import ViewListIcon from "@mui/icons-material/ViewList";
import MobileMenuView, {
  MobileMenuItem,
} from "@shared/ui/header/MobileMenu";
import { useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { theme } from "@/lib/theme";

import { AuthContext } from "../../context/AuthContext";
import { useMobileDrawer } from "../../hooks/useMobileDrawer";

interface MobileMenuProps {
  pathName: string;
}

export default function MobileMenu({ pathName }: MobileMenuProps) {
  const { signOut } = useContext(AuthContext);
  const navigate = useNavigate();
  const { isOpen, closeDrawer, openDrawer } = useMobileDrawer();

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
        icon: <LogoutIcon sx={{ color: theme.palette.error.contrastText }} />,
        onClick: signOut,
        divider: true,
        styles: {
          backgroundColor: theme.palette.error.main,
          color: theme.palette.error.contrastText,
        },
      },
    ],
    [navigate, signOut]
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
