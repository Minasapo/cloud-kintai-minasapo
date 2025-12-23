import { Box, type BoxProps } from "@mui/material";
import { forwardRef } from "react";

import { designTokenVar } from "@/shared/designSystem";

type PageSectionProps = BoxProps & {
  variant?: "surface" | "plain";
};

const SECTION_PADDING_X = {
  xs: designTokenVar("component.pageSection.paddingX.xs", "16px"),
  md: designTokenVar("component.pageSection.paddingX.md", "32px"),
};
const SECTION_PADDING_Y = designTokenVar(
  "component.pageSection.paddingY",
  "16px"
);
const SECTION_GAP = designTokenVar("component.pageSection.gap", "12px");
const SECTION_RADIUS = designTokenVar("component.pageSection.radius", "12px");
const SECTION_BACKGROUND = designTokenVar(
  "component.pageSection.background",
  "#FFFFFF"
);
const SECTION_SHADOW = designTokenVar(
  "component.pageSection.shadow",
  "0 12px 24px rgba(17, 24, 39, 0.06)"
);

const toArray = (value: BoxProps["sx"]) => {
  if (!value) return [] as BoxProps["sx"][];
  return Array.isArray(value) ? value : [value];
};

export default forwardRef<HTMLDivElement, PageSectionProps>(
  function PageSection(
    { children, variant = "surface", component = "section", sx, ...rest },
    ref
  ) {
    const normalizedSx = toArray(sx);
    const surfaceStyles =
      variant === "surface"
        ? {
            backgroundColor: SECTION_BACKGROUND,
            borderRadius: SECTION_RADIUS,
            boxShadow: SECTION_SHADOW,
          }
        : {};

    return (
      <Box
        ref={ref}
        component={component}
        sx={[
          {
            px: SECTION_PADDING_X,
            py: SECTION_PADDING_Y,
            display: "flex",
            flexDirection: "column",
            gap: SECTION_GAP,
            ...surfaceStyles,
          },
          ...normalizedSx,
        ]}
        {...rest}
      >
        {children}
      </Box>
    );
  }
);
