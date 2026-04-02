import { Navigate, RouteObject } from "react-router-dom";

import AdminShiftGuard from "../pages/admin/AdminShiftGuard";
import NotFound from "../pages/NotFound";
import { ProgressBar, Spinner } from "../shared/ui/feedback/LoadingPrimitives";
import { createLazyRoute } from "./lazyRoute";

const AdminAttendanceRoute = createLazyRoute(
  () => import("../pages/admin/AdminAttendance"),
);
const AdminAttendanceEditorRoute = createLazyRoute(
  () => import("../pages/admin/AdminAttendanceEditor"),
);
const AdminAttendanceHistoryRoute = createLazyRoute(
  () => import("../pages/admin/AdminAttendanceHistory"),
);
const AdminAttendancePrintRoute = createLazyRoute(
  () => import("../pages/admin/AdminAttendancePrint"),
);
const AbsentRoute = createLazyRoute(
  () => import("@/features/admin/configManagement/ui/Absent"),
);
const AmPmHolidayRoute = createLazyRoute(
  () => import("@/features/admin/configManagement/ui/AmPmHoliday"),
);
const DeveloperRoute = createLazyRoute(
  () => import("@/features/admin/configManagement/ui/Developer"),
);
const SchemaExportRoute = createLazyRoute(
  () => import("@/features/admin/schema-export/ui/SchemaExport"),
);
const LinksRoute = createLazyRoute(
  () => import("@/features/admin/configManagement/ui/Links"),
);
const AttendanceStatisticsRoute = createLazyRoute(
  () => import("@/features/admin/configManagement/ui/AttendanceStatistics"),
);
const OvertimeConfirmationRoute = createLazyRoute(
  () => import("@/features/admin/configManagement/ui/OvertimeConfirmation"),
);
const TimeRecorderAnnouncementRoute = createLazyRoute(
  () => import("@/features/admin/configManagement/ui/TimeRecorderAnnouncement"),
);
const OfficeModeRoute = createLazyRoute(
  () => import("@/features/admin/configManagement/ui/OfficeMode"),
);
const QuickInputRoute = createLazyRoute(
  () => import("@/features/admin/configManagement/ui/QuickInput"),
);
const ReasonsRoute = createLazyRoute(
  () => import("@/features/admin/configManagement/ui/Reasons"),
);
const SpecialHolidayRoute = createLazyRoute(
  () => import("@/features/admin/configManagement/ui/SpecialHoliday"),
);
const WorkingTimeRoute = createLazyRoute(
  () => import("@/features/admin/configManagement/ui/WorkingTime"),
);
const AdminDailyReportDetailRoute = createLazyRoute(
  () =>
    import("../pages/admin/AdminDailyReport/AdminDailyReportDetail"),
);
const AdminDailyReportRoute = createLazyRoute(
  () => import("../pages/admin/AdminDailyReport/AdminDailyReport"),
);
const AdminHolidayCalendarRoute = createLazyRoute(
  () =>
    import("@/features/admin/holidayCalendar/ui/HolidayCalendar/AdminHolidayCalendar"),
);
const AdminLogsRoute = createLazyRoute(
  () => import("../pages/admin/AdminLogs/AdminLogsClean"),
);
const AdminMasterLayoutRoute = createLazyRoute(
  () => import("../pages/admin/AdminMasterLayout"),
);
const AdminShiftSettingsRoute = createLazyRoute(
  () => import("../pages/admin/AdminShiftSettings/AdminShiftSettings"),
);
const AdminWorkflowCategorySettingsRoute = createLazyRoute(
  () =>
    import("@/features/admin-config-workflow/AdminWorkflowCategorySettings"),
);
const AdminStaffRoute = createLazyRoute(
  () => import("@/features/admin/staff/ui/AdminStaff"),
);
const AdminStaffAttendanceListRoute = createLazyRoute(
  () =>
    import("@/features/admin/staffAttendanceList/ui/AdminStaffAttendanceList"),
);
const AdminStaffEditorRoute = createLazyRoute(
  () => import("@/features/admin/staff/ui/editor/AdminStaffEditor"),
);
const AdminThemeRoute = createLazyRoute(
  () => import("../pages/admin/AdminTheme/AdminTheme"),
);
const AdminWorkflowRoute = createLazyRoute(
  () => import("../pages/admin/AdminWorkflow/AdminWorkflow"),
);
const AdminWorkflowDetailRoute = createLazyRoute(
  () => import("../pages/admin/AdminWorkflow/AdminWorkflowDetail"),
);
const JobTermRoute = createLazyRoute(
  () => import("@/features/admin/jobTerm/ui/JobTerm"),
);
const AdminShiftPlanRoute = createLazyRoute(
  () => import("../pages/admin/AdminShiftPlan/AdminShiftPlan"),
);
const ShiftDayViewRoute = createLazyRoute(
  () => import("../pages/shift/day-view"),
  {
    wrap: (node) => <AdminShiftGuard>{node}</AdminShiftGuard>,
  },
);
const ShiftManagementRoute = createLazyRoute(
  () => import("../pages/shift/management"),
  {
    wrap: (node) => <AdminShiftGuard>{node}</AdminShiftGuard>,
    hydrateFallback: (
      <div className="flex min-h-[60vh] flex-col bg-surface">
        <ProgressBar data-testid="admin-shift-hydrate-loading" />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <Spinner />
          <p className="text-sm font-medium text-slate-500">
            シフト画面を読み込み中です...
          </p>
        </div>
      </div>
    ),
  },
);
const StaffShiftListRoute = createLazyRoute(
  () => import("../pages/shift/staff"),
  {
    wrap: (node) => <AdminShiftGuard>{node}</AdminShiftGuard>,
  },
);

