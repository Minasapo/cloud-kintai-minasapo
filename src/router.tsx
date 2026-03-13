import { createBrowserRouter, Navigate } from "react-router-dom";

import Layout from "./Layout";
import { adminChildRoutes } from "./router/adminChildRoutes";
import { createLazyRoute } from "./router/lazyRoute";

const loadAdminDashboardLoader = async () =>
  (await import("./router/loaders/adminDashboardLoader")).adminDashboardLoader();

const loadAttendanceListLoader = async () =>
  (await import("./router/loaders/attendanceListLoader")).attendanceListLoader();

const loadWorkflowDetailLoader = async (args: Parameters<
  Awaited<typeof import("./router/loaders/workflowDetailLoader")>["workflowDetailLoader"]
>[0]) =>
  (await import("./router/loaders/workflowDetailLoader")).workflowDetailLoader(
    args,
  );

const loadWorkflowEditLoader = async (args: Parameters<
  Awaited<typeof import("./router/loaders/workflowEditLoader")>["workflowEditLoader"]
>[0]) =>
  (await import("./router/loaders/workflowEditLoader")).workflowEditLoader(
    args,
  );

const loadWorkflowListLoader = async () =>
  (await import("./router/loaders/workflowListLoader")).workflowListLoader();

const AdminDashboardRoute = createLazyRoute(
  () => import("./pages/admin/AdminDashboard"),
);
const AdminLayoutRoute = createLazyRoute(
  () => import("./pages/admin/AdminLayout"),
);
const DailyReportRoute = createLazyRoute(
  () => import("./pages/attendance/daily-report/DailyReport"),
);
const AttendanceEditRoute = createLazyRoute(
  () => import("./pages/attendance/edit/AttendanceEdit"),
);
const AttendanceListRoute = createLazyRoute(
  () => import("./pages/attendance/list/AttendanceListPage"),
);
const AttendanceStatisticsRoute = createLazyRoute(
  () => import("./pages/attendance/statistics/AttendanceStatisticsPage"),
);
const LoginRoute = createLazyRoute(() => import("./pages/Login/Login"));
const OfficeHomeRoute = createLazyRoute(
  () => import("./pages/office/home/OfficeHomePage"),
);
const OfficeLayoutRoute = createLazyRoute(
  () => import("./pages/office/layout/OfficeLayoutPage"),
);
const OfficeQrRoute = createLazyRoute(
  () => import("./pages/office/qr/OfficeQrPage"),
);
const OfficeQrRegisterRoute = createLazyRoute(
  () => import("./pages/office/qr-register/OfficeQrRegisterPage"),
);
const DesignTokenPreviewRoute = createLazyRoute(
  () => import("./pages/preview/DesignTokenPreviewPage"),
);
const ProfileRoute = createLazyRoute(() => import("./pages/Profile"));
const WorkflowNotificationsRoute = createLazyRoute(
  () => import("./pages/notifications/WorkflowNotificationsPage"),
);
const RegisterRoute = createLazyRoute(() => import("./pages/Register"));
const ShiftRequestRoute = createLazyRoute(
  () => import("./pages/shift/request"),
);
const ShiftCollaborativeRoute = createLazyRoute(
  () => import("./pages/shift/collaborative"),
);
const WorkflowDetailRoute = createLazyRoute(
  () => import("./pages/workflow/detail/WorkflowDetailPage"),
  {
    loader: loadWorkflowDetailLoader,
  },
);
const WorkflowEditRoute = createLazyRoute(
  () => import("./pages/workflow/edit/WorkflowEditPage"),
  {
    loader: loadWorkflowEditLoader,
  },
);
const WorkflowListRoute = createLazyRoute(
  () => import("./pages/workflow/list/WorkflowListPage"),
);
const NewWorkflowRoute = createLazyRoute(
  () => import("./pages/workflow/new/NewWorkflowPage"),
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        lazy: RegisterRoute,
      },
      {
        path: "register",
        lazy: RegisterRoute,
      },
      {
        path: "preview/design-tokens",
        lazy: DesignTokenPreviewRoute,
      },
      {
        path: "attendance",
        children: [
          {
            path: "list",
            lazy: AttendanceListRoute,
            loader: loadAttendanceListLoader,
          },
          {
            path: "stats",
            lazy: AttendanceStatisticsRoute,
          },
          {
            path: "report",
            lazy: DailyReportRoute,
          },
          {
            path: ":targetWorkDate/edit",
            lazy: AttendanceEditRoute,
          },
          {
            path: "*",
            lazy: AttendanceListRoute,
          },
        ],
      },
      {
        path: "login",
        lazy: LoginRoute,
      },
      {
        path: "workflow",
        children: [
          {
            index: true,
            lazy: WorkflowListRoute,
            loader: loadWorkflowListLoader,
          },
          {
            path: ":id",
            lazy: WorkflowDetailRoute,
          },
          {
            path: ":id/edit",
            lazy: WorkflowEditRoute,
          },
          {
            path: "new",
            lazy: NewWorkflowRoute,
          },
        ],
      },
      {
        path: "shift",
        children: [
          {
            index: true,
            lazy: ShiftRequestRoute,
          },
          {
            path: "collaborative",
            lazy: ShiftCollaborativeRoute,
          },
        ],
      },
      {
        path: "profile",
        lazy: ProfileRoute,
      },
      {
        path: "notifications",
        lazy: WorkflowNotificationsRoute,
      },
      {
        path: "/admin",
        lazy: AdminLayoutRoute,
        loader: loadAdminDashboardLoader,
        children: [
          {
            path: "",
            lazy: AdminDashboardRoute,
            children: [
              {
                index: true,
                element: <Navigate to="attendances" replace />,
              },
              ...adminChildRoutes,
            ],
          },
        ],
      },
      {
        path: "office",
        lazy: OfficeLayoutRoute,
        children: [
          {
            index: true,
            lazy: OfficeHomeRoute,
          },
          {
            path: "qr",
            lazy: OfficeQrRoute,
          },
          {
            path: "qr/register",
            lazy: OfficeQrRegisterRoute,
          },
        ],
      },
      {
        path: "*",
        element: <div>Not Found</div>,
      },
    ],
  },
]);

export default router;
