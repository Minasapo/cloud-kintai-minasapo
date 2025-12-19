import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import Layout from "./Layout";
import { adminChildRoutes } from "./router/adminChildRoutes";
import { withSuspense } from "./router/withSuspense";

const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const DailyReport = lazy(() => import("./pages/attendance/daily-report/DailyReport"));
const AttendanceEdit = lazy(() => import("./pages/attendance/edit/AttendanceEdit"));
const AttendanceListPage = lazy(
  () => import("./pages/attendance/list/AttendanceListPage")
);
const Login = lazy(() => import("./pages/Login/Login"));
const OfficeHomePage = lazy(() => import("./pages/office/home/OfficeHomePage"));
const OfficeLayoutPage = lazy(
  () => import("./pages/office/layout/OfficeLayoutPage")
);
const OfficeQrPage = lazy(() => import("./pages/office/qr/OfficeQrPage"));
const OfficeQrRegisterPage = lazy(
  () => import("./pages/office/qr-register/OfficeQrRegisterPage")
);
const DesignTokenPreviewPage = lazy(
  () => import("./pages/preview/DesignTokenPreviewPage")
);
const Profile = lazy(() => import("./pages/Profile"));
const Register = lazy(() => import("./pages/Register"));
const ShiftRequestPage = lazy(() => import("./pages/shift/request"));
const WorkflowDetailPage = lazy(
  () => import("./pages/workflow/detail/WorkflowDetailPage")
);
const WorkflowEditPage = lazy(
  () => import("./pages/workflow/edit/WorkflowEditPage")
);
const WorkflowListPage = lazy(
  () => import("./pages/workflow/list/WorkflowListPage")
);
const NewWorkflowPage = lazy(() => import("./pages/workflow/new/NewWorkflowPage"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: withSuspense(Register),
      },
      {
        path: "register",
        element: withSuspense(Register),
      },
      {
        path: "preview/design-tokens",
        element: withSuspense(DesignTokenPreviewPage),
      },
      {
        path: "attendance",
        children: [
          {
            path: "list",
            element: withSuspense(AttendanceListPage),
          },
          {
            path: "report",
            element: withSuspense(DailyReport),
          },
          {
            path: ":targetWorkDate/edit",
            element: withSuspense(AttendanceEdit),
          },
          {
            path: "*",
            element: withSuspense(AttendanceListPage),
          },
        ],
      },
      {
        path: "login",
        element: withSuspense(Login),
      },
      {
        path: "workflow",
        children: [
          {
            index: true,
            element: withSuspense(WorkflowListPage),
          },
          {
            path: ":id",
            element: withSuspense(WorkflowDetailPage),
          },
          {
            path: ":id/edit",
            element: withSuspense(WorkflowEditPage),
          },
          {
            path: "new",
            element: withSuspense(NewWorkflowPage),
          },
        ],
      },
      {
        path: "shift",
        children: [
          {
            index: true,
            element: withSuspense(ShiftRequestPage),
          },
        ],
      },
      {
        path: "profile",
        element: withSuspense(Profile),
      },
      {
        path: "/admin",
        element: withSuspense(AdminLayout),
        children: [
          {
            path: "",
            element: withSuspense(AdminDashboard),
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
        element: withSuspense(OfficeLayoutPage),
        children: [
          {
            index: true,
            element: withSuspense(OfficeHomePage),
          },
          {
            path: "qr",
            element: withSuspense(OfficeQrPage),
          },
          {
            path: "qr/register",
            element: withSuspense(OfficeQrRegisterPage),
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
