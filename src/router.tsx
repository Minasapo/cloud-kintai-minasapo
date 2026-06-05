import { createBrowserRouter } from "react-router-dom";

import {
  collectExtensionAdminRoutes,
  collectExtensionRoutes,
  extensionManifests,
} from "@/extensions";

import Layout from "./Layout";
import { adminChildRoutes } from "./router/adminChildRoutes";
import { createLazyRoute } from "./router/lazyRoute";
import RouteErrorBoundary from "./router/RouteErrorBoundary";
import { wrapWithMuiXDateProvider } from "./router/wrapWithMuiXDateProvider";

const loadAdminDashboardLoader = async () =>
  (
    await import("./router/loaders/adminDashboardLoader")
  ).adminDashboardLoader();

const loadAttendanceListLoader = async () =>
  (
    await import("./router/loaders/attendanceListLoader")
  ).attendanceListLoader();

const loadWorkflowDetailLoader = async (
  args: Parameters<
    Awaited<
      typeof import("./router/loaders/workflowDetailLoader")
    >["workflowDetailLoader"]
  >[0],
) =>
  (await import("./router/loaders/workflowDetailLoader")).workflowDetailLoader(
    args,
  );

const loadWorkflowEditLoader = async (
  args: Parameters<
    Awaited<
      typeof import("./router/loaders/workflowEditLoader")
    >["workflowEditLoader"]
  >[0],
) =>
  (await import("./router/loaders/workflowEditLoader")).workflowEditLoader(
    args,
  );

const loadWorkflowListLoader = async () =>
  (await import("./router/loaders/workflowListLoader")).workflowListLoader();

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
const LoginRoute = createLazyRoute(() => import("./pages/Login/LoginShell"));
const DesignTokenPreviewRoute = createLazyRoute(
  () => import("./pages/preview/DesignTokenPreviewPage"),
);
const NotFoundRoute = createLazyRoute(() => import("./pages/NotFound"));
const ProfileRoute = createLazyRoute(() => import("./pages/Profile"));
const RegisterRoute = createLazyRoute(() => import("./pages/Register"));
const ShiftRequestRoute = createLazyRoute(
  () => import("./pages/shift/request"),
);
const ShiftCollaborativeRoute = createLazyRoute(
  () => import("@extensions/shift-collaborative/pages"),
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

const extensionTopRoutes = collectExtensionRoutes(extensionManifests);
const extensionAdminRoutes = collectExtensionAdminRoutes(extensionManifests);

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
              ...extensionAdminRoutes,
              ...adminChildRoutes,
            ],
          },
        ],
      },
      ...extensionTopRoutes,
      {
        path: "*",
        lazy: NotFoundRoute,
      },
    ],
  },
]);

export default router;
