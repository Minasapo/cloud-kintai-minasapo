import { Box, Skeleton, Stack } from "@mui/material";

import { designTokenVar } from "@/shared/designSystem";

const HEADER_HEIGHT = designTokenVar("component.headerBar.minHeight", "48px");
const PAGE_PADDING_X = designTokenVar("spacing.lg", "16px");
const PAGE_PADDING_Y = designTokenVar("spacing.xl", "24px");
const CONTENT_MAX_WIDTH = designTokenVar(
  "component.headerBar.contentMaxWidth",
  "1200px",
);

export default function RouterFallback() {
  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{
        minHeight: "100vh",
        backgroundColor: "background.default",
      }}
    >
      <Box
        sx={{
          height: HEADER_HEIGHT,
          backgroundColor: "action.hover",
        }}
      />
      <Box
        sx={{
          width: "100%",
          maxWidth: CONTENT_MAX_WIDTH,
          mx: "auto",
          px: PAGE_PADDING_X,
          py: PAGE_PADDING_Y,
          boxSizing: "border-box",
        }}
      >
        <Stack spacing={2}>
          <Skeleton variant="text" width="36%" height={42} />
          <Skeleton variant="rounded" height={56} />
          <Skeleton variant="rounded" height={56} />
          <Skeleton variant="rounded" height={56} />
          <Skeleton variant="rounded" height={220} />
        </Stack>
      </Box>
    </Box>
  );
}
