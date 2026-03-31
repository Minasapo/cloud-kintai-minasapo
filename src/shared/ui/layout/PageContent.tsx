import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

import {
  getPageWidthStyle,
  PAGE_PADDING_X,
  type PageWidthPreset,
} from "./pageWidthPresets";

type PageContentProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
  width?: PageWidthPreset;
  paddingX?: "page" | "none";
};

export default function PageContent({
  children,
  className,
  style,
  width = "content",
  paddingX = "page",
  ...rest
}: PageContentProps) {
  const paddingXVars =
    paddingX === "none"
      ? {
          "--page-content-padding-x-xs": "0px",
          "--page-content-padding-x-md": "0px",
        }
      : {
          "--page-content-padding-x-xs": PAGE_PADDING_X.xs,
          "--page-content-padding-x-md": PAGE_PADDING_X.md,
        };

  const mergedStyle = {
    ...getPageWidthStyle(width),
    ...paddingXVars,
    ...style,
  } as CSSProperties;

  return (
    <div
      className={[
        "w-full min-w-0 px-[var(--page-content-padding-x-xs)] md:px-[var(--page-content-padding-x-md)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={mergedStyle}
      {...rest}
    >
      {children}
    </div>
  );
}
