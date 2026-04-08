import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

import { roleGuideSidebars } from "./src/data/roleGuides";

function createRoleGuideSidebar({
  label,
  overviewDocId,
  navigationDocId,
  faqDocId,
  useCasesLabel,
  featuresLabel,
  useCaseDocIds,
  featureDocIds,
}: (typeof roleGuideSidebars)[number]): SidebarsConfig["mainSidebar"][number] {
  return {
    type: "category",
    label,
    items: [
      overviewDocId,
      navigationDocId,
      {
        type: "category",
        label: useCasesLabel,
        items: [
          overviewDocId.replace("/overview", "/use-cases"),
          ...useCaseDocIds.filter((docId) => !docId.endsWith("/faq")),
        ],
      },
      {
        type: "category",
        label: featuresLabel,
        items: [
          overviewDocId.replace("/overview", "/features"),
          ...featureDocIds.filter((docId) => !docId.endsWith("/faq")),
        ],
      },
      faqDocId,
    ],
  };
}

const sidebars: SidebarsConfig = {
  mainSidebar: [
    "intro",
    "terminology",
    "work-type-overview",
    "work-status-overview",
    "screen-list",
    ...roleGuideSidebars.map(createRoleGuideSidebar),
    {
      type: "category",
      label: "開発者向けガイド",
      items: [
        "developer/overview",
        "developer/getting-started/development-flow",
        "developer/getting-started/setup",
        "developer/testing-operations",
        "developer/docs-authoring",
        {
          type: "category",
          label: "Amplify",
          items: [
            "developer/amplify/overview",
            "developer/amplify/setup-and-access",
            "developer/amplify/change-workflow",
            "developer/amplify/schema-change-procedure",
          ],
        },
        {
          type: "category",
          label: "デザインシステム",
          items: [
            "developer/design-system/overview",
            "developer/design-system/foundations",
            "developer/design-system/heading-rules",
            "developer/design-system/screen-recipes",
            "developer/design-system/implementation-rules",
          ],
        },
        {
          type: "category",
          label: "アーキテクチャ",
          items: [
            "developer/architecture/directory-structure",
            "developer/architecture/dependency-rules",
            "developer/architecture/placement-guide",
            "developer/architecture/sidebar-category-rules",
          ],
        },
        "developer/attendance-management-enabled",
        "developer/attendance-error-list-display",
        "developer/attendance-status-determination",
        "developer/attendance-statistics",
        "developer/shift-visibility-by-work-type",
        "developer/break-time-specification",
        "developer/close-date-system",
        "developer/data-fetch-periods",
      ],
    },
  ],
};

export default sidebars;
