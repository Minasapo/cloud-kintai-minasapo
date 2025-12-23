import { Stack } from "@mui/material";
import { useCallback, useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { designTokenVar } from "@/shared/designSystem";
import { PageSection } from "@/shared/ui/layout";

import AdminHeader from "./components/AdminHeader";
import AdminMenu from "./components/AdminMenu";
import useHeaderMenu from "./components/useHeaderMenu";

const PAGE_PADDING_X = {
  xs: designTokenVar("spacing.lg", "16px"),
  md: designTokenVar("spacing.xxl", "32px"),
};

const PAGE_PADDING_Y = {
  xs: designTokenVar("spacing.xl", "24px"),
  md: designTokenVar("spacing.xxl", "32px"),
};

const PAGE_SECTION_GAP = designTokenVar("spacing.xl", "24px");

export default function AdminDashboard() {
  const menuItems = useHeaderMenu();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSelect = useCallback(
    (itemHref: string) => {
      if (location.pathname === itemHref) return;
      navigate(itemHref);
    },
    [location.pathname, navigate]
  );

  const activeMenuHref = useMemo(() => {
    const currentPath = location.pathname;
    const exactMatch = menuItems.find((item) => item.href === currentPath);
    if (exactMatch) return exactMatch.href;

    const prefixMatch = menuItems.find((item) =>
      currentPath.startsWith(`${item.href}/`)
    );
    return prefixMatch?.href ?? menuItems[0]?.href ?? "";
  }, [location.pathname, menuItems]);

  return (
    <Stack
      component="section"
      sx={{
        flex: 1,
        width: "100%",
        boxSizing: "border-box",
        px: PAGE_PADDING_X,
        py: PAGE_PADDING_Y,
        gap: PAGE_SECTION_GAP,
      }}
    >
      <PageSection variant="surface" sx={{ gap: 0 }}>
        <AdminHeader
          actions={
            <AdminMenu
              items={menuItems}
              selectedHref={activeMenuHref}
              onSelect={(item) => handleSelect(item.href)}
            />
          }
        />
      </PageSection>
      <PageSection variant="surface" sx={{ gap: 0 }}>
        <Outlet />
      </PageSection>
    </Stack>
  );
}
