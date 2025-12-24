// cspell:words Noto
import { createTheme, responsiveFontSizes } from "@mui/material/styles";

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

const createThemeConfig = (brandPrimary?: string) => {
  const tokens = getDesignTokens(brandPrimary ? { brandPrimary } : undefined);
  const palette = createPalette(tokens);

  return createTheme({
    palette,
    typography: {
      fontFamily: tokens.typography.fontFamily,
    },
    shape: {
      borderRadius: tokens.radius.md,
    },
    components: {
      MuiTypography: {
        styleOverrides: {
          h2: {
            lineHeight: "1.5",
          },
          h4: {
            lineHeight: "1.5",
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: `
        @font-face {
          font-family: 'Noto Sans JP';
          font-style: bold;
          font-weight: 700;
        }`,
      },
      MuiLink: {
        variants: [
          {
            props: { variant: "button", color: "primary" },
            style: {
              backgroundColor: palette.primary.main,
              color: palette.primary.contrastText,
              textDecoration: "none",
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
              borderRadius: "5px",
              "&:hover": {
                backgroundColor: palette.secondary.contrastText,
                color: palette.secondary.main,
                textDecoration: "none",
                borderRadius: "5px",
              },
            },
          },
        ],
      },
    },
  });
};

export const createAppTheme = (brandPrimary?: string) =>
  responsiveFontSizes(createThemeConfig(brandPrimary));

export const theme = createAppTheme();
