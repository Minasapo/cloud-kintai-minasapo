import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

import { roleGuideSidebars } from "./src/data/roleGuides";

type SidebarEntry =
  | string
  | {
      type: "category";
      label: string;
      items: SidebarEntry[];
    };

function createCategory(label: string, items: SidebarEntry[]): SidebarEntry {
  return {
    type: "category",
    label,
    items,
  };
}

function createRoleGuideSidebar({
  label,
  overviewDocId,
  useCasesDocId,
  featuresDocId,
  navigationDocId,
  faqDocId,
  useCasesLabel,
  featuresLabel,
  useCaseDocIds,
  featureDocIds,
}: (typeof roleGuideSidebars)[number]): SidebarEntry {
  return createCategory(label, [
    overviewDocId,
    navigationDocId,
    createCategory(useCasesLabel, [useCasesDocId, ...useCaseDocIds]),
    createCategory(featuresLabel, [featuresDocId, ...featureDocIds]),
    faqDocId,
  ]);
}

const mainSidebar: SidebarEntry[] = [
  "intro",
  "terminology",
  "work-type-overview",
  "work-status-overview",
  "screen-list",
  ...roleGuideSidebars.map(createRoleGuideSidebar),
  createCategory("開発者向けガイド", [
    "developer/overview",
    "developer/getting-started/development-flow",
    "developer/getting-started/setup",
    "developer/testing-operations",
    createCategory("Amplify", [
      "developer/amplify/overview",
      "developer/amplify/setup-and-access",
      "developer/amplify/change-workflow",
      "developer/amplify/schema-change-procedure",
    ]),
    createCategory("デザインシステム", [
      "developer/design-system/overview",
      "developer/design-system/foundations",
      "developer/design-system/heading-rules",
      "developer/design-system/screen-recipes",
      "developer/design-system/implementation-rules",
    ]),
    createCategory("アーキテクチャ", [
      "developer/architecture/directory-structure",
      "developer/architecture/dependency-rules",
      "developer/architecture/placement-guide",
      "developer/architecture/sidebar-category-rules",
    ]),
    "developer/workflow",
    "developer/attendance-management-enabled",
    "developer/attendance-error-list-display",
    "developer/attendance-status-determination",
    "developer/attendance-statistics",
    "developer/shift-visibility-by-work-type",
    "developer/break-time-specification",
    "developer/close-date-system",
    "developer/data-fetch-periods",
  ]),
];

const sidebars = {
  mainSidebar,
} satisfies SidebarsConfig;

export default sidebars;
