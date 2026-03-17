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

const HEADER_BACKGROUND = designTokenVar(
  "component.headerBar.background",
  "#0FA85E"
);
const HEADER_TEXT = designTokenVar("component.headerBar.textColor", "#FFFFFF");
const HEADER_HEIGHT = designTokenVar("component.headerBar.minHeight", "48px");
const HEADER_PADDING_X = designTokenVar("component.headerBar.paddingX", "16px");
const HEADER_PADDING_Y = designTokenVar("component.headerBar.paddingY", "8px");
const HEADER_GAP = designTokenVar("component.headerBar.gap", "8px");
const HEADER_SIDE_GAP = designTokenVar("spacing.md", "12px");
const HEADER_CONTENT_MAX_WIDTH = designTokenVar(
  "component.headerBar.contentMaxWidth",
  "1200px"
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
  const headerBackground = themeColor ?? HEADER_BACKGROUND;
  const hasCenterContent = Boolean(centerContent);

  return (
    <header style={{ width: "100%" }}>
      <div style={{ backgroundColor: headerBackground }}>
        <div
          className="box-border w-full px-[6px] md:px-[var(--header-padding-x)]"
          style={
            {
              ["--header-padding-x" as string]: HEADER_PADDING_X,
            } as CSSProperties
          }
        >
          <div
            className="mx-0 max-w-full md:mx-auto md:max-w-[var(--header-content-max-width)]"
            style={
              {
                ["--header-content-max-width" as string]: HEADER_CONTENT_MAX_WIDTH,
              } as CSSProperties
            }
          >
            <div
              className={[
                "grid w-full min-w-0 items-center gap-x-[2px] text-[color:var(--header-text)] md:gap-x-[var(--header-gap)]",
                "grid-cols-[minmax(0,1fr)_auto]",
                hasCenterContent
                  ? "lg:grid-cols-[auto_minmax(0,1fr)_auto_auto]"
                  : "lg:grid-cols-[auto_minmax(0,1fr)_auto]",
              ].join(" ")}
              style={
                {
                  minHeight: HEADER_HEIGHT,
                  paddingTop: HEADER_PADDING_Y,
                  paddingBottom: HEADER_PADDING_Y,
                  ["--header-gap" as string]: HEADER_GAP,
                  ["--header-side-gap" as string]: HEADER_SIDE_GAP,
                  ["--header-text" as string]: HEADER_TEXT,
                } as CSSProperties
              }
            >
              <div className="flex h-full min-w-0 items-center justify-start overflow-hidden pr-[6px] md:pr-0">
                {logo}
              </div>

              <div className="hidden min-w-0 items-center justify-center px-[var(--header-side-gap)] lg:flex">
                {navigation}
              </div>

              <div className="hidden min-w-0 items-center justify-center px-[var(--header-side-gap)] lg:flex">
                {centerContent}
              </div>

              <div className="flex min-w-fit flex-wrap items-center justify-end justify-self-end gap-x-[2px] gap-y-1 md:gap-x-[var(--header-gap)] md:gap-y-[var(--header-gap)]">
                <div className="block lg:hidden">{navigation}</div>
                <div>{notificationsButton}</div>
                <div>{externalLinks}</div>
                {signInOutButton}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
