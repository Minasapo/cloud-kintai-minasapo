import { createElement, type HTMLAttributes, type ReactNode } from "react";

const DASHBOARD_INNER_SURFACE_CLASS_NAME =
  "rounded-lg border border-slate-200 bg-white p-4 md:p-6";

export interface DashboardInnerSurfaceProps
  extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export function DashboardInnerSurface({
  className,
  children,
  ...rest
}: DashboardInnerSurfaceProps) {
  return createElement(
    "div",
    {
      className: [DASHBOARD_INNER_SURFACE_CLASS_NAME, className]
        .filter(Boolean)
        .join(" "),
      ...rest,
    },
    children,
  );
}
