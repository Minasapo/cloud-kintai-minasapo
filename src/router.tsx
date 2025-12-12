import { createBrowserRouter, Navigate } from "react-router-dom";

import Layout from "./Layout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLayout from "./pages/admin/AdminLayout";
import DailyReport from "./pages/attendance/daily-report/DailyReport";
import AttendanceEdit from "./pages/attendance/edit/AttendanceEdit";
import AttendanceListPage from "./pages/attendance/list/AttendanceListPage";
import Login from "./pages/Login/Login";
import OfficeHomePage from "./pages/office/home/OfficeHomePage";
import OfficeLayoutPage from "./pages/office/layout/OfficeLayoutPage";
import OfficeQrPage from "./pages/office/qr/OfficeQrPage";
import OfficeQrRegisterPage from "./pages/office/qr-register/OfficeQrRegisterPage";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import ShiftRequestPage from "./pages/shift/request";
import WorkflowDetailPage from "./pages/workflow/detail/WorkflowDetailPage";
import WorkflowEditPage from "./pages/workflow/edit/WorkflowEditPage";
import WorkflowListPage from "./pages/workflow/list/WorkflowListPage";
import NewWorkflowPage from "./pages/workflow/new/NewWorkflowPage";
import { adminChildRoutes } from "./router/adminChildRoutes";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Register />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "attendance",
        children: [
          {
            path: "list",
            element: <AttendanceListPage />,
          },
          {
            path: "report",
            element: <DailyReport />,
          },
          {
            path: ":targetWorkDate/edit",
            element: <AttendanceEdit />,
          },
          {
            path: "*",
            element: <AttendanceListPage />,
          },
        ],
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "workflow",
        children: [
          {
            index: true,
            element: <WorkflowListPage />,
          },
          {
            path: ":id",
            element: <WorkflowDetailPage />,
          },
          {
            path: ":id/edit",
            element: <WorkflowEditPage />,
          },
          {
            path: "new",
            element: <NewWorkflowPage />,
          },
        ],
      },
      {
        path: "shift",
        children: [
          {
            index: true,
            element: <ShiftRequestPage />,
          },
        ],
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "/admin",
        element: <AdminLayout />,
        children: [
          {
            path: "",
            element: <AdminDashboard />,
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
        element: <OfficeLayoutPage />,
        children: [
          {
            index: true,
            element: <OfficeHomePage />,
          },
          {
            path: "qr",
            element: <OfficeQrPage />,
          },
          {
            path: "qr/register",
            element: <OfficeQrRegisterPage />,
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
