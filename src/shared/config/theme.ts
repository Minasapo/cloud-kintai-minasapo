import { getDesignTokens as buildDesignTokens } from "@/shared/designSystem";

const DEFAULT_THEME_TOKENS = buildDesignTokens();

export const DEFAULT_THEME_COLOR =
  DEFAULT_THEME_TOKENS.color.brand.primary.base;

export const resolveThemeColor = (brandPrimary?: string) =>
  buildDesignTokens(brandPrimary ? { brandPrimary } : undefined).color.brand
    .primary.base;
