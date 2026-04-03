import CommonBreadcrumbs, {
  type BreadcrumbItem,
} from "@shared/ui/breadcrumbs/CommonBreadcrumbs";
import Title from "@shared/ui/typography/Title";
import type { CSSProperties, ReactNode } from "react";

import { designTokenVar } from "@/shared/designSystem";
import {
  getPageWidthStyle,
  type LegacyPageMaxWidth,
  type PageWidthPreset,
  resolveLegacyPageWidth,
} from "@/shared/ui/layout/pageWidthPresets";

const PAGE_SECTION_GAP = designTokenVar("component.page.sectionGap", "16px");

interface PageProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  children: ReactNode;
  width?: PageWidthPreset;
  maxWidth?: LegacyPageMaxWidth;
  showDefaultHeader?: boolean;
}

export default function Page({
  title,
  breadcrumbs = [{ label: "TOP", href: "/" }],
  children,
  width,
  maxWidth = "xl",
  showDefaultHeader = true,
}: PageProps) {
  const resolvedWidth = width ?? resolveLegacyPageWidth(maxWidth);
  const maxWidthStyle: CSSProperties = getPageWidthStyle(resolvedWidth);

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
