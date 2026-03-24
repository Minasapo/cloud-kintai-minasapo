import { render, screen, waitFor } from "@testing-library/react";
import dayjs from "dayjs";

import {
  listAttendances,
  listDailyReports,
} from "@/shared/api/graphql/documents/queries";
import { DailyReportStatus } from "@/shared/api/graphql/types";

import AdminDashboardHome from "./AdminDashboardHome";

const mockGraphql = jest.fn();
const mockUseStaffs = jest.fn();
const mockUseCloseDates = jest.fn();
type MockBarProps = {
  data: {
    labels: string[];
    datasets: Array<{ label: string; data: number[] }>;
  };
};
let capturedBarProps: MockBarProps | null = null;
const isMockBarProps = (value: unknown): value is MockBarProps => {
  if (!value || typeof value !== "object" || !("data" in value)) {
    return false;
  }
  const data = (value as { data?: unknown }).data;
  if (!data || typeof data !== "object") {
    return false;
  }
  return "labels" in data && "datasets" in data;
};
const mockBar = jest.fn((props: unknown) => {
  if (isMockBarProps(props)) {
    capturedBarProps = props;
  }
  return <div data-testid="admin-dashboard-staff-work-status-chart-mock" />;
});

jest.mock("@/shared/api/amplify/graphqlClient", () => ({
  graphqlClient: {
    graphql: (...args: unknown[]) => mockGraphql(...args),
  },
}));

jest.mock("@/widgets/layout/header/AdminPendingApprovalSummary", () => ({
  __esModule: true,
  default: () => <div data-testid="admin-pending-approval-summary-mock" />,
}));

jest.mock("@/entities/staff/model/useStaffs/useStaffs", () => ({
  useStaffs: (...args: unknown[]) => mockUseStaffs(...args),
}));

jest.mock("@/entities/attendance/model/useCloseDates", () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockUseCloseDates(...args),
}));

jest.mock("react-chartjs-2", () => ({
  Bar: (props: unknown) => mockBar(props),
}));

