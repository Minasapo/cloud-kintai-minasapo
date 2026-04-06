import React, { lazy } from "react";

import type { PanelConfig, ScreenOption } from "@/features/splitView";

const AdminDashboardComponent = lazy(
  () => import("@/pages/admin/AdminDashboard"),
);
const AdminAttendanceComponent = lazy(
  () => import("@/pages/admin/AdminAttendance"),
);
const AdminDailyReportComponent = lazy(
  () => import("@/pages/admin/AdminDailyReport/AdminDailyReport"),
);
const AdminStaffComponent = lazy(
  () => import("@/features/admin/staff/ui/AdminStaff"),
);
const AdminShiftPlanComponent = lazy(
  () => import("@/pages/admin/AdminShiftPlan/AdminShiftPlan"),
);
const AdminWorkflowComponent = lazy(
  () => import("@/pages/admin/AdminWorkflow/AdminWorkflow"),
);
const AdminLogsComponent = lazy(
  () => import("@/pages/admin/AdminLogs/AdminLogsClean"),
);
const AdminSettingsTopComponent = lazy(
  () => import("@/pages/admin/AdminSettingsTop"),
);

export const ADMIN_SPLIT_PANEL_OPTIONS: ScreenOption[] = [
  { value: "dashboard", label: "ダッシュボード", route: "/admin" },
  { value: "attendance-edit", label: "勤怠編集", route: "/admin/attendances" },
  { value: "daily-report", label: "日報詳細", route: "/admin/daily-report" },
  { value: "staff-list", label: "スタッフ一覧", route: "/admin/staff" },
  { value: "shift-plan", label: "シフト管理", route: "/admin/shift" },
  { value: "shift-planning", label: "シフト計画", route: "/admin/shift-plan" },
  { value: "workflow", label: "ワークフロー", route: "/admin/workflow" },
  { value: "audit-logs", label: "ログ", route: "/admin/logs" },
  { value: "settings", label: "設定", route: "/admin/master" },
];

export const ADMIN_SPLIT_PANEL_COMPONENTS: Record<
  string,
  React.ComponentType<{ panelId: string }>
> = {
  dashboard: AdminDashboardComponent as React.ComponentType<{
    panelId: string;
  }>,
  "attendance-edit": AdminAttendanceComponent as React.ComponentType<{
    panelId: string;
  }>,
  "daily-report": AdminDailyReportComponent as React.ComponentType<{
    panelId: string;
  }>,
  "staff-list": AdminStaffComponent as React.ComponentType<{ panelId: string }>,
  "shift-plan": AdminShiftPlanComponent as React.ComponentType<{
    panelId: string;
  }>,
  "shift-planning": AdminShiftPlanComponent as React.ComponentType<{
    panelId: string;
  }>,
  workflow: AdminWorkflowComponent as React.ComponentType<{ panelId: string }>,
  "audit-logs": AdminLogsComponent as React.ComponentType<{ panelId: string }>,
  settings: AdminSettingsTopComponent as React.ComponentType<{
    panelId: string;
  }>,
};

export const getAdminSplitPanelOptionByRoute = (route: string) =>
  ADMIN_SPLIT_PANEL_OPTIONS.find((option) => option.route === route);

export const buildAdminSplitPanelConfig = (
  screenValue: string,
): PanelConfig | null => {
  const selectedOption = ADMIN_SPLIT_PANEL_OPTIONS.find(
    (option) => option.value === screenValue,
  );
  const component = ADMIN_SPLIT_PANEL_COMPONENTS[screenValue];

  if (!selectedOption || !component) {
    return null;
  }

  return {
    id: selectedOption.value,
    title: selectedOption.label,
    component,
    route: selectedOption.route,
  };
};
