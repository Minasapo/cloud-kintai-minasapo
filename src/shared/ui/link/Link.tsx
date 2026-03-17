import {
  type AnchorHTMLAttributes,
  type CSSProperties,
  forwardRef,
  memo,
  type ReactNode,
} from "react";
import { Link as RouterLink } from "react-router-dom";

type LinkColor =
  | "inherit"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning";

type LinkVariant = "inherit" | "body1" | "body2" | "button";
type LinkUnderline = "always" | "hover" | "none";

export interface LinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "color"> {
  label?: ReactNode;
  href?: string;
  to?: string;
  color?: LinkColor;
  variant?: LinkVariant;
  underline?: LinkUnderline;
  sx?: CSSProperties;
}

const DEFAULT_LABEL: ReactNode = "link";
const DEFAULT_HREF = "/";
const DEFAULT_COLOR: LinkProps["color"] = "inherit";
const DEFAULT_VARIANT: LinkProps["variant"] = "button";
const DEFAULT_UNDERLINE: LinkProps["underline"] = "always";

const isInternalHref = (href: string) => href.startsWith("/");

const COLOR_STYLES: Record<NonNullable<LinkProps["color"]>, CSSProperties> = {
  inherit: { color: "inherit" },
  primary: { color: "var(--ds-color-brand-primary-base, #0FA85E)" },
  secondary: { color: "var(--ds-color-brand-secondary-base, #0B6D53)" },
  error: { color: "var(--ds-color-semantic-error, #DC2626)" },
  info: { color: "var(--ds-color-semantic-info, #2563EB)" },
  success: { color: "var(--ds-color-semantic-success, #16A34A)" },
  warning: { color: "var(--ds-color-semantic-warning, #D97706)" },
};

const VARIANT_STYLES: Record<NonNullable<LinkProps["variant"]>, CSSProperties> =
  {
    inherit: {
      font: "inherit",
      lineHeight: "inherit",
      letterSpacing: "inherit",
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.5,
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.43,
    },
    button: {
      fontSize: "0.875rem",
      lineHeight: 1.75,
      fontWeight: 500,
      textTransform: "uppercase",
    },
  };

const UNDERLINE_STYLES: Record<
  NonNullable<LinkProps["underline"]>,
  CSSProperties
> = {
  always: { textDecoration: "underline" },
  hover: { textDecoration: "none" },
  none: { textDecoration: "none" },
};

const LinkBase = forwardRef<HTMLAnchorElement, LinkProps>(function LinkBase(
  {
    label,
    children,
    href,
    to,
    color,
    variant,
    underline,
    className,
    style,
    sx,
    ...rest
  },
  ref,
) {
  const content = children ?? label ?? DEFAULT_LABEL;
  const resolvedHref = href ?? to ?? DEFAULT_HREF;
  const resolvedColor = color ?? DEFAULT_COLOR;
  const resolvedVariant = variant ?? DEFAULT_VARIANT;
  const resolvedUnderline = underline ?? DEFAULT_UNDERLINE;
  const hasExplicitColor = color !== undefined;
  const hasExplicitVariant = variant !== undefined;
  const hasExplicitUnderline = underline !== undefined;
  const mergedStyle: CSSProperties = {
    ...(hasExplicitVariant ? VARIANT_STYLES[resolvedVariant] : {}),
    ...(hasExplicitColor ? COLOR_STYLES[resolvedColor] : {}),
    ...(hasExplicitUnderline ? UNDERLINE_STYLES[resolvedUnderline] : {}),
    ...sx,
    ...style,
  };
  const hoverClassName =
    resolvedUnderline === "hover"
      ? "hover:underline focus-visible:underline"
      : "";
  const mergedClassName = [hoverClassName, className].filter(Boolean).join(" ");

  if (isInternalHref(resolvedHref)) {
    return (
      <RouterLink
        ref={ref}
        to={resolvedHref}
        className={mergedClassName || undefined}
        style={mergedStyle}
        {...rest}
      >
        {content}
      </RouterLink>
    );
  }

  return (
    <a
      ref={ref}
      href={resolvedHref}
      className={mergedClassName || undefined}
      style={mergedStyle}
      {...rest}
    >
      {content}
    </a>
  );
});

LinkBase.displayName = "Link";

const Link = memo(LinkBase);
Link.displayName = "Link";

export default Link;
