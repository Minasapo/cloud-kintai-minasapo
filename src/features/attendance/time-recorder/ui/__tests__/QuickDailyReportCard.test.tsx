import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";

import {
  createDailyReport,
  updateDailyReport,
} from "@/shared/api/graphql/documents/mutations";
import { dailyReportsByStaffId } from "@/shared/api/graphql/documents/queries";
import { DailyReportStatus } from "@/shared/api/graphql/types";

import QuickDailyReportCard from "../QuickDailyReportCard";

const graphqlMock = jest.fn();
const logDailyReportMutationMock = jest.fn();

jest.mock("@/shared/api/amplify/graphqlClient", () => ({
  graphqlClient: {
    graphql: (...args: unknown[]) => graphqlMock(...args),
  },
}));

jest.mock("@/entities/operation-log/model/dailyReportOperationLog", () => ({
  __esModule: true,
  logDailyReportMutation: (...args: unknown[]) =>
    logDailyReportMutationMock(...args),
}));

jest.mock("react-redux", () => ({
  useDispatch: () => jest.fn(),
}));

describe("QuickDailyReportCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    logDailyReportMutationMock.mockResolvedValue(undefined);
  });

  it("does not log on autosave", async () => {
    jest.useFakeTimers();

    graphqlMock.mockImplementation(({ query }: { query: string }) => {
      if (query === dailyReportsByStaffId) {
        return Promise.resolve({
          data: {
            dailyReportsByStaffId: {
              items: [],
            },
          },
        });
      }

      if (query === createDailyReport) {
        return Promise.resolve({
          data: {
            createDailyReport: {
              __typename: "DailyReport",
              id: "report-2",
              staffId: "staff-1",
              reportDate: "2026-04-01",
              title: "2026-04-01の日報",
              content: "下書き本文",
              status: DailyReportStatus.DRAFT,
              updatedAt: "2026-04-01T09:00:00.000Z",
              createdAt: "2026-04-01T09:00:00.000Z",
              reactions: [],
              comments: [],
              version: 1,
            },
          },
        });
      }

      if (query === updateDailyReport) {
        return Promise.resolve({
          data: {
            updateDailyReport: {
              __typename: "DailyReport",
              id: "report-2",
              staffId: "staff-1",
              reportDate: "2026-04-01",
              title: "2026-04-01の日報",
              content: "下書き本文",
              status: DailyReportStatus.DRAFT,
              updatedAt: "2026-04-01T09:00:01.000Z",
              createdAt: "2026-04-01T09:00:00.000Z",
              reactions: [],
              comments: [],
              version: 2,
            },
          },
        });
      }

      throw new Error(`Unexpected query: ${query}`);
    });

    render(<QuickDailyReportCard staffId="staff-1" date="2026-04-01" />);

    fireEvent.click(screen.getByText("今日の日報メモ"));
    fireEvent.change(
      screen.getByPlaceholderText("今日の振り返りや共有事項をここに入力できます"),
      {
        target: { value: "下書き本文" },
      },
    );

    await act(async () => {
      jest.advanceTimersByTime(1100);
    });

    await waitFor(() => {
      expect(graphqlMock).toHaveBeenCalledWith(
        expect.objectContaining({
          query: createDailyReport,
        }),
      );
    });

    expect(logDailyReportMutationMock).not.toHaveBeenCalled();
  });
});
