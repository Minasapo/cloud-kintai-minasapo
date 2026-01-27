// cspell:words Noto
import {
  createTheme,
  responsiveFontSizes,
  type ThemeOptions,
} from "@mui/material/styles";

import { type DesignTokens, getDesignTokens } from "@/shared/designSystem";

declare module "@mui/material/styles" {
  interface Palette {
    cancel: Palette["error"];
    rest: Palette["primary"];
    clock_in: Palette["primary"];
    clock_out: Palette["error"];
    login: Palette["primary"];
    logout: Palette["error"];
    delete: Palette["error"];
  }

  interface PaletteOptions {
    cancel?: PaletteOptions["error"];
    rest?: PaletteOptions["primary"];
    clock_in?: PaletteOptions["primary"];
    clock_out?: PaletteOptions["error"];
    login?: PaletteOptions["primary"];
    logout?: PaletteOptions["error"];
    delete?: PaletteOptions["error"];
  }
}

declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    cancel: true;
    rest: true;
    clock_in: true;
    clock_out: true;
    login: true;
    logout: true;
    delete: true;
  }

  interface ButtonPropsVariantOverrides {
    cancel: true;
    rest: true;
    clock_in: true;
    clock_out: true;
    login: true;
    logout: true;
    delete: true;
  }
}

export type Color =
  | "inherit"
  | "primary"
  | "secondary"
  | "success"
  | "error"
  | "info"
  | "warning"
  | "cancel"
  | "rest"
  | "clock_in"
  | "clock_out"
  | "login"
  | "logout"
  | "delete";
export type Variant = "text" | "outlined" | "contained";

type FontSizeTokenKey = keyof DesignTokens["typography"]["fontSize"];

export type TypographyMode = "balanced" | "comfortable";

export type ThemeOverrideOptions = {
  brandPrimary?: string;
  typographyMode?: TypographyMode;
};

type ThemeFactoryInput = string | ThemeOverrideOptions | undefined;

const TYPOGRAPHY_MODE_ADJUSTMENTS: Record<
  TypographyMode,
  Record<FontSizeTokenKey, number>
> = {
  balanced: {
    xs: -1,
    sm: -1,
    md: -2,
    lg: -2,
    xl: -3,
    display: -4,
  },
  comfortable: {
    xs: 0,
    sm: 0,
    md: 0,
    lg: 0,
    xl: 0,
    display: 0,
  },
};

const LINE_HEIGHT_SCALE: Record<TypographyMode, number> = {
  balanced: 0.95,
  comfortable: 1,
};

const MIN_FONT_SIZE = 10;

const createTypographyHelpers = (
  tokens: DesignTokens,
  mode: TypographyMode
) => {
  const adjustments = TYPOGRAPHY_MODE_ADJUSTMENTS[mode];
  const scale = LINE_HEIGHT_SCALE[mode];

  const getFontSize = (key: FontSizeTokenKey) => {
    const base = tokens.typography.fontSize[key];
    const delta = adjustments[key] ?? 0;
    return Math.max(MIN_FONT_SIZE, base + delta);
  };

  const getLineHeight = (value: number) => {
    const scaled = Number((value * scale).toFixed(2));
    return Math.max(1.1, scaled);
  };

  return { getFontSize, getLineHeight };
};

type TypographyHelpers = ReturnType<typeof createTypographyHelpers>;

const toPx = (value: number) => `${value}px`;

const createPalette = (tokens: DesignTokens) => {
  const {
    color: { brand, feedback, neutral },
  } = tokens;
  const lightOnPrimary = brand.primary.contrastText;
  const darkText = neutral[900];

  return {
    primary: {
      main: brand.primary.base,
      contrastText: lightOnPrimary,
    },
    secondary: {
      main: brand.primary.contrastText,
      contrastText: brand.primary.base,
    },
    success: {
      main: feedback.success.base,
      contrastText: lightOnPrimary,
    },
    error: {
      main: feedback.danger.base,
      contrastText: lightOnPrimary,
    },
    warning: {
      main: feedback.warning.base,
      contrastText: lightOnPrimary,
    },
    cancel: {
      main: feedback.danger.base,
      contrastText: lightOnPrimary,
    },
    rest: {
      main: brand.primary.surface,
      contrastText: brand.primary.base,
    },
    clock_in: {
      main: brand.primary.base,
      contrastText: lightOnPrimary,
    },
    clock_out: {
      main: feedback.danger.base,
      contrastText: lightOnPrimary,
    },
    login: {
      main: brand.primary.base,
      contrastText: lightOnPrimary,
    },
    logout: {
      main: feedback.danger.base,
      contrastText: lightOnPrimary,
    },
    delete: {
      main: feedback.danger.base,
      contrastText: lightOnPrimary,
    },
    info: {
      main: feedback.info.base,
      contrastText: darkText,
    },
  };
};

