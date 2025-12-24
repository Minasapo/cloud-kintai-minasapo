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

const buildTypography = (tokens: DesignTokens): ThemeOptions["typography"] => {
  const { fontFamily, fontSize, fontWeight, lineHeight } = tokens.typography;
  return {
    fontFamily,
    fontSize: fontSize.md,
    h1: {
      fontSize: fontSize.display,
      fontWeight: fontWeight.bold,
      lineHeight: lineHeight.comfy,
    },
    h2: {
      fontSize: fontSize.xl,
      fontWeight: fontWeight.bold,
      lineHeight: lineHeight.comfy,
    },
    h3: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.bold,
      lineHeight: lineHeight.comfy,
    },
    h4: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.bold,
      lineHeight: lineHeight.comfy,
    },
    h5: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
      lineHeight: lineHeight.relaxed,
    },
    h6: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.medium,
      lineHeight: lineHeight.relaxed,
    },
    subtitle1: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.medium,
      lineHeight: lineHeight.comfy,
    },
    subtitle2: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
      lineHeight: lineHeight.comfy,
    },
    body1: {
      fontSize: fontSize.md,
      lineHeight: lineHeight.relaxed,
    },
    body2: {
      fontSize: fontSize.sm,
      lineHeight: lineHeight.relaxed,
    },
    button: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.medium,
      lineHeight: lineHeight.comfy,
      textTransform: "none",
    },
    caption: {
      fontSize: fontSize.xs,
      lineHeight: lineHeight.tight,
    },
    overline: {
      fontSize: fontSize.xs,
      letterSpacing: 0.8,
      textTransform: "uppercase",
    },
  };
};

type AppPalette = ReturnType<typeof createPalette>;

const createComponents = (
  tokens: DesignTokens,
  palette: AppPalette
): ThemeOptions["components"] => {
  const { spacing, radius, typography, component, shadow } = tokens;
  const buttonPadding = `${toPx(spacing.xs)} ${toPx(spacing.lg)}`;

  return {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: component.appShell.background,
          color: component.appShell.textColor,
          fontFamily: typography.fontFamily,
          lineHeight: typography.lineHeight.relaxed,
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
    MuiTypography: {
      styleOverrides: {
        h2: {
          lineHeight: typography.lineHeight.comfy,
        },
        h4: {
          lineHeight: typography.lineHeight.comfy,
        },
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
          "&:hover": {
            boxShadow: shadow.card,
          },
        },
        containedSecondary: {
          color: palette.secondary.contrastText,
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

const createThemeConfig = (brandPrimary?: string) => {
  const tokens = getDesignTokens(brandPrimary ? { brandPrimary } : undefined);
  const palette = createPalette(tokens);

  return createTheme({
    palette,
    spacing: tokens.spacing.unit,
    typography: buildTypography(tokens),
    shape: {
      borderRadius: tokens.radius.md,
    },
    components: createComponents(tokens, palette),
  });
};

export const createAppTheme = (brandPrimary?: string) =>
  responsiveFontSizes(createThemeConfig(brandPrimary));

export const theme = createAppTheme();
