import {
  DESIGN_TOKENS,
  getDesignTokens as buildDesignTokens,
} from "@/constants/designTokens";

export { DESIGN_TOKENS, getDesignTokens } from "@/constants/designTokens";

export const DEFAULT_THEME_COLOR = DESIGN_TOKENS.color.brand.primary.base;

export const resolveThemeColor = (brandPrimary?: string) =>
  buildDesignTokens(brandPrimary ? { brandPrimary } : undefined).color.brand
    .primary.base;
