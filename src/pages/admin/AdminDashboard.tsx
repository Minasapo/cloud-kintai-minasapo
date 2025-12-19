import { Container, Paper, Stack } from "@mui/material";
import { useCallback, useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import AdminHeader from "./components/AdminHeader";
import AdminMenu from "./components/AdminMenu";
import useHeaderMenu from "./components/useHeaderMenu";

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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <AdminHeader
          actions={
            <AdminMenu
              items={menuItems}
              selectedHref={activeMenuHref}
              onSelect={(item) => handleSelect(item.href)}
            />
          }
        />
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Outlet />
        </Paper>
      </Stack>
    </Container>
  );
}
