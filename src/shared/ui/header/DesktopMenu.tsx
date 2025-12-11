import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Box,
  Button,
  Menu as MuiMenu,
  MenuItem as MuiMenuItem,
  Stack,
} from "@mui/material";
import Link from "@shared/ui/link/Link";
import { useState } from "react";

export type DesktopMenuItem = {
  label: string;
  href: string;
};

export interface DesktopMenuProps {
  pathName: string;
  menuItems: DesktopMenuItem[];
  adminMenuItems?: DesktopMenuItem[];
  settingsMenu?: DesktopMenuItem | null;
  showAdminMenu: boolean;
  showSettingsLink: boolean;
  onAdminNavigate?: (href: string) => void;
}

const DesktopMenu = ({
  pathName,
  menuItems,
  adminMenuItems = [],
  settingsMenu,
  showAdminMenu,
  showSettingsLink,
  onAdminNavigate,
}: DesktopMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);

  const handleAdminItemClick = (href: string) => {
    if (onAdminNavigate) {
      onAdminNavigate(href);
    } else {
      window.location.href = href;
    }
    handleClose();
  };

  return (
    <Box
      sx={{
        width: 1,
        height: 1,
        display: {
          xs: "none",
          md: "block",
        },
      }}
    >
      <Stack direction="row" spacing={0} sx={{ width: "auto", height: 1 }}>
        {menuItems.map((menu) => (
          <Box key={menu.href}>
            <Link
              label={menu.label}
              href={menu.href}
              sx={{
                display: "block",
                height: 1,
                lineHeight: "32px",
                px: 1,
                color: pathName === menu.href ? "#0FA85E" : "white",
                backgroundColor: pathName === menu.href ? "white" : "inherit",
                "&:hover, &:focus": {
                  backgroundColor: pathName === menu.href ? "white" : "inherit",
                  color: pathName === menu.href ? "#0FA85E" : "white",
                },
                textDecoration: "none",
              }}
            />
          </Box>
        ))}

        {showAdminMenu && adminMenuItems.length > 0 && (
          <Box>
            <Button
              onClick={handleOpen}
              aria-controls={open ? "admin-menu" : undefined}
              aria-expanded={open ? "true" : undefined}
              aria-haspopup="menu"
              endIcon={<ExpandMoreIcon sx={{ color: "white" }} />}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                color: "white",
                backgroundColor: "inherit",
                height: 1,
                lineHeight: "32px",
                px: 1,
                textTransform: "none",
                textDecoration: "none",
                "&:focus": {
                  outline: "none",
                  backgroundColor: "inherit",
                },
              }}
            >
              管理
            </Button>
            <MuiMenu
              id="admin-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
            >
              {adminMenuItems.map((menu) => (
                <MuiMenuItem
                  key={menu.href}
                  onClick={() => handleAdminItemClick(menu.href)}
                >
                  {menu.label}
                </MuiMenuItem>
              ))}
            </MuiMenu>
          </Box>
        )}

        {showSettingsLink && settingsMenu && (
          <Box>
            <Link
              label={settingsMenu.label}
              href={settingsMenu.href}
              sx={{
                display: "block",
                height: 1,
                lineHeight: "32px",
                px: 1,
                color: pathName === settingsMenu.href ? "#0FA85E" : "white",
                backgroundColor:
                  pathName === settingsMenu.href ? "white" : "inherit",
                "&:hover, &:focus": {
                  backgroundColor:
                    pathName === settingsMenu.href ? "white" : "inherit",
                  color: pathName === settingsMenu.href ? "#0FA85E" : "white",
                },
                textDecoration: "none",
              }}
            />
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default DesktopMenu;
