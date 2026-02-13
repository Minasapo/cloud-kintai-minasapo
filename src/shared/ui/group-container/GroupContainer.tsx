import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Box,
  Collapse,
  IconButton,
  Stack,
  SxProps,
  Theme,
  Typography,
} from "@mui/material";
import { ReactNode, useState } from "react";

import { designTokenVar } from "@/shared/designSystem";

const GROUP_BORDER_WIDTH = designTokenVar(
  "component.groupContainer.borderWidth",
  "1px"
);
const GROUP_ACCENT_WIDTH = designTokenVar(
  "component.groupContainer.accentWidth",
  "6px"
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
  "component.groupContainer.padding",
  "16px"
);
const GROUP_BACKGROUND = designTokenVar(
  "component.groupContainer.background",
  "#FFFFFF"
);
const GROUP_SHADOW = designTokenVar(
  "component.groupContainer.shadow",
  "0 6px 16px rgba(15, 168, 94, 0.08)"
);
const GROUP_HEADER_GAP = designTokenVar(
  "component.groupContainer.headerGap",
  "8px"
);
const GROUP_CONTENT_GAP = designTokenVar(
  "component.groupContainer.contentGap",
  "8px"
);
const GROUP_COUNT_COLOR = designTokenVar(
  "component.groupContainer.countColor",
  "#5E726A"
);

export interface GroupContainerProps {
  title?: string;
  count?: number;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  sx?: SxProps<Theme>;
  children?: ReactNode;
}

const GroupContainer = ({
  title,
  count,
  collapsible = false,
  defaultCollapsed = false,
  children,
  sx,
}: GroupContainerProps) => {
  const [collapsed, setCollapsed] = useState<boolean>(defaultCollapsed);

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
        boxShadow: GROUP_SHADOW,
      }}
      sx={sx}
    >
      {(title || collapsible) && (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack
            direction="row"
            alignItems="center"
            style={{ columnGap: GROUP_HEADER_GAP, rowGap: GROUP_HEADER_GAP }}
          >
            {title ? (
              <Typography variant="subtitle1" fontWeight={700}>
                {title}
              </Typography>
            ) : null}
            {typeof count === "number" && (
              <Typography variant="caption" style={{ color: GROUP_COUNT_COLOR }}>
                {`(${count}件)`}
              </Typography>
            )}
          </Stack>
          {collapsible && (
            <IconButton
              size="small"
              onClick={() => setCollapsed((s) => !s)}
              aria-label={collapsed ? "expand" : "collapse"}
            >
              {collapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
            </IconButton>
          )}
        </Stack>
      )}

      <Collapse in={!collapsed}>
        <Box style={{ marginTop: GROUP_CONTENT_GAP }}>{children}</Box>
      </Collapse>
    </Box>
  );
};

export default GroupContainer;
