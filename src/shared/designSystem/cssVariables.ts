import type { DesignTokens } from "./tokens";
import { DESIGN_TOKENS, getDesignTokens } from "./tokens";

const CSS_VAR_PREFIX = "--ds";

const toKebabCase = (value: string) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/_/g, "-")
    .toLowerCase();

type PrimitiveTokenValue = string | number | boolean;

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isLineHeightPath = (path: string[]) => path.includes("lineHeight");
const isFontWeightPath = (path: string[]) => path.includes("fontWeight");
const isDurationPath = (path: string[]) =>
  path[0] === "motion" && path[1] === "duration";
const isTransitionKey = (key: string | undefined) =>
  Boolean(key && /duration|transition|ms/i.test(key));
const isOpacityKey = (key: string | undefined) =>
  Boolean(key && /opacity/i.test(key));

const formatNumericValue = (path: string[], value: number) => {
  const lastKey = path[path.length - 1];
  if (isDurationPath(path) || isTransitionKey(lastKey)) {
    return `${value}ms`;
  }
  if (
    isLineHeightPath(path) ||
    isFontWeightPath(path) ||
    isOpacityKey(lastKey)
  ) {
    return `${value}`;
  }
  return `${value}px`;
};

const formatTokenValue = (path: string[], value: PrimitiveTokenValue) => {
  if (typeof value === "number") {
    return formatNumericValue(path, value);
  }
  if (typeof value === "boolean") {
    return value ? "1" : "0";
  }
  return value;
};

const buildCssVariableEntries = (
  node: Record<string, unknown>,
  path: string[] = []
): Array<[string, string]> => {
  const entries: Array<[string, string]> = [];

  Object.entries(node).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    const nextPath = [...path, key];
    if (isPlainObject(value)) {
      entries.push(...buildCssVariableEntries(value, nextPath));
      return;
    }

    const varName = `${CSS_VAR_PREFIX}-${nextPath
      .map((segment) => toKebabCase(String(segment)))
      .join("-")}`;
    const formattedValue = formatTokenValue(
      nextPath,
      value as PrimitiveTokenValue
    );
    entries.push([varName, formattedValue]);
  });

  return entries;
};

const normalizePathSegments = (path: string | string[]) => {
  const segments = Array.isArray(path) ? path : path.split(".");
  return segments.map((segment) => segment.trim()).filter(Boolean);
};

export const getDesignTokenVarName = (path: string | string[]) => {
  const normalized = normalizePathSegments(path);
  return `${CSS_VAR_PREFIX}-${normalized
    .map((segment) => toKebabCase(segment))
    .join("-")}`;
};

export const designTokenVar = (
  path: string | string[],
  fallback?: string | number
) => {
  const varName = getDesignTokenVarName(path);
  if (fallback === undefined) {
    return `var(${varName})`;
  }
  const fallbackValue =
    typeof fallback === "number" ? String(fallback) : fallback;
  return `var(${varName}, ${fallbackValue})`;
};

export const getDesignTokenCssVariableEntries = (tokens: DesignTokens) =>
  buildCssVariableEntries(tokens as unknown as Record<string, unknown>);

export const applyDesignTokenCssVariables = (
  tokens: DesignTokens,
  target?: HTMLElement
) => {
  if (typeof document === "undefined") {
    return tokens;
  }

  const host = target ?? document.documentElement;
  const entries = getDesignTokenCssVariableEntries(tokens);
  entries.forEach(([name, value]) => {
    host.style.setProperty(name, value);
  });
  return tokens;
};

export const bootstrapDesignSystem = (brandPrimary?: string) => {
  const tokens = brandPrimary
    ? getDesignTokens({ brandPrimary })
    : DESIGN_TOKENS;
  return applyDesignTokenCssVariables(tokens);
};

export { CSS_VAR_PREFIX as DESIGN_SYSTEM_CSS_VAR_PREFIX };
