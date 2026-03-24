import { CSSProperties, ReactNode, useId, useState } from "react";

import { designTokenVar } from "@/shared/designSystem";

const GROUP_BORDER_WIDTH = designTokenVar(
  "component.groupContainer.borderWidth",
  "1px",
);
const GROUP_ACCENT_WIDTH = designTokenVar(
  "component.groupContainer.accentWidth",
  "3px",
);
const GROUP_BORDER_COLOR = designTokenVar(
  "component.groupContainer.borderColor",
  "#E8EFEB",
);
const GROUP_ACCENT_COLOR = designTokenVar(
  "component.groupContainer.accentColor",
  "#0FA85E",
);
const GROUP_RADIUS = designTokenVar(
  "component.groupContainer.borderRadius",
  "12px",
);
const GROUP_PADDING = designTokenVar(
  "component.groupContainer.padding",
  "16px",
);
const GROUP_BACKGROUND = designTokenVar(
  "component.groupContainer.background",
  "#FFFFFF",
);
const GROUP_SHADOW = designTokenVar(
  "component.groupContainer.shadow",
  "0 2px 4px rgba(15, 168, 94, 0.04)",
);
const GROUP_HEADER_GAP = designTokenVar(
  "component.groupContainer.headerGap",
  "8px",
);
const GROUP_CONTENT_GAP = designTokenVar(
  "component.groupContainer.contentGap",
  "8px",
);
const GROUP_COUNT_COLOR = designTokenVar(
  "component.groupContainer.countColor",
  "#5E726A",
);

export interface GroupContainerProps {
  title?: string;
  count?: number;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  hideAccent?: boolean;
  hideBorder?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

function ChevronIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {collapsed ? <path d="m6 8 4 4 4-4" /> : <path d="m6 12 4-4 4 4" />}
    </svg>
  );
}

const GroupContainer = ({
  title,
  count,
  collapsible = false,
  defaultCollapsed = false,
  hideAccent = false,
  hideBorder = false,
  children,
  className,
  style,
}: GroupContainerProps) => {
  const [collapsed, setCollapsed] = useState<boolean>(defaultCollapsed);
  const contentId = useId();
  const borderClassName = hideBorder
    ? "border-0"
    : "border-[var(--group-border-width)] border-[var(--group-border-color)]";
  const accentClassName = hideAccent
    ? "border-l-0"
    : "border-l-[var(--group-accent-width)] border-l-[var(--group-accent-color)]";
  const groupVars: CSSProperties & Record<`--${string}`, string> = {
    "--group-border-width": GROUP_BORDER_WIDTH,
    "--group-accent-width": GROUP_ACCENT_WIDTH,
    "--group-border-color": GROUP_BORDER_COLOR,
    "--group-accent-color": GROUP_ACCENT_COLOR,
    "--group-radius": GROUP_RADIUS,
    "--group-padding": GROUP_PADDING,
    "--group-background": GROUP_BACKGROUND,
    "--group-shadow": GROUP_SHADOW,
    "--group-header-gap": GROUP_HEADER_GAP,
    "--group-content-gap": GROUP_CONTENT_GAP,
    "--group-count-color": GROUP_COUNT_COLOR,
  };
  if (hideAccent) {
    groupVars["--group-accent-width"] = "0px";
  }
  if (hideBorder) {
    groupVars["--group-border-width"] = "0px";
    groupVars["--group-border-color"] = "transparent";
  }

  return (
    <section
      className={[
        "rounded-[var(--group-radius)] border-solid bg-[var(--group-background)] p-[var(--group-padding)] shadow-[var(--group-shadow)]",
        borderClassName,
        accentClassName,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ ...groupVars, ...style }}
    >
      {(title || collapsible) && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[var(--group-header-gap)]">
            {title ? (
              <h2 className="m-0 text-base font-bold leading-6 text-slate-900">
                {title}
              </h2>
            ) : null}
            {typeof count === "number" && (
              <span className="text-xs leading-5 text-[color:var(--group-count-color)]">
                {`(${count}件)`}
              </span>
            )}
          </div>
          {collapsible && (
            <button
              type="button"
              onClick={() => setCollapsed((s) => !s)}
              aria-label={collapsed ? "expand" : "collapse"}
              aria-expanded={!collapsed}
              aria-controls={contentId}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border-0 bg-transparent p-0 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <ChevronIcon collapsed={collapsed} />
            </button>
          )}
        </div>
      )}

      <div
        id={contentId}
        hidden={collapsed}
        className="mt-[var(--group-content-gap)]"
      >
        {children}
      </div>
    </section>
  );
};

export default GroupContainer;