export const adminChildRoutes: RouteObject[] = [
  {
    path: "staff",
    children: [
      {
        index: true,
        lazy: AdminStaffRoute,
      },
      {
        path: ":staffId",
        children: [
          {
            index: true,
            lazy: AdminStaffRoute,
          },
          {
            path: "attendance",
            lazy: AdminStaffAttendanceListRoute,
          },
          {
            path: "edit",
            lazy: AdminStaffEditorRoute,
          },
          {
            path: "*",
            element: <NotFound />,
          },
        ],
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
  {
    path: "attendances",
    children: [
      {
        index: true,
        lazy: AdminAttendanceRoute,
      },
      {
        path: ":targetWorkDate",
        lazy: AdminAttendanceRoute,
      },
      {
        path: "edit/:targetWorkDate/:staffId",
        lazy: AdminAttendanceEditorRoute,
      },
      {
        path: "history/:targetWorkDate/:staffId",
        lazy: AdminAttendanceHistoryRoute,
      },
      {
        path: "print",
        lazy: AdminAttendancePrintRoute,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
  {
    path: "shift",
    lazy: ShiftManagementRoute,
  },
  {
    path: "shift/day/:date",
    lazy: ShiftDayViewRoute,
  },
  {
    path: "shift/:staffId",
    lazy: StaffShiftListRoute,
  },
  {
    path: "shift-plan",
    lazy: AdminShiftPlanRoute,
  },
  {
    path: "master",
    lazy: AdminMasterLayoutRoute,
    children: [
      {
            index: true,
            element: <Navigate to="/admin/master/job_term" replace />,
      },
      {
        path: "job_term",
        lazy: JobTermRoute,
      },
      {
        path: "holiday_calendar",
        lazy: AdminHolidayCalendarRoute,
      },
      {
        path: "theme",
        lazy: AdminThemeRoute,
      },
      {
        path: "shift",
        lazy: AdminShiftSettingsRoute,
      },
      {
        path: "workflow",
        lazy: AdminWorkflowCategorySettingsRoute,
      },
      {
        path: "feature_management/working_time",
        lazy: WorkingTimeRoute,
      },
      {
        path: "feature_management/am_pm_holiday",
        lazy: AmPmHolidayRoute,
      },
      {
        path: "feature_management/office_mode",
        lazy: OfficeModeRoute,
      },
      {
        path: "feature_management/attendance_statistics",
        lazy: AttendanceStatisticsRoute,
      },
      {
        path: "feature_management/overtime_confirmation",
        lazy: OvertimeConfirmationRoute,
      },
      {
        path: "developer",
        lazy: DeveloperRoute,
      },
      {
        path: "time_recorder_announcement",
        lazy: TimeRecorderAnnouncementRoute,
      },
      {
        path: "export",
        lazy: SchemaExportRoute,
      },
      {
        path: "feature_management/links",
        lazy: LinksRoute,
      },
      {
        path: "feature_management/reasons",
        lazy: ReasonsRoute,
      },
      {
        path: "feature_management/quick_input",
        lazy: QuickInputRoute,
      },
      {
        path: "feature_management/special_holiday",
        lazy: SpecialHolidayRoute,
      },
      {
        path: "feature_management/absent",
        lazy: AbsentRoute,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
  {
    path: "workflow",
    children: [
      {
        index: true,
        lazy: AdminWorkflowRoute,
      },
      {
        path: ":id",
        lazy: AdminWorkflowDetailRoute,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
  {
    path: "logs",
    lazy: AdminLogsRoute,
  },
  {
    path: "daily-report",
    children: [
      {
        index: true,
        lazy: AdminDailyReportRoute,
      },
      {
        path: ":id",
        lazy: AdminDailyReportDetailRoute,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
];
