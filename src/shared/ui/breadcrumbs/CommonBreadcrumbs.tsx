import type { CSSProperties } from "react";

import { designTokenVar } from "@/shared/designSystem";
import Link from "@/shared/ui/link/Link";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

interface CommonBreadcrumbsProps {
  items: BreadcrumbItem[];
  current: string;
}

export default function CommonBreadcrumbs({
  items,
  current,
}: CommonBreadcrumbsProps) {
  const BREADCRUMB_GAP = designTokenVar("component.breadcrumbs.gap", "8px");
  const BREADCRUMB_SEPARATOR_COLOR = designTokenVar(
    "component.breadcrumbs.separatorColor",
    "#A0B1A7",
  );
  const BREADCRUMB_LINK_COLOR = designTokenVar(
    "component.breadcrumbs.linkColor",
    "#0FA85E",
  );
  const BREADCRUMB_TEXT_COLOR = designTokenVar(
    "component.breadcrumbs.textColor",
    "#45574F",
  );
  const BREADCRUMB_FONT_SIZE = designTokenVar(
    "component.breadcrumbs.fontSize",
    "14px",
  );
  const BREADCRUMB_FONT_WEIGHT = designTokenVar(
    "component.breadcrumbs.fontWeight",
    "500",
  );
  const breadcrumbVars: CSSProperties & Record<`--${string}`, string> = {
    "--breadcrumbs-gap": BREADCRUMB_GAP,
    "--breadcrumbs-separator-color": BREADCRUMB_SEPARATOR_COLOR,
    "--breadcrumbs-link-color": BREADCRUMB_LINK_COLOR,
    "--breadcrumbs-text-color": BREADCRUMB_TEXT_COLOR,
    "--breadcrumbs-font-size": BREADCRUMB_FONT_SIZE,
    "--breadcrumbs-font-weight": BREADCRUMB_FONT_WEIGHT,
  };

  return (
    <nav
      aria-label="breadcrumb"
      className="text-[length:var(--breadcrumbs-font-size)] font-[var(--breadcrumbs-font-weight)]"
      style={breadcrumbVars}
    >
      <ol className="flex flex-wrap items-center gap-[var(--breadcrumbs-gap)]">
        {items.map((item, idx) => (
          <li key={`${item.label}-${idx}`} className="flex items-center gap-[var(--breadcrumbs-gap)]">
            {item.href ? (
              <Link
                href={item.href}
                variant="body2"
                underline="hover"
                className="text-[color:var(--breadcrumbs-link-color)] no-underline"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-[color:var(--breadcrumbs-text-color)]">
                {item.label}
              </span>
            )}
            <span
              aria-hidden="true"
              className="text-[color:var(--breadcrumbs-separator-color)]"
            >
              /
            </span>
          </li>
        ))}
        <li
          className="text-[color:var(--breadcrumbs-text-color)]"
          aria-current="page"
        >
          {current}
        </li>
      </ol>
    </nav>
  );
}
