import { render, screen } from "@testing-library/react";

import AttendanceListPage from "./AttendanceListPage";

jest.mock("@features/attendance/list/ui/AttendanceList", () => {
  function MockAttendanceList() {
    return <div>attendance-list</div>;
  }

  return MockAttendanceList;
});

describe("AttendanceListPage layout", () => {
  it("renders inside the content width preset", () => {
    const { container } = render(<AttendanceListPage />);

    expect(screen.getByText("attendance-list")).toBeInTheDocument();
    expect(
      container.querySelector('div[style*="component-page-widths-content"]'),
    ).toBeTruthy();
  });
});
