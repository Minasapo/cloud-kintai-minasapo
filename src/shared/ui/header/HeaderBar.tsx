import { Box, Container, Stack } from "@mui/material";
import type { ReactNode } from "react";

import { designTokenVar } from "@/shared/designSystem";

interface HeaderBarProps {
  themeColor?: string;
  logo: ReactNode;
  desktopMenu: ReactNode;
  externalLinks?: ReactNode;
  mobileMenu: ReactNode;
  signInOutButton: ReactNode;
}

const HEADER_BACKGROUND = designTokenVar(
  "component.headerBar.background",
  "#0FA85E"
);
const HEADER_TEXT = designTokenVar("component.headerBar.textColor", "#FFFFFF");
const HEADER_HEIGHT = designTokenVar("component.headerBar.minHeight", "56px");
const HEADER_PADDING_X = designTokenVar("component.headerBar.paddingX", "16px");
const HEADER_PADDING_Y = designTokenVar("component.headerBar.paddingY", "8px");
const HEADER_GAP = designTokenVar("component.headerBar.gap", "12px");
const HEADER_SIDE_GAP = designTokenVar("spacing.md", "12px");

export default function HeaderBar({
  themeColor,
  logo,
  desktopMenu,
  externalLinks,
  mobileMenu,
  signInOutButton,
}: HeaderBarProps) {
  const headerBackground = themeColor ?? HEADER_BACKGROUND;

  return (
    <header>
      <Container
        maxWidth={false}
        disableGutters
        sx={{ p: 0, backgroundColor: headerBackground }}
      >
        <Container sx={{ px: { xs: 2, md: 3 } }}>
          <Stack
            direction="row"
            alignItems="center"
            color={HEADER_TEXT}
            sx={{
              height: HEADER_HEIGHT,
              minHeight: HEADER_HEIGHT,
              boxSizing: "border-box",
              py: HEADER_PADDING_Y,
              px: HEADER_PADDING_X,
              gap: HEADER_GAP,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexShrink: 0,
                minWidth: 0,
                height: "100%",
              }}
            >
              {logo}
            </Box>

            <Box
              sx={{
                flexGrow: 1,
                display: { xs: "none", md: "flex" },
                justifyContent: "center",
                alignItems: "center",
                minWidth: 0,
                px: HEADER_SIDE_GAP,
              }}
            >
              {desktopMenu}
            </Box>

            <Stack
              direction="row"
              alignItems="center"
              justifyContent="flex-end"
              sx={{
                flexShrink: 0,
                minWidth: 0,
                ml: "auto",
                columnGap: HEADER_GAP,
                rowGap: HEADER_GAP,
              }}
            >
              {externalLinks}
              {signInOutButton}
              {mobileMenu}
            </Stack>
          </Stack>
        </Container>
      </Container>
    </header>
  );
}
