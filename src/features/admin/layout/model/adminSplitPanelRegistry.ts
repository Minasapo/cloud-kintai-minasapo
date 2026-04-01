import React, { lazy } from "react";

import type { ScreenOption } from "@/features/splitView";

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

export const ADMIN_SPLIT_PANEL_OPTIONS: ScreenOption[] = [
  { value: "attendance-edit", label: "勤怠編集", route: "/admin/attendances" },
  { value: "daily-report", label: "日報詳細", route: "/admin/daily-report" },
  { value: "staff-list", label: "スタッフ一覧", route: "/admin/staff" },
  { value: "shift-plan", label: "シフト管理", route: "/admin/shift" },
];

export const ADMIN_SPLIT_PANEL_COMPONENTS: Record<
  string,
  React.ComponentType<{ panelId: string }>
> = {
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
};
