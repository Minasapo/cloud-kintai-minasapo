import { CSSProperties, ReactNode } from "react";

import { designTokenVar } from "@/shared/designSystem";

const GROUP_BORDER_WIDTH = designTokenVar(
  "component.groupContainer.borderWidth",
  "1px",
);
const GROUP_ACCENT_WIDTH = designTokenVar(
  "component.groupContainer.accentWidthMobile",
  "4px",
);
const GROUP_BORDER_COLOR = designTokenVar(
  "component.groupContainer.borderColor",
  "#D9E2DD",
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
  "component.groupContainer.paddingMobile",
  "12px",
);
const GROUP_BACKGROUND = designTokenVar(
  "component.groupContainer.background",
  "#FFFFFF",
);
const GROUP_CONTENT_GAP = designTokenVar(
  "component.groupContainer.contentGap",
  "8px",
);
const GROUP_COUNT_COLOR = designTokenVar(
  "component.groupContainer.countColor",
  "#5E726A",
);

export interface GroupContainerMobileProps {
  title?: string;
  count?: number;
  hideAccent?: boolean;
  hideBorder?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

const GroupContainerMobile = ({
  title,
  count,
  hideAccent = false,
  hideBorder = false,
  children,
  className,
  style,
}: GroupContainerMobileProps) => {
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
        "rounded-[var(--group-radius)] border-solid bg-[var(--group-background)] p-[var(--group-padding)]",
        borderClassName,
        accentClassName,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ ...groupVars, ...style }}
    >
      {title ? (
        <div className="flex items-center justify-between">
          <h2 className="m-0 text-base font-bold leading-6 text-slate-900">
            {title}
          </h2>
          {typeof count === "number" && (
            <span className="text-xs leading-5 text-[color:var(--group-count-color)]">
              {`(${count}件)`}
            </span>
          )}
        </div>
      ) : null}

      <div className="mt-[var(--group-content-gap)]">{children}</div>
    </section>
  );
};

export default GroupContainerMobile;
