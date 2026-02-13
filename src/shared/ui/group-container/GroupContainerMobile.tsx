import { Box, Stack, SxProps, Theme, Typography } from "@mui/material";
import { ReactNode } from "react";

import { designTokenVar } from "@/shared/designSystem";

const GROUP_BORDER_WIDTH = designTokenVar(
  "component.groupContainer.borderWidth",
  "1px"
);
const GROUP_ACCENT_WIDTH = designTokenVar(
  "component.groupContainer.accentWidthMobile",
  "4px"
);
const GROUP_BORDER_COLOR = designTokenVar(
  "component.groupContainer.borderColor",
  "#D9E2DD"
);
const GROUP_ACCENT_COLOR = designTokenVar(
  "component.groupContainer.accentColor",
  "#0FA85E"
);
const GROUP_RADIUS = designTokenVar(
  "component.groupContainer.borderRadius",
  "12px"
);
const GROUP_PADDING = designTokenVar(
  "component.groupContainer.paddingMobile",
  "12px"
);
const GROUP_BACKGROUND = designTokenVar(
  "component.groupContainer.background",
  "#FFFFFF"
);
const GROUP_CONTENT_GAP = designTokenVar(
  "component.groupContainer.contentGap",
  "8px"
);
const GROUP_COUNT_COLOR = designTokenVar(
  "component.groupContainer.countColor",
  "#5E726A"
);

export interface GroupContainerMobileProps {
  title?: string;
  count?: number;
  sx?: SxProps<Theme>;
  children?: ReactNode;
}

const GroupContainerMobile = ({
  title,
  count,
  children,
  sx,
}: GroupContainerMobileProps) => {
  return (
    <Box
      style={{
        borderStyle: "solid",
        borderWidth: GROUP_BORDER_WIDTH,
        borderColor: GROUP_BORDER_COLOR,
        borderLeftColor: GROUP_ACCENT_COLOR,
        borderLeftWidth: GROUP_ACCENT_WIDTH,
        borderRadius: GROUP_RADIUS,
        padding: GROUP_PADDING,
        backgroundColor: GROUP_BACKGROUND,
      }}
      sx={sx}
    >
      {title ? (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="subtitle1" fontWeight={700}>
            {title}
          </Typography>
          {typeof count === "number" && (
            <Typography variant="caption" style={{ color: GROUP_COUNT_COLOR }}>
              {`(${count}件)`}
            </Typography>
          )}
        </Stack>
      ) : null}

      <Box style={{ marginTop: GROUP_CONTENT_GAP }}>{children}</Box>
    </Box>
  );
};

export default GroupContainerMobile;
