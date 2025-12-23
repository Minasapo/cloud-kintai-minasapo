import { Box, Stack } from "@mui/material";
import Link from "@shared/ui/link/Link";

import { designTokenVar } from "@/shared/designSystem";

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
  const MENU_GAP = designTokenVar("component.headerMenu.gap", "8px");
  const MENU_ITEM_HEIGHT = designTokenVar(
    "component.headerMenu.itemHeight",
    "32px"
  );
  const MENU_ITEM_PADDING_X = designTokenVar(
    "component.headerMenu.paddingX",
    "8px"
  );
  const MENU_ITEM_RADIUS = designTokenVar(
    "component.headerMenu.borderRadius",
    "8px"
  );
  const MENU_ITEM_FONT_WEIGHT = designTokenVar(
    "component.headerMenu.fontWeight",
    "500"
  );
  const MENU_ITEM_COLOR = designTokenVar(
    "component.headerMenu.color",
    "#FFFFFF"
  );
  const MENU_ITEM_ACTIVE_COLOR = designTokenVar(
    "component.headerMenu.activeColor",
    "#0FA85E"
  );
  const MENU_ITEM_ACTIVE_BACKGROUND = designTokenVar(
    "component.headerMenu.activeBackground",
    "#FFFFFF"
  );
  const MENU_ITEM_HOVER_BACKGROUND = designTokenVar(
    "component.headerMenu.hoverBackground",
    "rgba(255, 255, 255, 0.16)"
  );
  const MENU_ITEM_TRANSITION = designTokenVar(
    "component.headerMenu.transitionMs",
    "160ms"
  );

  const buildLinkSx = (isActive: boolean) => ({
    display: "flex",
    alignItems: "center",
    height: "100%",
    minHeight: MENU_ITEM_HEIGHT,
    paddingInline: MENU_ITEM_PADDING_X,
    color: isActive ? MENU_ITEM_ACTIVE_COLOR : MENU_ITEM_COLOR,
    backgroundColor: isActive
      ? MENU_ITEM_ACTIVE_BACKGROUND
      : "transparent",
    borderRadius: MENU_ITEM_RADIUS,
    fontWeight: MENU_ITEM_FONT_WEIGHT,
    textDecoration: "none",
    transition: `color ${MENU_ITEM_TRANSITION} ease, background-color ${MENU_ITEM_TRANSITION} ease`,
    whiteSpace: "nowrap",
    lineHeight: 1.2,
    "&:hover, &:focus-visible": {
      backgroundColor: isActive
        ? MENU_ITEM_ACTIVE_BACKGROUND
        : MENU_ITEM_HOVER_BACKGROUND,
      color: isActive ? MENU_ITEM_ACTIVE_COLOR : MENU_ITEM_COLOR,
      textDecoration: "none",
    },
  });

  return (
    <Box
      sx={{
        width: 1,
        height: 1,
        display: {
          xs: "none",
          md: "flex",
        },
        alignItems: "center",
      }}
    >
      <Stack
        direction="row"
        sx={{
          width: "auto",
          height: 1,
          columnGap: MENU_GAP,
        }}
      >
        {menuItems.map((menu) => (
          <Box key={menu.href}>
            <Link
              label={menu.label}
              href={menu.href}
              sx={buildLinkSx(pathName === menu.href)}
            />
          </Box>
        ))}

        {showAdminMenu && adminLink && (
          <Box>
            <Link
              label={adminLink.label}
              href={adminLink.href}
              sx={buildLinkSx(pathName === adminLink.href)}
            />
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default DesktopMenu;
