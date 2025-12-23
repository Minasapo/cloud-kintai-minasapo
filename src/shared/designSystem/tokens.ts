type RGB = {
  r: number;
  g: number;
  b: number;
};

const clampChannel = (value: number) => Math.min(255, Math.max(0, value));

const toHex = (value: number) =>
  value.toString(16).padStart(2, "0").toUpperCase();

const normalizeHex = (value: string) => {
  const trimmed = value.trim();
  const prefixed = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  if (prefixed.length === 7) {
    return prefixed.toUpperCase();
  }

  if (prefixed.length === 4) {
    const [, r, g, b] = prefixed;
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }

  return prefixed.slice(0, 7).toUpperCase();
};

const hexToRgb = (value: string): RGB => {
  const normalized = normalizeHex(value);
  const numeric = parseInt(normalized.slice(1), 16);
  return {
    r: (numeric >> 16) & 0xff,
    g: (numeric >> 8) & 0xff,
    b: numeric & 0xff,
  };
};

const mixWithTarget = (value: string, amount: number, target: number) => {
  const rgb = hexToRgb(value);
  const ratio = Math.min(1, Math.max(0, Math.abs(amount)));
  const mix = (channel: number) =>
    clampChannel(Math.round(channel + (target - channel) * ratio));
  return `#${toHex(mix(rgb.r))}${toHex(mix(rgb.g))}${toHex(mix(rgb.b))}`;
};

const tint = (value: string, amount: number) =>
  mixWithTarget(value, amount, 255);
const shade = (value: string, amount: number) =>
  mixWithTarget(value, amount, 0);

export const BRAND_PRIMARY_HEX = "#0FA85E";
const BRAND_SECONDARY_HEX = "#0B6D53";
const BRAND_ACCENT_HEX = "#F5B700";

const createDesignTokens = (brandPrimaryHex: string = BRAND_PRIMARY_HEX) => {
  const normalizedPrimary = normalizeHex(brandPrimaryHex);
  const color = {
    brand: {
      primary: {
        base: normalizedPrimary,
        light: tint(normalizedPrimary, 0.2),
        dark: shade(normalizedPrimary, 0.25),
        surface: tint(normalizedPrimary, 0.88),
        contrastText: "#FFFFFF",
        focusRing: shade(normalizedPrimary, 0.35),
      },
      secondary: {
        base: BRAND_SECONDARY_HEX,
        light: tint(BRAND_SECONDARY_HEX, 0.18),
        dark: shade(BRAND_SECONDARY_HEX, 0.3),
        surface: tint(BRAND_SECONDARY_HEX, 0.9),
        contrastText: "#FFFFFF",
      },
      accent: {
        base: BRAND_ACCENT_HEX,
        light: tint(BRAND_ACCENT_HEX, 0.15),
        dark: shade(BRAND_ACCENT_HEX, 0.2),
        surface: tint(BRAND_ACCENT_HEX, 0.92),
        contrastText: "#1E1F24",
      },
    },
    neutral: {
      50: "#F8FAF9",
      100: "#EDF1EF",
      200: "#D9E2DD",
      300: "#C3CFC7",
      400: "#A0B1A7",
      500: "#7D9288",
      600: "#5E726A",
      700: "#45574F",
      800: "#2E3D36",
      900: "#1E2A25",
    },
    feedback: {
      success: { base: "#1EAA6A", surface: "#ECF8F1" },
      warning: { base: "#E8A447", surface: "#FFF7EA" },
      danger: { base: "#D7443E", surface: "#FDECEC" },
      info: { base: "#3C7EDB", surface: "#EDF2FC" },
    },
  } as const;

  const spacing = {
    unit: 4,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  } as const;

  const radius = {
    sm: 4,
    md: 8,
    lg: 12,
    pill: 999,
  } as const;

  const typography = {
    fontFamily: "'Noto Sans JP', 'Helvetica Neue', Arial, sans-serif",
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      display: 28,
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      bold: 600,
    },
    lineHeight: {
      tight: 1.2,
      comfy: 1.4,
      relaxed: 1.6,
    },
  } as const;

  const shadow = {
    card: "0 6px 16px rgba(15, 168, 94, 0.08)",
    overlay: "0 12px 34px rgba(17, 24, 39, 0.2)",
    focus: "0 0 0 3px rgba(15, 168, 94, 0.35)",
  } as const;

  const motion = {
    duration: {
      fast: 120,
      medium: 200,
      slow: 320,
    },
    easing: {
      standard: "cubic-bezier(0.2, 0.8, 0.4, 1)",
      emphasized: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    },
  } as const;

  const component = {
    shiftBoard: {
      rowGap: spacing.md,
      columnGap: spacing.sm,
      cellRadius: radius.sm,
      highlightBackground: color.brand.primary.surface,
      highlightBorder: color.brand.primary.base,
      dropShadow: shadow.card,
    },
    workflowList: {
      cardRadius: radius.md,
      cardShadow: shadow.card,
      statusChip: {
        borderRadius: radius.pill,
        fontSize: typography.fontSize.sm,
        gap: spacing.xs,
        transitionMs: motion.duration.fast,
      },
    },
    adminPanel: {
      headerHeight: 64,
      sectionSpacing: spacing.lg,
      dividerColor: color.neutral[200],
      surface: color.brand.secondary.surface,
    },
    headerBar: {
      minHeight: 56,
      paddingX: spacing.lg,
      paddingY: spacing.sm,
      gap: spacing.md,
      background: color.brand.primary.base,
      textColor: color.brand.primary.contrastText,
    },
    headerMenu: {
      gap: spacing.sm,
      itemHeight: 32,
      paddingX: spacing.sm,
      borderRadius: radius.sm,
      fontWeight: typography.fontWeight.medium,
      color: color.brand.primary.contrastText,
      activeColor: color.brand.primary.base,
      activeBackground: color.brand.primary.contrastText,
      hoverBackground: "rgba(255, 255, 255, 0.16)",
      transitionMs: motion.duration.fast,
    },
    headerActions: {
      iconColor: color.brand.primary.contrastText,
      iconHoverBackground: "rgba(255, 255, 255, 0.16)",
      iconSize: 40,
      popoverWidth: 320,
      popoverHeight: 400,
      popoverPadding: spacing.md,
      popoverGap: spacing.md,
      popoverBorderWidth: 4,
      popoverBorderColor: color.brand.primary.base,
      gridGap: spacing.xs,
      gridItemPadding: spacing.sm,
      gridHoverBackground: color.neutral[100],
      emptyStateColor: color.neutral[500],
    },
    headerSignButton: {
      gap: spacing.sm,
      paddingX: spacing.lg,
      borderRadius: radius.sm,
      fontWeight: typography.fontWeight.medium,
    },
  } as const;

  return {
    color,
    spacing,
    radius,
    typography,
    shadow,
    motion,
    component,
  } as const;
};

export type DesignTokens = ReturnType<typeof createDesignTokens>;

export type DesignTokenOverrides = {
  brandPrimary?: string;
};

export const DESIGN_TOKENS = createDesignTokens();

export const getDesignTokens = (overrides?: DesignTokenOverrides) => {
  if (!overrides?.brandPrimary) {
    return DESIGN_TOKENS;
  }

  const candidate = normalizeHex(overrides.brandPrimary);
  if (candidate === DESIGN_TOKENS.color.brand.primary.base) {
    return DESIGN_TOKENS;
  }

  return createDesignTokens(candidate);
};
