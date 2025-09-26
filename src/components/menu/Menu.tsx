import { Box, Stack } from "@mui/material";

import Link from "../link/Link";

const MENU_ITEMS = [
  {
    label: "スタッフ管理",
    href: "/admin/staff",
  },
  {
    label: "勤怠管理",
    href: "/admin/attendance",
  },
] as const;

const linkStyle = {
  display: "block",
  height: 1,
  lineHeight: "32px",
  px: 1,
} as const;

const Menu = () => (
  <Stack
    component="nav"
    direction="row"
    alignItems="center"
    spacing={2}
    sx={{ width: "auto", height: 1, boxSizing: "border-box" }}
  >
    {MENU_ITEMS.map(({ label, href }) => (
      <Box key={href}>
        <Link label={label} href={href} color="secondary" sx={linkStyle} />
      </Box>
    ))}
  </Stack>
);

export default Menu;
