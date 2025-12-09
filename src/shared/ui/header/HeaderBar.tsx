import { Container, Stack } from "@mui/material";
import type { ReactNode } from "react";

interface HeaderBarProps {
  themeColor: string;
  logo: ReactNode;
  desktopMenu: ReactNode;
  externalLinks?: ReactNode;
  mobileMenu: ReactNode;
  signInOutButton: ReactNode;
}

export default function HeaderBar({
  themeColor,
  logo,
  desktopMenu,
  externalLinks,
  mobileMenu,
  signInOutButton,
}: HeaderBarProps) {
  return (
    <header>
      <Container
        maxWidth={false}
        disableGutters
        sx={{ p: 0, backgroundColor: themeColor }}
      >
        <Container sx={{ px: { xs: 2, md: 3 } }}>
          <Stack
            direction="row"
            alignItems="center"
            color="white"
            sx={{ p: 1, height: "50px", boxSizing: "border-box" }}
            spacing={{ xs: 0, md: 2 }}
          >
            {logo}
            {desktopMenu}
            {externalLinks}
            {mobileMenu}
            {signInOutButton}
          </Stack>
        </Container>
      </Container>
    </header>
  );
}
