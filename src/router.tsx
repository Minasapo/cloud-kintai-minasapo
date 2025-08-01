import { createBrowserRouter } from "react-router-dom";

import Layout from "./Layout";
import AdminAttendance from "./pages/admin/AdminAttendance";
import AdminAttendanceEditor from "./pages/admin/AdminAttendanceEditor";
import AdminAttendancePrint from "./pages/admin/AdminAttendancePrint";
import AdminConfigManagement from "./pages/admin/AdminConfigManagement/AdminConfigManagement";
import AdminHolidayCalendar from "./pages/admin/AdminHolidayCalendar/HolidayCalendar/AdminHolidayCalendar";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminMasterLayout from "./pages/admin/AdminMasterLayout";
import AdminStaff from "./pages/admin/AdminStaff/AdminStaff";
import AdminStaffAttendanceList from "./pages/admin/AdminStaffAttendanceList/AdminStaffAttendanceList";
import AdminStaffEditor from "./pages/admin/AdminStaffEditor/AdminStaffEditor";
import JobTerm from "./pages/admin/JobTerm/JobTerm";
import AttendanceEdit from "./pages/AttendanceEdit/AttendanceEdit";
import List from "./pages/List";
import Login from "./pages/Login/Login";
import OfficeLayout from "./pages/office/OfficeLayout";
import OfficePage from "./pages/office/OfficePage";
import OfficeQRRegister from "./pages/office/qr/OfficeQRRegister";
import OfficeQRView from "./pages/office/qr/OfficeQRView";
import Profile from "./pages/Profile";
import Register from "./pages/Register";

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
            element: <List />,
          },
          {
            path: ":targetWorkDate/edit",
            element: <AttendanceEdit />,
          },
          {
            path: "*",
            element: <List />,
          },
        ],
      },
      {
        path: "login",
        element: <Login />,
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
                path: "print",
                element: <AdminAttendancePrint />,
              },
            ],
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
            ],
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