const buildTypography = (
  tokens: DesignTokens,
  helpers: TypographyHelpers
): ThemeOptions["typography"] => {
  const { fontFamily, fontWeight, lineHeight } = tokens.typography;
  const { getFontSize, getLineHeight } = helpers;

  return {
    fontFamily,
    fontSize: getFontSize("md"),
    h1: {
      fontSize: getFontSize("display"),
      fontWeight: fontWeight.bold,
      lineHeight: getLineHeight(lineHeight.comfy),
    },
    h2: {
      fontSize: getFontSize("xl"),
      fontWeight: fontWeight.bold,
      lineHeight: getLineHeight(lineHeight.comfy),
    },
    h3: {
      fontSize: getFontSize("lg"),
      fontWeight: fontWeight.bold,
      lineHeight: getLineHeight(lineHeight.comfy),
    },
    h4: {
      fontSize: getFontSize("md"),
      fontWeight: fontWeight.bold,
      lineHeight: getLineHeight(lineHeight.comfy),
    },
    h5: {
      fontSize: getFontSize("sm"),
      fontWeight: fontWeight.medium,
      lineHeight: getLineHeight(lineHeight.relaxed),
    },
    h6: {
      fontSize: getFontSize("xs"),
      fontWeight: fontWeight.medium,
      lineHeight: getLineHeight(lineHeight.relaxed),
    },
    subtitle1: {
      fontSize: getFontSize("md"),
      fontWeight: fontWeight.medium,
      lineHeight: getLineHeight(lineHeight.comfy),
    },
    subtitle2: {
      fontSize: getFontSize("sm"),
      fontWeight: fontWeight.medium,
      lineHeight: getLineHeight(lineHeight.comfy),
    },
    body1: {
      fontSize: getFontSize("md"),
      lineHeight: getLineHeight(lineHeight.relaxed),
    },
    body2: {
      fontSize: getFontSize("sm"),
      lineHeight: getLineHeight(lineHeight.relaxed),
    },
    button: {
      fontSize: getFontSize("md"),
      fontWeight: fontWeight.medium,
      lineHeight: getLineHeight(lineHeight.comfy),
      textTransform: "none",
    },
    caption: {
      fontSize: getFontSize("xs"),
      lineHeight: getLineHeight(lineHeight.tight),
    },
    overline: {
      fontSize: getFontSize("xs"),
      letterSpacing: 0.8,
      textTransform: "uppercase",
      lineHeight: getLineHeight(lineHeight.tight),
    },
  };
};

type AppPalette = ReturnType<typeof createPalette>;

const createComponents = (
  tokens: DesignTokens,
  palette: AppPalette,
  helpers: TypographyHelpers
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
            fontWeight: 700,
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
      },
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
      variants: [
        {
          props: { variant: "button", color: "primary" },
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
          props: { variant: "button", color: "secondary" },
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
      ],
    },
  };
};

const normalizeThemeOverrides = (input?: ThemeFactoryInput) => {
  if (!input || typeof input === "string") {
    return {
      brandPrimary: typeof input === "string" ? input : undefined,
      typographyMode: "balanced" as TypographyMode,
    };
  }

  return {
    brandPrimary: input.brandPrimary,
    typographyMode: input.typographyMode ?? "balanced",
  };
};

const createThemeConfig = (overrides?: ThemeFactoryInput) => {
  const { brandPrimary, typographyMode } = normalizeThemeOverrides(overrides);
  const tokens = getDesignTokens(brandPrimary ? { brandPrimary } : undefined);
  const palette = createPalette(tokens);
  const typographyHelpers = createTypographyHelpers(tokens, typographyMode);

  return createTheme({
    palette,
    spacing: tokens.spacing.unit,
    typography: buildTypography(tokens, typographyHelpers),
    shape: {
      borderRadius: tokens.radius.md,
    },
    cssVariables: {
      colorSchemeSelector: "class",
    },
    components: createComponents(tokens, palette, typographyHelpers),
  });
};

export const createAppTheme = (overrides?: ThemeFactoryInput) =>
  responsiveFontSizes(createThemeConfig(overrides));

export const theme = createAppTheme();
