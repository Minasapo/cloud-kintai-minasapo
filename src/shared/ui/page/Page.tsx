import CommonBreadcrumbs, {
  type BreadcrumbItem,
} from "@shared/ui/breadcrumbs/CommonBreadcrumbs";
import Title from "@shared/ui/typography/Title";
import type { CSSProperties, ReactNode } from "react";

import { designTokenVar } from "@/shared/designSystem";

const PAGE_PADDING_TOP = designTokenVar("component.page.paddingTop", "24px");
const PAGE_SECTION_GAP = designTokenVar("component.page.sectionGap", "16px");

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
          maxWidth:
            {
              sm: "640px",
              md: "768px",
              lg: "1024px",
              xl: "1280px",
            }[maxWidth] ?? "1280px",
          marginInline: "auto",
        };

  return (
    <div
      className="pt-6"
      style={{ paddingTop: PAGE_PADDING_TOP, ...maxWidthStyle }}
    >
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
