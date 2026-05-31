import { AppConfigContext } from "@entities/app-config/model/AppConfigContext";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import AttendanceStatisticsPage from "./AttendanceStatisticsPage";

jest.mock("../features/statistics/ui/AttendanceStatistics", () => ({
  __esModule: true,
  default: () => <div>attendance statistics body</div>,
}));

function renderPage(enabled: boolean) {
  return render(
    <MemoryRouter initialEntries={["/attendance/stats"]}>
      <AppConfigContext.Provider
        value={{
          fetchConfig: jest.fn(),
          saveConfig: jest.fn(),
          getStartTime: jest.fn(),
          getEndTime: jest.fn(),
          getStandardWorkHours: jest.fn(),
          getConfigId: jest.fn(),
          getLinks: jest.fn(() => []),
          getReasons: jest.fn(() => []),
          getOfficeMode: jest.fn(() => false),
          getAttendanceStatisticsEnabled: jest.fn(() => enabled),
          getWorkflowNotificationEnabled: jest.fn(() => false),
          getTimeRecorderAnnouncement: jest.fn(() => ({
            enabled: false,
            message: "",
          })),
          getShiftCollaborativeEnabled: jest.fn(() => false),
          getShiftDefaultMode: jest.fn(() => "normal"),
          getQuickInputStartTimes: jest.fn(() => []),
          getQuickInputEndTimes: jest.fn(() => []),
          getShiftGroups: jest.fn(() => []),
          getLunchRestStartTime: jest.fn(),
          getLunchRestEndTime: jest.fn(),
          getHourlyPaidHolidayEnabled: jest.fn(() => false),
          getAmHolidayStartTime: jest.fn(),
          getAmHolidayEndTime: jest.fn(),
          getPmHolidayStartTime: jest.fn(),
          getPmHolidayEndTime: jest.fn(),
          getAmPmHolidayEnabled: jest.fn(() => false),
          getSpecialHolidayEnabled: jest.fn(() => false),
          getAbsentEnabled: jest.fn(() => false),
          getOverTimeCheckEnabled: jest.fn(() => false),
          getWorkflowCategoryOrder: jest.fn(() => []),
          getThemeColor: jest.fn(() => ""),
          getThemeTokens: jest.fn(),
        }}
      >
        <Routes>
          <Route
            path="/attendance/stats"
            element={<AttendanceStatisticsPage />}
          />
          <Route
            path="/attendance/list"
            element={<div>attendance list page</div>}
          />
        </Routes>
      </AppConfigContext.Provider>
    </MemoryRouter>,
  );
}

describe("AttendanceStatisticsPage", () => {
  it("renders statistics page when feature is enabled", () => {
    renderPage(true);

    expect(screen.getByText("attendance statistics body")).toBeInTheDocument();
  });

  it("redirects to attendance list when feature is disabled", () => {
    renderPage(false);

    expect(screen.getByText("attendance list page")).toBeInTheDocument();
  });
});
