import MuiLink, { LinkProps as MuiLinkProps } from "@mui/material/Link";
import { forwardRef, memo, ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";

export interface LinkProps extends MuiLinkProps {
  label?: ReactNode;
}

const DEFAULT_LABEL: ReactNode = "link";
const DEFAULT_HREF = "/";
const DEFAULT_COLOR: LinkProps["color"] = "primary";
const DEFAULT_VARIANT: LinkProps["variant"] = "button";

const isInternalHref = (href: string) => href.startsWith("/");

const LinkBase = forwardRef<HTMLAnchorElement, LinkProps>(function LinkBase(
  {
    label,
    children,
    href = DEFAULT_HREF,
    color = DEFAULT_COLOR,
    variant = DEFAULT_VARIANT,
    ...rest
  },
  ref,
) {
  const content = children ?? label ?? DEFAULT_LABEL;

  if (isInternalHref(href)) {
    return (
      <MuiLink
        ref={ref}
        component={RouterLink}
        to={href}
        color={color}
        variant={variant}
        {...rest}
      >
        {content}
      </MuiLink>
    );
  }

  return (
    <MuiLink ref={ref} href={href} color={color} variant={variant} {...rest}>
      {content}
    </MuiLink>
  );
});

LinkBase.displayName = "Link";

const Link = memo(LinkBase);
Link.displayName = "Link";

export default Link;
