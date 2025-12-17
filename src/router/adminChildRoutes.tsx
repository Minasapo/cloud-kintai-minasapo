import { lazy } from "react";
import { RouteObject } from "react-router-dom";

import AdminShiftGuard from "../pages/admin/AdminShiftGuard";
import { withSuspense } from "./withSuspense";

const AdminAttendance = lazy(() => import("../pages/admin/AdminAttendance"));
const AdminAttendanceEditor = lazy(
  () => import("../pages/admin/AdminAttendanceEditor")
);
const AdminAttendanceHistory = lazy(
  () => import("../pages/admin/AdminAttendanceHistory")
);
const AdminAttendancePrint = lazy(
  () => import("../pages/admin/AdminAttendancePrint")
);
const Absent = lazy(() => import("../pages/admin/AdminConfigManagement/Absent"));
const AdminConfigManagement = lazy(
  () => import("../pages/admin/AdminConfigManagement/AdminConfigManagement")
);
const AmPmHoliday = lazy(
  () => import("../pages/admin/AdminConfigManagement/AmPmHoliday")
);
const Links = lazy(() => import("../pages/admin/AdminConfigManagement/Links"));
const OfficeMode = lazy(
  () => import("../pages/admin/AdminConfigManagement/OfficeMode")
);
const QuickInput = lazy(
  () => import("../pages/admin/AdminConfigManagement/QuickInput")
);
const Reasons = lazy(
  () => import("../pages/admin/AdminConfigManagement/Reasons")
);
const SpecialHoliday = lazy(
  () => import("../pages/admin/AdminConfigManagement/SpecialHoliday")
);
const WorkingTime = lazy(
  () => import("../pages/admin/AdminConfigManagement/WorkingTime")
);
const AdminDailyReportDetail = lazy(
  () =>
    import("../pages/admin/AdminDailyReportManagement/AdminDailyReportDetail")
);
const AdminDailyReportManagement = lazy(
  () =>
    import(
      "../pages/admin/AdminDailyReportManagement/AdminDailyReportManagement"
    )
);
const AdminHolidayCalendar = lazy(
  () =>
    import("../pages/admin/AdminHolidayCalendar/HolidayCalendar/AdminHolidayCalendar")
);
const AdminLogs = lazy(() => import("../pages/admin/AdminLogs/AdminLogsClean"));
const AdminMasterLayout = lazy(
  () => import("../pages/admin/AdminMasterLayout")
);
const AdminShiftSettings = lazy(
  () => import("../pages/admin/AdminShiftSettings/AdminShiftSettings")
);
const AdminStaff = lazy(() => import("../pages/admin/AdminStaff/AdminStaff"));
const AdminStaffAttendanceList = lazy(
  () => import("../pages/admin/AdminStaffAttendanceList/AdminStaffAttendanceList")
);
const AdminStaffEditor = lazy(
  () => import("../pages/admin/AdminStaffEditor/AdminStaffEditor")
);
const AdminTheme = lazy(() => import("../pages/admin/AdminTheme/AdminTheme"));
const AdminWorkflow = lazy(
  () => import("../pages/admin/AdminWorkflow/AdminWorkflow")
);
const AdminWorkflowDetail = lazy(
  () => import("../pages/admin/AdminWorkflow/AdminWorkflowDetail")
);
const JobTerm = lazy(() => import("../pages/admin/JobTerm/JobTerm"));
const ShiftPlanManagement = lazy(
  () => import("../pages/admin/ShiftPlanManagement/ShiftPlanManagement")
);
const ShiftDayViewPage = lazy(() => import("../pages/shift/day-view"));
const ShiftManagementPage = lazy(() => import("../pages/shift/management"));
const StaffShiftListPage = lazy(() => import("../pages/shift/staff"));

export const adminChildRoutes: RouteObject[] = [
  {
    path: "staff",
    children: [
          {
            index: true,
            element: withSuspense(AdminStaff),
          },
          {
            path: ":staffId",
            children: [
              {
                index: true,
                element: withSuspense(AdminStaff),
              },
              {
                path: "attendance",
                element: withSuspense(AdminStaffAttendanceList),
              },
              {
                path: "edit",
                element: withSuspense(AdminStaffEditor),
              },
            ],
          },
    ],
  },
  {
    path: "attendances",
    children: [
      {
        index: true,
        element: withSuspense(AdminAttendance),
      },
      {
        path: ":targetWorkDate",
        element: withSuspense(AdminAttendance),
      },
      {
        path: "edit/:targetWorkDate/:staffId",
        element: withSuspense(AdminAttendanceEditor),
      },
      {
        path: "history/:targetWorkDate/:staffId",
        element: withSuspense(AdminAttendanceHistory),
      },
      {
        path: "print",
        element: withSuspense(AdminAttendancePrint),
      },
    ],
  },
  {
    path: "shift",
    element: (
      <AdminShiftGuard>
        {withSuspense(ShiftManagementPage)}
      </AdminShiftGuard>
    ),
  },
  {
    path: "shift/day/:date",
    element: (
      <AdminShiftGuard>
        {withSuspense(ShiftDayViewPage)}
      </AdminShiftGuard>
    ),
  },
  {
    path: "shift/:staffId",
    element: (
      <AdminShiftGuard>
        {withSuspense(StaffShiftListPage)}
      </AdminShiftGuard>
    ),
  },
  {
    path: "shift-plan",
    element: withSuspense(ShiftPlanManagement),
  },
  {
    path: "master",
    element: withSuspense(AdminMasterLayout),
    children: [
      {
        index: true,
        element: withSuspense(JobTerm),
      },
      {
        path: "job_term",
        element: withSuspense(JobTerm),
      },
      {
        path: "holiday_calendar",
        element: withSuspense(AdminHolidayCalendar),
      },
      {
        path: "theme",
        element: withSuspense(AdminTheme),
      },
      {
        path: "shift",
        element: withSuspense(AdminShiftSettings),
      },
      {
        path: "feature_management",
        element: withSuspense(AdminConfigManagement),
      },
      {
        path: "feature_management/working_time",
        element: withSuspense(WorkingTime),
      },
      {
        path: "feature_management/am_pm_holiday",
        element: withSuspense(AmPmHoliday),
      },
      {
        path: "feature_management/office_mode",
        element: withSuspense(OfficeMode),
      },
      {
        path: "feature_management/links",
        element: withSuspense(Links),
      },
      {
        path: "feature_management/reasons",
        element: withSuspense(Reasons),
      },
      {
        path: "feature_management/quick_input",
        element: withSuspense(QuickInput),
      },
      {
        path: "feature_management/special_holiday",
        element: withSuspense(SpecialHoliday),
      },
      {
        path: "feature_management/absent",
        element: withSuspense(Absent),
      },
    ],
  },
  {
    path: "workflow",
    children: [
      {
        index: true,
        element: withSuspense(AdminWorkflow),
      },
      {
        path: ":id",
        element: withSuspense(AdminWorkflowDetail),
      },
    ],
  },
  {
    path: "logs",
    element: withSuspense(AdminLogs),
  },
  {
    path: "daily-report",
    children: [
      {
        index: true,
        element: withSuspense(AdminDailyReportManagement),
      },
      {
        path: ":id",
        element: withSuspense(AdminDailyReportDetail),
      },
    ],
  },
];