describe("AdminDashboardHome", () => {
  beforeEach(() => {
    mockGraphql.mockReset();
    mockUseStaffs.mockReset();
    mockUseCloseDates.mockReset();
    capturedBarProps = null;
    const monthStart = dayjs().startOf("month");
    mockUseStaffs.mockReturnValue({
      staffs: [
        {
          id: "staff-1",
          cognitoUserId: "cognito-1",
          familyName: "山田",
          givenName: "太郎",
        },
        {
          id: "staff-2",
          cognitoUserId: "cognito-2",
          familyName: "佐藤",
          givenName: "花子",
        },
        {
          id: "staff-3",
          cognitoUserId: "cognito-3",
          familyName: "鈴木",
          givenName: "次郎",
        },
      ],
      loading: false,
      error: null,
    });
    mockUseCloseDates.mockReturnValue({
      closeDates: [
        {
          id: "close-term-1",
          startDate: monthStart.subtract(10, "day").format("YYYY-MM-DD"),
          endDate: monthStart.add(20, "day").format("YYYY-MM-DD"),
          updatedAt: monthStart.add(1, "day").toISOString(),
          closeDate: monthStart.add(20, "day").format("YYYY-MM-DD"),
        },
      ],
      loading: false,
      error: null,
    });
    mockGraphql.mockImplementation(({ query }: { query: unknown }) => {
      if (query === listAttendances) {
        return Promise.resolve({
          data: {
            listAttendances: {
              items: [],
              nextToken: null,
            },
          },
        });
      }

      if (query === listDailyReports) {
        return Promise.resolve({
          data: {
            listDailyReports: {
              items: [],
              nextToken: null,
            },
          },
        });
      }

      return Promise.resolve({});
    });
  });

  it("勤務状況・日報提出状況・申請件数カード領域を表示する", async () => {
    render(<AdminDashboardHome />);

    expect(
      screen.getByTestId("admin-dashboard-count-cards-grid"),
    ).toHaveClass("lg:grid-cols-4");
    expect(
      screen.getByTestId("admin-dashboard-current-working-staff-card"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("admin-dashboard-current-working-staff-info"),
    ).toHaveAttribute("aria-label", expect.stringContaining("勤務中・休憩中スタッフ数"));
    expect(
      screen.getByTestId("admin-dashboard-daily-report-status-card"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("admin-pending-approval-summary-mock"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("admin-dashboard-staff-work-status-chart-card"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("admin-dashboard-staff-work-status-info"),
    ).toHaveAttribute("aria-label", expect.stringContaining("集計期間"));

    await waitFor(() => {
      expect(
        screen.getByTestId("admin-dashboard-current-working-staff-count"),
      ).toHaveTextContent("0人");
      expect(
        screen.getByTestId("admin-dashboard-daily-report-submitted-count"),
      ).toHaveTextContent("0件");
      expect(
        screen.getByTestId("admin-dashboard-daily-report-approved-count"),
      ).toHaveTextContent("(確認済み 0件)");
      expect(
        screen.getByTestId("admin-dashboard-staff-work-status-chart-mock"),
      ).toBeInTheDocument();
    });

    if (!capturedBarProps) {
      throw new Error("Bar props were not captured");
    }
    const periodAttendanceCall = mockGraphql.mock.calls
      .map(([callArgs]) => callArgs)
      .find(
        (callArgs: unknown) =>
          typeof callArgs === "object" &&
          callArgs !== null &&
          "query" in callArgs &&
          "variables" in callArgs &&
          (callArgs as { query?: unknown }).query === listAttendances &&
          Boolean(
            (
              callArgs as {
                variables?: { filter?: { workDate?: { ge?: string } } };
              }
            ).variables?.filter?.workDate?.ge,
          ),
      ) as
      | {
          variables: { filter: { workDate: { ge: string; le: string } } };
        }
      | undefined;
    const monthStart = dayjs().startOf("month");
    expect(periodAttendanceCall?.variables.filter.workDate.ge).toBe(
      monthStart.subtract(10, "day").format("YYYY-MM-DD"),
    );
    expect(periodAttendanceCall?.variables.filter.workDate.le).toBe(
      monthStart.add(20, "day").format("YYYY-MM-DD"),
    );
    const workDataset = capturedBarProps.data.datasets.find(
      (dataset) => dataset.label === "勤務時間",
    );
    expect(workDataset?.data.every((value) => value === 0)).toBe(true);
  });

  it("勤務状況と日報提出状況をそれぞれ件数表示する", async () => {
    mockGraphql.mockImplementation(({ query }: { query: unknown }) => {
      if (query === listAttendances) {
        return Promise.resolve({
          data: {
            listAttendances: {
              items: [
                {
                  staffId: "staff-1",
                  startTime: "09:00",
                  endTime: null,
                  rests: [],
                },
                {
                  staffId: "staff-2",
                  startTime: "09:00",
                  endTime: null,
                  rests: [{ startTime: "12:00", endTime: null }],
                },
                {
                  staffId: "cognito-3",
                  startTime: "2026-03-24T09:00:00+09:00",
                  endTime: "2026-03-24T19:00:00+09:00",
                  rests: [],
                },
                {
                  staffId: "staff-1",
                  startTime: "10:00",
                  endTime: null,
                  rests: [],
                },
                {
                  staffId: "unknown-staff-id",
                  startTime: "2026-03-24T09:00:00+09:00",
                  endTime: "2026-03-24T18:00:00+09:00",
                  rests: [],
                },
              ],
              nextToken: null,
            },
          },
        });
      }

      if (query === listDailyReports) {
        return Promise.resolve({
          data: {
            listDailyReports: {
              items: [
                {
                  staffId: "staff-1",
                  status: DailyReportStatus.SUBMITTED,
                },
                {
                  staffId: "staff-2",
                  status: DailyReportStatus.APPROVED,
                },
                {
                  staffId: "staff-3",
                  status: DailyReportStatus.DRAFT,
                },
              ],
              nextToken: null,
            },
          },
        });
      }

      return Promise.resolve({});
    });

    render(<AdminDashboardHome />);

    await waitFor(() => {
      expect(
        screen.getByTestId("admin-dashboard-current-working-staff-count"),
      ).toHaveTextContent("2人");
      expect(
        screen.getByTestId("admin-dashboard-daily-report-submitted-count"),
      ).toHaveTextContent("2件");
      expect(
        screen.getByTestId("admin-dashboard-daily-report-approved-count"),
      ).toHaveTextContent("(確認済み 1件)");
      expect(
        screen.getByTestId("admin-dashboard-staff-work-status-chart-mock"),
      ).toBeInTheDocument();
    });

    if (!capturedBarProps) {
      throw new Error("Bar props were not captured");
    }

    const overtimeDataset = capturedBarProps.data.datasets.find(
      (dataset) => dataset.label === "残業時間",
    );
    expect(overtimeDataset?.data.some((value) => value < 0)).toBe(true);
    expect(capturedBarProps.data.labels).not.toContain("unknown-staff-id");
    expect(capturedBarProps.data.labels).toContain("鈴木 次郎");
  });
});
