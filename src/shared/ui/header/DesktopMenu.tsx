import { Box, Stack } from "@mui/material";
import Link from "@shared/ui/link/Link";

export type DesktopMenuItem = {
  label: string;
  href: string;
};

export interface DesktopMenuProps {
  pathName: string;
  menuItems: DesktopMenuItem[];
  adminLink?: DesktopMenuItem | null;
  showAdminMenu: boolean;
}

const DesktopMenu = ({
  pathName,
  menuItems,
  adminLink,
  showAdminMenu,
}: DesktopMenuProps) => {
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

        {showAdminMenu && adminLink && (
          <Box>
            <Link
              label={adminLink.label}
              href={adminLink.href}
              sx={{
                display: "block",
                height: 1,
                lineHeight: "32px",
                px: 1,
                color: pathName === adminLink.href ? "#0FA85E" : "white",
                backgroundColor:
                  pathName === adminLink.href ? "white" : "inherit",
                "&:hover, &:focus": {
                  backgroundColor:
                    pathName === adminLink.href ? "white" : "inherit",
                  color: pathName === adminLink.href ? "#0FA85E" : "white",
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
