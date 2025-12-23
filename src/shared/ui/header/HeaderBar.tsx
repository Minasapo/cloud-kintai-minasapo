import { Container, Stack } from "@mui/material";
import type { ReactNode } from "react";

import { designTokenVar } from "@/shared/designSystem";

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
  const headerTextColor = designTokenVar(
    "color.brand.primary.contrastText",
    "#FFFFFF"
  );
  const headerPadding = designTokenVar("spacing.sm", "8px");

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
            color={headerTextColor}
            sx={{
              height: "50px",
              boxSizing: "border-box",
              padding: headerPadding,
            }}
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
