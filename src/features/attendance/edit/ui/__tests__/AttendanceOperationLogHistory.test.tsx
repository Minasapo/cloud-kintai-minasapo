import type { Attendance, OperationLog } from "@shared/api/graphql/types";
import { render, screen, waitFor } from "@testing-library/react";

import AttendanceOperationLogHistory from "../AttendanceOperationLogHistory";

const fetchOperationLogsMock = jest.fn();

jest.mock("@entities/staff/model/useStaff/fetchStaff", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("@/entities/operation-log/model/fetchOperationLogs", () => ({
  __esModule: true,
  default: (...args: unknown[]) => fetchOperationLogsMock(...args),
}));

jest.mock("@/entities/operation-log/ui/OperationLogJsonDetails", () => ({
  OperationLogJsonDetails: () => <div>json details</div>,
}));

describe("AttendanceOperationLogHistory", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchOperationLogsMock.mockResolvedValue({
      items: [
        {
          id: "log-1",
          action: "attendance.update",
          resource: "attendance",
          resourceId: "attendance-1",
          resourceKey: "attendance#attendance-1",
          summary: {
            message: "history object summary",
          } as unknown as OperationLog["summary"],
          details: null,
          timestamp: "2026-03-31T10:00:00.000Z",
          createdAt: "2026-03-31T10:00:00.000Z",
          updatedAt: "2026-03-31T10:00:00.000Z",
        },
      ],
      nextToken: null,
    });
  });

  it("renders object summaries safely for canonical logs", async () => {
    render(
      <AttendanceOperationLogHistory
        attendance={
          {
            id: "attendance-1",
            histories: [],
          } as unknown as Attendance
        }
      />,
    );

    await screen.findByText('{"message":"history object summary"}');

    await waitFor(() => {
      expect(screen.queryByText("[object Object]")).not.toBeInTheDocument();
    });
  });

  it("shows the empty state without fetching when attendance is not selected", () => {
    render(<AttendanceOperationLogHistory attendance={null} />);

    expect(screen.getByText("履歴がありません。")).toBeInTheDocument();
    expect(fetchOperationLogsMock).not.toHaveBeenCalled();
  });
});
