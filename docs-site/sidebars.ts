import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 * create an ordered group of docs
 * render a sidebar for each doc of that group
 * provide next/previous navigation
 *
 * The sidebars can be generated from the filesystem, or explicitly defined here.
 *
 * Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  mainSidebar: [
    "intro",
    "terminology",
    "work-type-overview",
    "work-status-overview",
    {
      type: "category",
      label: "スタッフ向けガイド",
      items: [
        "staff/overview",
        "staff/navigation-map",
        {
          type: "category",
          label: "ユースケース別",
          items: [
            "staff/use-cases",
            "staff/basic-operations",
            "staff/time-recording",
            "staff/attendance-check",
            "staff/attendance-edit",
            "staff/request-check",
            "staff/attendance-report",
            "staff/workflow",
          ],
        },
        {
          type: "category",
          label: "機能別",
          items: [
            "staff/features",
            "staff/dashboard",
            "staff/shift",
            "staff/profile-settings",
            "staff/break-time-guide",
          ],
        },
        "staff/faq",
      ],
    },
    {
      type: "category",
      label: "管理者向けガイド",
      items: [
        "admin/overview",
        "admin/navigation-map",
        {
          type: "category",
          label: "ユースケース別",
          items: [
            "admin/use-cases",
            "admin/attendance-management",
            "admin/request-approval",
            "admin/break-time-review-guide",
            "admin/daily-report",
            "admin/workflow",
            "admin/shift-plan",
          ],
        },
        {
          type: "category",
          label: "機能別",
          items: [
            "admin/features",
            "admin/dashboard",
            "admin/attendances",
            "admin/admin-shift",
            "admin/operation-logs",
            "admin/settings-management",
            "admin/settings-item-list",
            "admin/staff-management",
          ],
        },
        "admin/faq",
      ],
    },
    {
      type: "category",
      label: "開発者向けガイド",
      items: [
        "developer/overview",
        {
          type: "category",
          label: "デザインシステム",
          items: [
            "developer/design-system/overview",
            "developer/design-system/foundations",
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
        "developer/getting-started/setup",
        "developer/attendance-management-enabled",
        "developer/attendance-error-list-display",
        "developer/attendance-status-determination",
        "developer/shift-visibility-by-work-type",
        "developer/break-time-specification",
        "developer/close-date-system",
        "developer/data-fetch-periods",
      ],
    },
  ],
};

export default sidebars;
