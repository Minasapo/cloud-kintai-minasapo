import { Box, type BoxProps } from "@mui/material";
import { forwardRef } from "react";

import { designTokenVar } from "@/shared/designSystem";

type PageSectionProps = BoxProps & {
  variant?: "surface" | "plain";
  layoutVariant?: "dashboard" | "detail";
};

const VARIANT_FALLBACKS = {
  dashboard: {
    paddingX: { xs: "16px", md: "32px" },
    paddingY: "16px",
    gap: "12px",
    radius: "12px",
    background: "#FFFFFF",
    shadow: "0 12px 24px rgba(17, 24, 39, 0.06)",
  },
  detail: {
    paddingX: { xs: "12px", md: "24px" },
    paddingY: "12px",
    gap: "8px",
    radius: "8px",
    background: "#F3F8F4",
    shadow: "0 8px 20px rgba(17, 24, 39, 0.05)",
  },
} as const;

const toArray = (value: BoxProps["sx"]) => {
  if (!value) return [] as BoxProps["sx"][];
  return Array.isArray(value) ? value : [value];
};

export default forwardRef<HTMLDivElement, PageSectionProps>(
  function PageSection(
    {
      children,
      variant = "surface",
      layoutVariant = "dashboard",
      component = "section",
      sx,
      ...rest
    },
    ref
  ) {
    const variantFallback =
      VARIANT_FALLBACKS[layoutVariant] ?? VARIANT_FALLBACKS.dashboard;
    const variantPath = `component.pageSection.variants.${layoutVariant}`;
    const SECTION_PADDING_X = {
      xs: designTokenVar(
        `${variantPath}.paddingX.xs`,
        variantFallback.paddingX.xs
      ),
      md: designTokenVar(
        `${variantPath}.paddingX.md`,
        variantFallback.paddingX.md
      ),
    };
    const SECTION_PADDING_Y = designTokenVar(
      `${variantPath}.paddingY`,
      variantFallback.paddingY
    );
    const SECTION_GAP = designTokenVar(
      `${variantPath}.gap`,
      variantFallback.gap
    );
    const SECTION_RADIUS = designTokenVar(
      `${variantPath}.radius`,
      variantFallback.radius
    );
    const SECTION_BACKGROUND = designTokenVar(
      `${variantPath}.background`,
      variantFallback.background
    );
    const SECTION_SHADOW = designTokenVar(
      `${variantPath}.shadow`,
      variantFallback.shadow
    );
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
