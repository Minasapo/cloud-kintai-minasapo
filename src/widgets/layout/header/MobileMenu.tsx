import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import ViewListIcon from "@mui/icons-material/ViewList";
import MobileMenuView, { MobileMenuItem } from "@shared/ui/header/MobileMenu";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useMobileDrawer } from "@/hooks/useMobileDrawer";

interface MobileMenuProps {
  pathName: string;
}

export default function MobileMenu({ pathName }: MobileMenuProps) {
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
        label: "稼働統計",
        icon: <QueryStatsIcon />,
        onClick: () => navigate("/attendance/stats"),
      },
      {
        label: "日報",
        icon: <ViewListIcon />,
        onClick: () => navigate("/attendance/report"),
      },
      {
        label: "個人設定",
        icon: <AccountCircleIcon />,
        onClick: () => navigate("/profile"),
      },
    ],
    [navigate]
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
