import type { CSSProperties } from "react";

import { designTokenVar } from "@/shared/designSystem";

const HEADER_HEIGHT = designTokenVar("component.headerBar.minHeight", "48px");
const PAGE_PADDING_X = designTokenVar("spacing.lg", "16px");
const PAGE_PADDING_Y = designTokenVar("spacing.xl", "24px");
const CONTENT_MAX_WIDTH = designTokenVar(
  "component.headerBar.contentMaxWidth",
  "1200px",
);

export default function RouterFallback() {
  const layoutVars = {
    "--router-fallback-header-height": HEADER_HEIGHT,
    "--router-fallback-content-max-width": CONTENT_MAX_WIDTH,
    "--router-fallback-padding-x": PAGE_PADDING_X,
    "--router-fallback-padding-y": PAGE_PADDING_Y,
  } as CSSProperties & Record<`--${string}`, string>;

  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-screen bg-slate-50"
      style={layoutVars}
    >
      <div className="h-[var(--router-fallback-header-height)] bg-slate-200" />
      <div className="mx-auto box-border w-full max-w-[var(--router-fallback-content-max-width)] px-[var(--router-fallback-padding-x)] py-[var(--router-fallback-padding-y)]">
        <div className="space-y-2">
          <div className="h-[42px] w-[36%] animate-pulse rounded-md bg-slate-200" />
          <div className="h-14 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-14 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-14 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-[220px] animate-pulse rounded-lg bg-slate-200" />
        </div>
      </div>
    </div>
  );
}
