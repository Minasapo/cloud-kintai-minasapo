import CommonBreadcrumbs, {
  type BreadcrumbItem,
} from "@shared/ui/breadcrumbs/CommonBreadcrumbs";
import Title from "@shared/ui/typography/Title";
import type { CSSProperties, ReactNode } from "react";

import { designTokenVar } from "@/shared/designSystem";

const PAGE_SECTION_GAP = designTokenVar("component.page.sectionGap", "16px");
const PAGE_MAX_WIDTH_STYLES = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1250px",
} as const;
const PAGE_CENTERED_STYLE: CSSProperties = {
  marginInline: "auto",
};

interface PageProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  children: ReactNode;
  maxWidth?: "xl" | "lg" | "md" | "sm" | false;
  showDefaultHeader?: boolean;
}

export default function Page({
  title,
  breadcrumbs = [{ label: "TOP", href: "/" }],
  children,
  maxWidth = "xl",
  showDefaultHeader = true,
}: PageProps) {
  const maxWidthStyle: CSSProperties =
    maxWidth === false
      ? {}
      : {
          ...PAGE_CENTERED_STYLE,
          maxWidth: PAGE_MAX_WIDTH_STYLES[maxWidth],
        };

  return (
    <div style={maxWidthStyle}>
      <div className="flex flex-col" style={{ gap: PAGE_SECTION_GAP }}>
        {showDefaultHeader && (
          <>
            <CommonBreadcrumbs items={breadcrumbs} current={title} />
            <Title>{title}</Title>
          </>
        )}
        {children}
      </div>
    </div>
  );
}
