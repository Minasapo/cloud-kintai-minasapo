import {
  type AnchorHTMLAttributes,
  forwardRef,
  memo,
  type ReactNode,
} from "react";
import { Link as RouterLink } from "react-router-dom";

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  label?: ReactNode;
  href?: string;
  to?: string;
}

const DEFAULT_LABEL: ReactNode = "link";
const DEFAULT_HREF = "/";

const isInternalHref = (href: string) => href.startsWith("/");

const LinkBase = forwardRef<HTMLAnchorElement, LinkProps>(function LinkBase(
  {
    label,
    children,
    href,
    to,
    className,
    ...rest
  },
  ref,
) {
  const content = children ?? label ?? DEFAULT_LABEL;
  const resolvedHref = href ?? to ?? DEFAULT_HREF;
  const mergedClassName = ["no-underline", className].filter(Boolean).join(" ");

  if (isInternalHref(resolvedHref)) {
    return (
      <RouterLink
        ref={ref}
        to={resolvedHref}
        className={mergedClassName}
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
      className={mergedClassName}
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
