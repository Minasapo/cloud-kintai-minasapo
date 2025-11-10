import { createBrowserRouter } from "react-router-dom";

import Layout from "./Layout";
import AdminAttendance from "./pages/admin/AdminAttendance";
import AdminAttendanceEditor from "./pages/admin/AdminAttendanceEditor";
import AdminAttendanceHistory from "./pages/admin/AdminAttendanceHistory";
import AdminAttendancePrint from "./pages/admin/AdminAttendancePrint";
import Absent from "./pages/admin/AdminConfigManagement/Absent";
import AdminConfigManagement from "./pages/admin/AdminConfigManagement/AdminConfigManagement";
import AmPmHoliday from "./pages/admin/AdminConfigManagement/AmPmHoliday";
import Links from "./pages/admin/AdminConfigManagement/Links";
import OfficeMode from "./pages/admin/AdminConfigManagement/OfficeMode";
import QuickInput from "./pages/admin/AdminConfigManagement/QuickInput";
import Reasons from "./pages/admin/AdminConfigManagement/Reasons";
import SpecialHoliday from "./pages/admin/AdminConfigManagement/SpecialHoliday";
import WorkingTime from "./pages/admin/AdminConfigManagement/WorkingTime";
import AdminHolidayCalendar from "./pages/admin/AdminHolidayCalendar/HolidayCalendar/AdminHolidayCalendar";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminLogs from "./pages/admin/AdminLogs/AdminLogs";
import AdminMasterLayout from "./pages/admin/AdminMasterLayout";
import AdminShiftGuard from "./pages/admin/AdminShiftGuard";
import AdminStaff from "./pages/admin/AdminStaff/AdminStaff";
import AdminStaffAttendanceList from "./pages/admin/AdminStaffAttendanceList/AdminStaffAttendanceList";
import AdminStaffEditor from "./pages/admin/AdminStaffEditor/AdminStaffEditor";
import AdminWorkflow from "./pages/admin/AdminWorkflow/AdminWorkflow";
import AdminWorkflowDetail from "./pages/admin/AdminWorkflow/AdminWorkflowDetail";
import JobTerm from "./pages/admin/JobTerm/JobTerm";
import AttendanceEdit from "./pages/AttendanceEdit/AttendanceEdit";
import AttendanceListPage from "./pages/AttendanceListPage";
import Login from "./pages/Login/Login";
import OfficeLayout from "./pages/office/OfficeLayout";
import OfficePage from "./pages/office/OfficePage";
import OfficeQRRegister from "./pages/office/qr/OfficeQRRegister";
import OfficeQRView from "./pages/office/qr/OfficeQRView";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import ShiftRequest from "./pages/Shift/ShiftRequest";
import ShiftDayView from "./pages/ShiftManagement/ShiftDayView";
import ShiftManagement from "./pages/ShiftManagement/ShiftManagement";
import StaffShiftList from "./pages/ShiftManagement/StaffShiftList";
import NewWorkflow from "./pages/Workflow/NewWorkflow";
import Workflow from "./pages/Workflow/Workflow";
import WorkflowDetail from "./pages/Workflow/WorkflowDetail";
import WorkflowEdit from "./pages/Workflow/WorkflowEdit";

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
            element: <Workflow />,
          },
          {
            path: ":id",
            element: <WorkflowDetail />,
          },
          {
            path: ":id/edit",
            element: <WorkflowEdit />,
          },
          {
            path: "new",
            element: <NewWorkflow />,
          },
        ],
      },
      {
        path: "shift",
        children: [
          {
            index: true,
            element: (
              <AdminShiftGuard>
                <ShiftRequest />
              </AdminShiftGuard>
            ),
          },
        ],
      },
      // {
      //   path: "docs",
      //   element: <Document />,
      //   children: [
      //     {
      //       index: true,
      //       element: <ListDocument />,
      //     },
      //     {
      //       path: "post",
      //       element: <DocumentPoster />,
      //     },
      //     {
      //       path: ":documentId",
      //       children: [
      //         {
      //           index: true,
      //           element: <DocumentView />,
      //         },
      //         {
      //           path: "edit",
      //           element: <DocumentEditor />,
      //         },
      //       ],
      //     },
      //   ],
      // },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "/admin",
        element: <AdminLayout />,
        children: [
          {
            index: true,
          },
          {
            path: "staff",
            children: [
              {
                index: true,
                element: <AdminStaff />,
              },
              {
                path: ":staffId",
                children: [
                  {
                    index: true,
                    element: <AdminStaff />,
                  },
                  {
                    path: "attendance",
                    element: <AdminStaffAttendanceList />,
                  },
                  {
                    path: "edit",
                    element: <AdminStaffEditor />,
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
                element: <AdminAttendance />,
              },
              {
                path: ":targetWorkDate",
                element: <AdminAttendance />,
              },
              {
                path: "edit/:targetWorkDate/:staffId",
                element: <AdminAttendanceEditor />,
              },
              {
                path: "history/:targetWorkDate/:staffId",
                element: <AdminAttendanceHistory />,
              },
              {
                path: "print",
                element: <AdminAttendancePrint />,
              },
            ],
          },
          {
            path: "shift",
            element: (
              <AdminShiftGuard>
                <ShiftManagement />
              </AdminShiftGuard>
            ),
          },
          {
            path: "shift/day/:date",
            element: (
              <AdminShiftGuard>
                <ShiftDayView />
              </AdminShiftGuard>
            ),
          },
          {
            path: "shift/:staffId",
            element: (
              <AdminShiftGuard>
                <StaffShiftList />
              </AdminShiftGuard>
            ),
          },
          {
            path: "master",
            element: <AdminMasterLayout />,
            children: [
              {
                index: true,
                element: <JobTerm />,
              },
              {
                path: "job_term",
                element: <JobTerm />,
              },
              {
                path: "holiday_calendar",
                element: <AdminHolidayCalendar />,
              },
              {
                path: "feature_management",
                element: <AdminConfigManagement />,
              },
              {
                path: "feature_management/working_time",
                element: <WorkingTime />,
              },
              {
                path: "feature_management/am_pm_holiday",
                element: <AmPmHoliday />,
              },
              {
                path: "feature_management/office_mode",
                element: <OfficeMode />,
              },
              {
                path: "feature_management/links",
                element: <Links />,
              },
              {
                path: "feature_management/reasons",
                element: <Reasons />,
              },
              {
                path: "feature_management/quick_input",
                element: <QuickInput />,
              },
              {
                path: "feature_management/special_holiday",
                element: <SpecialHoliday />,
              },
              {
                path: "feature_management/absent",
                element: <Absent />,
              },
            ],
          },
          {
            path: "workflow",
            children: [
              {
                index: true,
                element: <AdminWorkflow />,
              },
              {
                path: ":id",
                element: <AdminWorkflowDetail />,
              },
            ],
          },
          {
            path: "logs",
            element: <AdminLogs />,
          },
        ],
      },
      {
        path: "office",
        element: <OfficeLayout />,
        children: [
          {
            index: true,
            element: <OfficePage />,
          },
          {
            path: "qr",
            element: <OfficeQRView />,
          },
          {
            path: "qr/register",
            element: <OfficeQRRegister />,
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
