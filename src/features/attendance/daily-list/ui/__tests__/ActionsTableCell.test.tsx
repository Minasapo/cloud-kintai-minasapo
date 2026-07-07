import type { AttendanceDaily } from "@entities/attendance/model/useAttendanceDaily";
import { configureStore } from "@reduxjs/toolkit";
import type {
  Attendance,
  CompanyHolidayCalendar,
  HolidayCalendar,
  Staff,
} from "@shared/api/graphql/types";
import notificationReducer from "@shared/lib/store/notificationSlice";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";

import { ActionsTableCell } from "../ActionsTableCell";

jest.mock("@entities/staff/model/useStaff/fetchStaff", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("../../lib/attendanceSummaryStatus", () => ({
  resolveAttendanceSummaryStatus: jest.fn(),
}));

jest.mock("@shared/ui/button", () => ({
  AppIconButton: ({
    children,
    onClick,
    ...rest
  }: React.PropsWithChildren<{
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
  }>) => (
    <button type="button" onClick={onClick} {...rest}>
      {children}
    </button>
  ),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const fetchStaffMock = jest.requireMock(
  "@entities/staff/model/useStaff/fetchStaff",
).default as jest.Mock;
const resolveAttendanceSummaryStatusMock = jest.requireMock(
  "../../lib/attendanceSummaryStatus",
).resolveAttendanceSummaryStatus as jest.Mock;

const baseRow: AttendanceDaily = {
  sub: "staff-1",
  familyName: "山田",
  givenName: "太郎",
  sortKey: "yamada",
  attendance: null,
};

const baseStaff = {
  id: "staff-1",
  cognitoUserId: "staff-1",
  familyName: "山田",
  givenName: "太郎",
  role: "STAFF",
  mailAddress: "taro@example.com",
  enabled: true,
  status: "ACTIVE",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
} as unknown as Staff;

const baseAttendance = {
  __typename: "Attendance",
  id: "att-1",
  staffId: "staff-1",
  workDate: "2026-07-02",
  startTime: "2026-07-02T09:00:00.000Z",
  endTime: "2026-07-02T18:00:00.000Z",
  goDirectlyFlag: false,
  returnDirectlyFlag: false,
  absentFlag: false,
  rests: [],
  hourlyPaidHolidayTimes: [],
  remarks: "",
  paidHolidayFlag: false,
  specialHolidayFlag: false,
  isDeemedHoliday: false,
  hourlyPaidHolidayHours: 0,
  substituteHolidayDate: null,
  histories: [],
  changeRequests: [],
  systemComments: [],
  revision: 1,
  createdAt: "2026-07-02T09:00:00.000Z",
  updatedAt: "2026-07-02T18:00:00.000Z",
} as unknown as Attendance;

function renderComponent(attendances: Attendance[]) {
  const store = configureStore({
    reducer: {
      notifications: notificationReducer,
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <table>
          <tbody>
            <tr>
              <ActionsTableCell
                row={baseRow}
                attendances={attendances}
                attendanceLoading={false}
                attendanceError={null}
                holidayCalendars={[] as HolidayCalendar[]}
                companyHolidayCalendars={[] as CompanyHolidayCalendar[]}
                calendarLoading={false}
                targetWorkDate="2026-07-02"
              />
            </tr>
          </tbody>
        </table>
      </MemoryRouter>
    </Provider>,
  );
}

describe("ActionsTableCell", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchStaffMock.mockResolvedValue(baseStaff);
    resolveAttendanceSummaryStatusMock.mockReturnValue("ok");
  });

  it("未承認の修正申請がある場合は申請中アイコンを優先表示する", async () => {
    const attendanceWithRequest = {
      ...baseAttendance,
      changeRequests: [{ completed: false, startTime: null, endTime: null }],
    } as unknown as Attendance;

    renderComponent([attendanceWithRequest]);

    await waitFor(() => {
      expect(screen.getByTestId("HourglassTopIcon")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("CheckCircleIcon")).not.toBeInTheDocument();
  });

  it("未承認の修正申請件数をバッジに表示する", async () => {
    const attendanceWithTwoRequests = {
      ...baseAttendance,
      changeRequests: [
        { completed: false, startTime: null, endTime: null },
        { completed: null, startTime: null, endTime: null },
        { completed: true, startTime: null, endTime: null },
      ],
    } as unknown as Attendance;

    renderComponent([attendanceWithTwoRequests]);

    await waitFor(() => {
      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });

  it("未承認申請がない場合はサマリーステータスに従う", async () => {
    renderComponent([baseAttendance]);

    await waitFor(() => {
      expect(screen.getByTestId("CheckCircleIcon")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("HourglassTopIcon")).not.toBeInTheDocument();
  });
});
