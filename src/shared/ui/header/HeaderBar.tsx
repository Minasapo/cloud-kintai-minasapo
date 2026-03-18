import type { CSSProperties, ReactNode } from "react";

import { designTokenVar } from "@/shared/designSystem";

interface HeaderBarProps {
  themeColor?: string;
  logo: ReactNode;
  navigation: ReactNode;
  centerContent?: ReactNode;
  notificationsButton?: ReactNode;
  externalLinks?: ReactNode;
  signInOutButton: ReactNode;
}

const HEADER_ACCENT = designTokenVar("component.headerBar.accent", "#0FA85E");
const HEADER_SURFACE = designTokenVar(
  "component.headerBar.surface",
  "#F7FCF8",
);
const HEADER_BORDER = designTokenVar(
  "component.headerBar.borderColor",
  "rgba(15, 168, 94, 0.14)",
);
const HEADER_TEXT = designTokenVar("component.headerBar.textColor", "#1E2A25");
const HEADER_CONTENT_MAX_WIDTH = designTokenVar(
  "component.headerBar.contentMaxWidth",
  "1280px",
);
const HEADER_PADDING_X = designTokenVar("component.headerBar.paddingX", "16px");
const HEADER_PADDING_Y = designTokenVar("component.headerBar.paddingY", "10px");
const HEADER_INNER_PADDING_X = designTokenVar(
  "component.headerBar.innerPaddingX",
  "14px",
);
const HEADER_INNER_PADDING_Y = designTokenVar(
  "component.headerBar.innerPaddingY",
  "10px",
);

export default function HeaderBar({
  themeColor,
  logo,
  navigation,
  centerContent,
  notificationsButton,
  externalLinks,
  signInOutButton,
}: HeaderBarProps) {
  const hasCenterContent = Boolean(centerContent);

  return (
    <header
      style={
        {
          "--header-accent": themeColor ?? HEADER_ACCENT,
          "--header-surface": HEADER_SURFACE,
          "--header-border": HEADER_BORDER,
          "--header-text": HEADER_TEXT,
          "--ds-component-header-menu-color": "#45574F",
          "--ds-component-header-menu-active-color": "#065F46",
          "--ds-component-header-menu-active-background": "#ECFDF3",
          "--ds-component-header-menu-hover-background":
            "rgba(15, 168, 94, 0.1)",
          "--ds-component-header-actions-icon-color": "#45574F",
          "--ds-component-header-actions-icon-hover-background":
            "rgba(15, 168, 94, 0.1)",
          "--ds-component-header-sign-button-text-color": "#1E2A25",
          "--header-content-max-width": HEADER_CONTENT_MAX_WIDTH,
          "--header-padding-x": HEADER_PADDING_X,
          "--header-padding-y": HEADER_PADDING_Y,
          "--header-inner-padding-x": HEADER_INNER_PADDING_X,
          "--header-inner-padding-y": HEADER_INNER_PADDING_Y,
        } as CSSProperties & Record<`--${string}`, string>
      }
      className="border-b border-[var(--header-border)] bg-[linear-gradient(180deg,rgba(15,168,94,0.16)_0%,rgba(236,253,245,0.92)_52%,rgba(248,250,249,0.88)_100%)]"
    >
      <div className="mx-auto w-full max-w-[var(--header-content-max-width)] px-[var(--header-padding-x)] py-[var(--header-padding-y)]">
        <div className="rounded-[1.6rem] border border-[var(--header-border)] bg-[linear-gradient(135deg,var(--header-surface)_0%,#ECFDF5_52%,#FFFFFF_100%)] text-[color:var(--header-text)] shadow-[0_24px_40px_-34px_rgba(15,23,42,0.26)]">
          <div className="px-[var(--header-inner-padding-x)] py-[var(--header-inner-padding-y)]">
            <div
              className={[
                "grid min-w-0 items-center gap-2 md:gap-3",
                "grid-cols-[minmax(0,1fr)_auto]",
                hasCenterContent
                  ? "lg:grid-cols-[auto_minmax(180px,1fr)_minmax(120px,auto)_auto]"
                  : "lg:grid-cols-[auto_minmax(180px,1fr)_auto]",
              ].join(" ")}
            >
              <div className="flex min-w-0 items-center overflow-hidden">
                {logo}
              </div>

              <div className="hidden min-w-0 items-center justify-start rounded-full bg-white/70 px-1.5 py-1 lg:flex">
                {navigation}
              </div>

              <div className="hidden min-w-0 items-center justify-center lg:flex">
                {centerContent}
              </div>

              <div className="flex min-w-fit flex-nowrap items-center justify-end gap-1 md:gap-1.5">
                <div className="block text-[color:var(--header-text)] lg:hidden rounded-full bg-white/70 px-1.5 py-1">
                  {navigation}
                </div>
                <div className="shrink-0 text-[color:var(--header-text)]">{notificationsButton}</div>
                <div className="shrink-0 text-[color:var(--header-text)]">{externalLinks}</div>
                {signInOutButton}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
