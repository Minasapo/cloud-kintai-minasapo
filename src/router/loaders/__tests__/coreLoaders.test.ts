import { store } from "@app/store";
import { attendanceApi } from "@entities/attendance/api/attendanceApi";
import { getAttendanceMonthRangeInput } from "@entities/attendance/lib/attendanceQueryRange";
import { calendarApi } from "@entities/calendar/api/calendarApi";
import { workflowApi } from "@entities/workflow/api/workflowApi";
import { fetchAuthSession } from "aws-amplify/auth";

import { adminDashboardLoader } from "../adminDashboardLoader";
import { attendanceListLoader } from "../attendanceListLoader";
import { workflowListLoader } from "../workflowListLoader";

jest.mock("@app/store", () => ({
  store: {
    dispatch: jest.fn(),
  },
}));

jest.mock("@entities/attendance/lib/attendanceQueryRange", () => ({
  getAttendanceMonthRangeInput: jest.fn(() => ({
    startDate: "2026-05-01",
    endDate: "2026-05-31",
  })),
}));

jest.mock("aws-amplify/auth", () => ({
  fetchAuthSession: jest.fn(),
}));

jest.mock("@entities/calendar/api/calendarApi", () => ({
  calendarApi: {
    endpoints: {
      getHolidayCalendars: { initiate: jest.fn() },
      getCompanyHolidayCalendars: { initiate: jest.fn() },
      getEventCalendars: { initiate: jest.fn() },
    },
  },
}));

jest.mock("@entities/workflow/api/workflowApi", () => ({
  workflowApi: {
    endpoints: {
      getWorkflows: { initiate: jest.fn() },
    },
  },
}));

jest.mock("@entities/attendance/api/attendanceApi", () => ({
  attendanceApi: {
    endpoints: {
      listAttendancesByDateRange: { initiate: jest.fn() },
    },
  },
}));

const mockedDispatch = jest.mocked(store.dispatch);
const mockedFetchAuthSession = jest.mocked(fetchAuthSession);
const mockedGetAttendanceMonthRangeInput = jest.mocked(getAttendanceMonthRangeInput);

const mockGetHolidayCalendarsInitiate = jest.mocked(
  calendarApi.endpoints.getHolidayCalendars.initiate,
);
const mockGetCompanyHolidayCalendarsInitiate = jest.mocked(
  calendarApi.endpoints.getCompanyHolidayCalendars.initiate,
);
const mockGetEventCalendarsInitiate = jest.mocked(
  calendarApi.endpoints.getEventCalendars.initiate,
);
const mockGetWorkflowsInitiate = jest.mocked(
  workflowApi.endpoints.getWorkflows.initiate,
);
const mockListAttendancesByDateRangeInitiate = jest.mocked(
  attendanceApi.endpoints.listAttendancesByDateRange.initiate,
);

function createDispatchResult(options?: { reject?: boolean }) {
  return {
    unwrap: () =>
      options?.reject
        ? Promise.reject(new Error("request failed"))
        : Promise.resolve(null),
  };
}

describe("router loaders", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedDispatch.mockImplementation((value) => value as never);
    mockedGetAttendanceMonthRangeInput.mockReturnValue({
      startDate: "2026-05-01",
      endDate: "2026-05-31",
    });

    mockGetHolidayCalendarsInitiate.mockReturnValue(createDispatchResult() as never);
    mockGetCompanyHolidayCalendarsInitiate.mockReturnValue(
      createDispatchResult() as never,
    );
    mockGetEventCalendarsInitiate.mockReturnValue(createDispatchResult() as never);
    mockGetWorkflowsInitiate.mockReturnValue(createDispatchResult() as never);
    mockListAttendancesByDateRangeInitiate.mockReturnValue(
      createDispatchResult() as never,
    );
  });

  it("adminDashboardLoader dispatches all preload queries", async () => {
    const result = await adminDashboardLoader();

    expect(result).toBeNull();
    expect(mockGetHolidayCalendarsInitiate).toHaveBeenCalledWith(undefined, {
      subscribe: false,
    });
    expect(mockGetCompanyHolidayCalendarsInitiate).toHaveBeenCalledWith(
      undefined,
      { subscribe: false },
    );
    expect(mockGetEventCalendarsInitiate).toHaveBeenCalledWith(undefined, {
      subscribe: false,
    });
    expect(mockGetWorkflowsInitiate).toHaveBeenCalledWith(undefined, {
      subscribe: false,
    });
  });

  it("attendanceListLoader includes attendance query when user id is resolved", async () => {
    mockedFetchAuthSession.mockResolvedValue({
      tokens: { idToken: { payload: { sub: "staff-1" } } },
    } as never);

    const result = await attendanceListLoader();

    expect(result).toBeNull();
    expect(mockedGetAttendanceMonthRangeInput).toHaveBeenCalled();
    expect(mockListAttendancesByDateRangeInitiate).toHaveBeenCalledWith(
      {
        staffId: "staff-1",
        startDate: "2026-05-01",
        endDate: "2026-05-31",
      },
      { subscribe: false },
    );
  });

  it("attendanceListLoader retries fetchAuthSession and skips attendance query when unresolved", async () => {
    mockedFetchAuthSession.mockRejectedValueOnce(new Error("temporary"));
    mockedFetchAuthSession.mockRejectedValueOnce(new Error("still failed"));

    const result = await attendanceListLoader();

    expect(result).toBeNull();
    expect(mockedFetchAuthSession).toHaveBeenCalledTimes(2);
    expect(mockListAttendancesByDateRangeInitiate).not.toHaveBeenCalled();
  });

  it("attendanceListLoader uses second attempt result when first fetchAuthSession fails", async () => {
    mockedFetchAuthSession.mockRejectedValueOnce(new Error("temporary"));
    mockedFetchAuthSession.mockResolvedValueOnce({
      tokens: { idToken: { payload: { sub: "staff-retry" } } },
    } as never);

    await attendanceListLoader();

    expect(mockedFetchAuthSession).toHaveBeenCalledTimes(2);
    expect(mockListAttendancesByDateRangeInitiate).toHaveBeenCalledWith(
      {
        staffId: "staff-retry",
        startDate: "2026-05-01",
        endDate: "2026-05-31",
      },
      { subscribe: false },
    );
  });

  it("workflowListLoader swallows workflow preload errors", async () => {
    mockGetWorkflowsInitiate.mockReturnValue(
      createDispatchResult({ reject: true }) as never,
    );

    await expect(workflowListLoader()).resolves.toBeNull();
  });
});
