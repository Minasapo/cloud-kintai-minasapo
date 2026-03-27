import type { CSSProperties, ReactNode } from "react";

import { designTokenVar } from "@/shared/designSystem";

type HeadlineProps = {
  children: ReactNode;
};

export const Headline = ({ children }: HeadlineProps) => {
  const HEADLINE_ACCENT_COLOR = designTokenVar(
    "component.headline.accentColor",
    "#0FA85E",
  );
  const HEADLINE_BORDER_WIDTH = designTokenVar(
    "component.headline.borderWidth",
    "5px",
  );
  const HEADLINE_PADDING_LEFT = designTokenVar(
    "component.headline.paddingLeft",
    "8px",
  );
  const HEADLINE_TEXT_COLOR = designTokenVar(
    "component.headline.textColor",
    "#0FA85E",
  );

  const headlineStyle: CSSProperties & Record<`--${string}`, string> = {
    "--headline-accent-color": HEADLINE_ACCENT_COLOR,
    "--headline-border-width": HEADLINE_BORDER_WIDTH,
    "--headline-padding-left": HEADLINE_PADDING_LEFT,
    "--headline-text-color": HEADLINE_TEXT_COLOR,
  };

  return (
    <h2
      className="border-b-[var(--headline-border-width)] border-l-[var(--headline-border-width)] border-[color:var(--headline-accent-color)] pl-[var(--headline-padding-left)] text-3xl font-bold leading-tight text-[color:var(--headline-text-color)] sm:text-4xl"
      style={headlineStyle}
    >
      {children}
    </h2>
  );
};
