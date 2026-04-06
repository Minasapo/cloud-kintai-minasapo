import type { CSSProperties } from "react";

import { designTokenVar } from "@/shared/designSystem";

export type PageWidthPreset =
  | "narrow"
  | "form"
  | "content"
  | "dashboard"
  | "wide"
  | "full";

export type LegacyPageMaxWidth = "xl" | "lg" | "md" | "sm" | false;

type PageWidthTokenKey = Exclude<PageWidthPreset, "full"> | "sm";

const PAGE_WIDTH_FALLBACKS: Record<PageWidthTokenKey, string> = {
  sm: "640px",
  narrow: "768px",
  form: "1024px",
  content: "1180px",
  dashboard: "1280px",
  wide: "1360px",
};

const PAGE_WIDTH_TOKEN_KEYS: Record<PageWidthTokenKey, string> = {
  sm: "legacySm",
  narrow: "narrow",
  form: "form",
  content: "content",
  dashboard: "dashboard",
  wide: "wide",
};

export const PAGE_PADDING_X = {
  xs: designTokenVar("component.page.paddingX.xs", "16px"),
  md: designTokenVar("component.page.paddingX.md", "32px"),
} as const;

export const resolveLegacyPageWidth = (
  maxWidth: LegacyPageMaxWidth | undefined,
): PageWidthPreset | "sm" => {
  if (maxWidth === false) {
    return "full";
  }

  switch (maxWidth) {
    case "md":
      return "narrow";
    case "lg":
      return "form";
    case "sm":
      return "sm";
    case "xl":
    default:
      return "content";
  }
};

export const getPageWidthMaxWidth = (
  width: PageWidthPreset | "sm",
): CSSProperties["maxWidth"] => {
  if (width === "full") {
    return undefined;
  }

  const tokenKey = PAGE_WIDTH_TOKEN_KEYS[width];
  const fallback = PAGE_WIDTH_FALLBACKS[width];
  return designTokenVar(`component.page.widths.${tokenKey}`, fallback);
};

export const getPageWidthStyle = (
  width: PageWidthPreset | "sm",
): CSSProperties => {
  if (width === "full") {
    return {};
  }

  return {
    marginInline: "auto",
    maxWidth: getPageWidthMaxWidth(width),
  };
};
