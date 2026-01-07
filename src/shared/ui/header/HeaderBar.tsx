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
const HEADER_HEIGHT = designTokenVar("component.headerBar.minHeight", "48px");
const HEADER_PADDING_X = designTokenVar("component.headerBar.paddingX", "16px");
const HEADER_PADDING_Y = designTokenVar("component.headerBar.paddingY", "8px");
const HEADER_GAP = designTokenVar("component.headerBar.gap", "8px");
const HEADER_SIDE_GAP = designTokenVar("spacing.md", "12px");
const HEADER_CONTENT_MAX_WIDTH = designTokenVar(
  "component.headerBar.contentMaxWidth",
  "1200px"
);

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
    <header style={{ overflow: "hidden", width: "100%" }}>
      <Container
        maxWidth={false}
        disableGutters
        sx={{ p: 0, backgroundColor: headerBackground, overflow: "hidden" }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: { xs: "100%", md: HEADER_CONTENT_MAX_WIDTH },
            mx: { xs: 0, md: "auto" },
            px: { xs: "8px", md: HEADER_PADDING_X },
            overflow: "hidden",
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            color={HEADER_TEXT}
            sx={{
              width: "100%",
              maxWidth: "100%",
              height: HEADER_HEIGHT,
              minHeight: HEADER_HEIGHT,
              boxSizing: "border-box",
              py: HEADER_PADDING_Y,
              gap: { xs: "4px", md: HEADER_GAP },
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                flexShrink: { xs: 2, md: 0 },
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
                flexGrow: { xs: 1, md: 0 },
                flexShrink: 0,
                minWidth: "fit-content",
                columnGap: { xs: "4px", md: HEADER_GAP },
                rowGap: { xs: "4px", md: HEADER_GAP },
              }}
            >
              {externalLinks}
              {signInOutButton}
              {mobileMenu}
            </Stack>
          </Stack>
        </Box>
      </Container>
    </header>
  );
}
