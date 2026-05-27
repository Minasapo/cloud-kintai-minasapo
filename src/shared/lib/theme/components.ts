// cspell:words Noto
import { type ThemeOptions } from "@mui/material/styles";
import { type DesignTokens } from "@shared/designSystem";

import { type AppPalette } from "./palette";
import { type TypographyHelpers } from "./typography";

const toPx = (value: number) => `${value}px`;

type NeutralColor = DesignTokens["color"]["neutral"];
type ShadowTokens = DesignTokens["shadow"];

const buildButtonVariants = (color: NeutralColor, shadow: ShadowTokens) => [
  {
    props: { color: "neutral", variant: "contained" } as const,
    style: {
      backgroundColor: color[100],
      color: color[800],
      "&:hover": {
        backgroundColor: color[200],
        boxShadow: shadow.card,
      },
      "&.Mui-disabled": {
        backgroundColor: color[100],
        color: color[500],
      },
    },
  },
  {
    props: { color: "neutral", variant: "outlined" } as const,
    style: {
      backgroundColor: color[50],
      borderColor: color[200],
      color: color[700],
      "&:hover": {
        backgroundColor: color[100],
        borderColor: color[300],
        boxShadow: "none",
      },
    },
  },
  {
    props: { color: "neutral", variant: "text" } as const,
    style: {
      color: color[700],
      "&:hover": {
        backgroundColor: color[100],
        boxShadow: "none",
      },
    },
  },
];

const buildLinkVariants = (
  palette: AppPalette,
  radius: DesignTokens["radius"],
  typography: DesignTokens["typography"],
  buttonPadding: string,
) => [
  {
    props: { variant: "button", color: "primary" } as const,
    style: {
      backgroundColor: palette.primary.main,
      color: palette.primary.contrastText,
      textDecoration: "none",
      borderRadius: toPx(radius.sm),
      padding: buttonPadding,
      fontWeight: typography.fontWeight.medium,
      "&:hover": {
        backgroundColor: palette.primary.contrastText,
        color: palette.primary.main,
        textDecoration: "none",
      },
    },
  },
  {
    props: { variant: "button", color: "secondary" } as const,
    style: {
      backgroundColor: palette.secondary.main,
      color: palette.secondary.contrastText,
      textDecoration: "none",
      borderRadius: toPx(radius.sm),
      padding: buttonPadding,
      fontWeight: typography.fontWeight.medium,
      "&:hover": {
        backgroundColor: palette.secondary.contrastText,
        color: palette.secondary.main,
        textDecoration: "none",
      },
    },
  },
];

export const createComponents = (
  tokens: DesignTokens,
  palette: AppPalette,
  helpers: TypographyHelpers,
): ThemeOptions["components"] => {
  const { spacing, radius, typography, component, shadow, color } = tokens;
  const { getLineHeight } = helpers;
  const buttonPadding = `${toPx(spacing.xs)} ${toPx(spacing.lg)}`;
  const pageSectionRadius = component.pageSection.radius ?? radius.lg;
  const pageSectionBackground = component.pageSection.background;
  const surfaceBorderColor = color.neutral[200];
  const cardShadow = component.pageSection.shadow ?? shadow.card;
  const cardPadding = `${toPx(spacing.md)} ${toPx(spacing.lg)}`;
  const rootLineHeight = getLineHeight(typography.lineHeight.relaxed);
  const buttonLineHeight = getLineHeight(typography.lineHeight.comfy);

  return {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: component.appShell.background,
          color: component.appShell.textColor,
          fontFamily: typography.fontFamily,
          lineHeight: rootLineHeight,
        },
        "#root": {
          backgroundColor: component.appShell.contentBackground,
        },
        "@font-face": [
          {
            fontFamily: "Noto Sans JP",
            fontStyle: "normal",
            fontWeight: 400,
            fontDisplay: "swap",
            src: "local('Noto Sans JP')",
          },
          {
            fontFamily: "Noto Sans JP",
            fontStyle: "normal",
            fontWeight: 500,
            fontDisplay: "swap",
            src: "local('Noto Sans JP')",
          },
          {
            fontFamily: "Noto Sans JP",
            fontStyle: "normal",
            fontWeight: 600,
            fontDisplay: "swap",
            src: "local('Noto Sans JP')",
          },
        ],
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: toPx(radius.sm),
          fontWeight: typography.fontWeight.medium,
          padding: buttonPadding,
          gap: toPx(spacing.xs),
          textTransform: "none",
          boxShadow: "none",
          lineHeight: buttonLineHeight,
          "&:hover": {
            boxShadow: shadow.card,
          },
        },
        containedSecondary: {
          color: palette.secondary.contrastText,
        },
        sizeLarge: {
          padding: `${toPx(spacing.sm)} ${toPx(spacing.xl)}`,
          fontSize: toPx(typography.fontSize.md),
          minHeight: "48px",
          minWidth: "160px",
        },
        sizeMedium: {
          minHeight: "44px",
          minWidth: "160px",
        },
        sizeSmall: {
          padding: `${toPx(spacing.xs)} ${toPx(spacing.md)}`,
          minHeight: "36px",
        },
      },
      variants: buildButtonVariants(color.neutral, shadow),
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: `background-color 150ms ease, border-color 150ms ease, color 150ms ease`,
        },
        colorPrimary: {
          border: `1px solid ${color.brand.primary.light}`,
          color: color.brand.primary.dark,
          "&:hover": {
            backgroundColor: color.brand.primary.surface,
            borderColor: color.brand.primary.base,
          },
        },
        colorError: {
          border: `1px solid ${color.feedback.danger.border}`,
          color: color.feedback.danger.base,
          "&:hover": {
            backgroundColor: color.feedback.danger.surface,
            borderColor: color.feedback.danger.base,
          },
        },
      },
      variants: [
        {
          props: { color: "neutral" },
          style: {
            border: `1px solid ${color.neutral[200]}`,
            color: color.neutral[700],
            "&:hover": {
              backgroundColor: color.neutral[100],
              borderColor: color.neutral[300],
              color: color.neutral[900],
            },
          },
        },
      ],
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: pageSectionBackground,
          color: component.appShell.textColor,
        },
        rounded: {
          borderRadius: toPx(pageSectionRadius),
        },
        outlined: {
          border: `1px solid ${surfaceBorderColor}`,
          boxShadow: "none",
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: toPx(pageSectionRadius),
          boxShadow: cardShadow,
          padding: cardPadding,
          backgroundColor: pageSectionBackground,
          border: `1px solid ${surfaceBorderColor}`,
        },
      },
    },
    MuiLink: {
      variants: buildLinkVariants(palette, radius, typography, buttonPadding),
    },
  };
};
