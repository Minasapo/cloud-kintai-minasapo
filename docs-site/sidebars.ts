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
    {
      type: "category",
      label: "スタッフ向け",
      items: [
        "staff/overview",
        "staff/navigation-map",
        {
          type: "category",
          label: "基本操作",
          items: [
            "staff/basic-operations",
            "staff/time-recording",
            "staff/dashboard",
            "staff/shift",
            "staff/attendance-check",
            "staff/workflow",
            "staff/attendance-edit",
            "staff/attendance-report",
            "staff/request-check",
          ],
        },
        "staff/faq",
      ],
    },
    {
      type: "category",
      label: "管理者向け",
      items: [
        "admin/overview",
        "admin/navigation-map",
        {
          type: "category",
          label: "管理業務",
          items: [
            "admin/dashboard",
            "admin/admin-shift",
            "admin/shift-plan",
            "admin/attendance-management",
            "admin/daily-report",
            "admin/attendances",
            "admin/request-approval",
            "admin/workflow",
            "admin/operation-logs",
            "admin/settings-management",
            "admin/staff-management",
          ],
        },
        "admin/faq",
      ],
    },
    {
      type: "category",
      label: "開発者向け",
      items: [
        "developer/overview",
        "developer/getting-started/setup",
        "developer/attendance-management-enabled",
        "developer/attendance-error-list-display",
        "developer/attendance-status-determination",
        "developer/close-date-system",
        "developer/data-fetch-periods",
      ],
    },
  ],
};

export default sidebars;
