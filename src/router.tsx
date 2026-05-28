import { lazy, type ReactNode,Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

import Layout from "./Layout";
import { adminChildRoutes } from "./router/adminChildRoutes";
import { createLazyRoute } from "./router/lazyRoute";
import RouteErrorBoundary from "./router/RouteErrorBoundary";
import RouterFallback from "./shared/ui/feedback/RouterFallback";

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

const LazyMuiXDateProvider = lazy(
  () => import("./shared/providers/MuiXDateProvider"),
);

const wrapWithMuiXDateProvider = (node: ReactNode) => (
  <Suspense fallback={<RouterFallback />}>
    <LazyMuiXDateProvider>{node}</LazyMuiXDateProvider>
  </Suspense>
);

const AdminLayoutRoute = createLazyRoute(
  () => import("./pages/admin/AdminLayout"),
);
const AdminDashboardRoute = createLazyRoute(
  () => import("./pages/admin/AdminDashboard"),
);
const AdminGuardRoute = createLazyRoute(
  () => import("./pages/admin/AdminGuard"),
  {
    wrap: wrapWithMuiXDateProvider,
  },
);
const DailyReportRoute = createLazyRoute(
  () => import("./pages/attendance/daily-report/DailyReport"),
  {
    wrap: wrapWithMuiXDateProvider,
  },
);
const AttendanceEditRoute = createLazyRoute(
  () => import("./pages/attendance/edit/AttendanceEdit"),
  {
    wrap: wrapWithMuiXDateProvider,
  },
);
const AttendanceListRoute = createLazyRoute(
  () => import("./pages/attendance/list/AttendanceListPage"),
  {
    wrap: wrapWithMuiXDateProvider,
  },
);
const AttendanceStatisticsRoute = createLazyRoute(
  () => import("./pages/attendance/statistics/AttendanceStatisticsPage"),
);
const LoginRoute = createLazyRoute(() => import("./pages/Login/LoginShell"));
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
const NotFoundRoute = createLazyRoute(() => import("./pages/NotFound"));
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
  () => import("./pages/workflow/detail/WorkflowDetail"),
);
const WorkflowEditRoute = createLazyRoute(
  () => import("./pages/workflow/edit/WorkflowEdit"),
);
const WorkflowListRoute = createLazyRoute(
  () => import("./pages/workflow/list/Workflow"),
  {
    wrap: wrapWithMuiXDateProvider,
  },
);
const NewWorkflowRoute = createLazyRoute(
  () => import("./pages/workflow/new/NewWorkflow"),
);

const router = createBrowserRouter([
  {
    path: "/login",
    lazy: LoginRoute,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/",
    element: <Layout />,
    errorElement: <RouteErrorBoundary />,
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
            lazy: NotFoundRoute,
          },
        ],
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
            loader: loadWorkflowDetailLoader,
          },
          {
            path: ":id/edit",
            lazy: WorkflowEditRoute,
            loader: loadWorkflowEditLoader,
          },
          {
            path: "new",
            lazy: NewWorkflowRoute,
          },
          {
            path: "*",
            lazy: NotFoundRoute,
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
          {
            path: "*",
            lazy: NotFoundRoute,
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
        lazy: AdminGuardRoute,
        loader: loadAdminDashboardLoader,
        children: [
          {
            path: "",
            lazy: AdminLayoutRoute,
            children: [
              {
                index: true,
                lazy: AdminDashboardRoute,
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
          {
            path: "*",
            lazy: NotFoundRoute,
          },
        ],
      },
      {
        path: "*",
        lazy: NotFoundRoute,
      },
    ],
  },
]);

export default router;
