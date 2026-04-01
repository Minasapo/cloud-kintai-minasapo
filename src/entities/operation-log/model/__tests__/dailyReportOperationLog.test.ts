import {
  DailyReportReactionType,
  DailyReportStatus,
} from "@shared/api/graphql/types";

import {
  buildDailyReportLogSnapshot,
  logDailyReportCommentAdd,
  logDailyReportMutation,
  logDailyReportReactionUpdate,
} from "../dailyReportOperationLog";

const logOperationEventMock = jest.fn();

jest.mock("../canonicalOperationLog", () => ({
  __esModule: true,
  logOperationEvent: (...args: unknown[]) => logOperationEventMock(...args),
}));

describe("dailyReportOperationLog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    logOperationEventMock.mockResolvedValue(undefined);
  });

  it("builds a normalized snapshot from daily report view data", () => {
    expect(
      buildDailyReportLogSnapshot({
        id: "report-1",
        staffId: "staff-1",
        date: "2026-04-01",
        title: "タイトル",
        content: "本文",
        status: DailyReportStatus.DRAFT,
      }),
    ).toEqual({
      id: "report-1",
      staffId: "staff-1",
      reportDate: "2026-04-01",
      title: "タイトル",
      content: "本文",
      status: DailyReportStatus.DRAFT,
      reactions: [],
      comments: [],
      createdAt: null,
      updatedAt: null,
      version: null,
    });
  });

  it("writes create and submit payloads with canonical action names", async () => {
    await logDailyReportMutation({
      actorStaffId: "actor-1",
      before: null,
      after: {
        id: "report-1",
        staffId: "staff-1",
        reportDate: "2026-04-01",
        title: "作成タイトル",
        content: "本文",
        status: DailyReportStatus.DRAFT,
      },
      action: "create",
    });

    await logDailyReportMutation({
      actorStaffId: "actor-1",
      before: {
        id: "report-1",
        staffId: "staff-1",
        date: "2026-04-01",
        title: "提出前",
        content: "本文",
        status: DailyReportStatus.DRAFT,
      },
      after: {
        id: "report-1",
        staffId: "staff-1",
        reportDate: "2026-04-01",
        title: "提出前",
        content: "本文",
        status: DailyReportStatus.SUBMITTED,
      },
      action: "submit",
    });

    expect(logOperationEventMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        action: "daily_report.create",
        resource: "daily_report",
        resourceId: "report-1",
        actorStaffId: "actor-1",
        targetStaffId: "staff-1",
        summary: "2026-04-01 の 日報を作成: 作成タイトル",
        before: null,
        after: expect.objectContaining({
          reportDate: "2026-04-01",
          status: DailyReportStatus.DRAFT,
        }),
      }),
    );

    expect(logOperationEventMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        action: "daily_report.submit",
        targetStaffId: "staff-1",
        summary: "2026-04-01 の 日報を提出: 提出前",
        before: expect.objectContaining({
          reportDate: "2026-04-01",
          status: DailyReportStatus.DRAFT,
        }),
        after: expect.objectContaining({
          reportDate: "2026-04-01",
          status: DailyReportStatus.SUBMITTED,
        }),
      }),
    );
  });

  it("writes comment add payload with comment metadata", async () => {
    await logDailyReportCommentAdd({
      actorStaffId: "admin-1",
      before: {
        id: "report-1",
        staffId: "staff-1",
        date: "2026-04-01",
        title: "日報",
        status: DailyReportStatus.SUBMITTED,
      },
      after: {
        id: "report-1",
        staffId: "staff-1",
        reportDate: "2026-04-01",
        title: "日報",
        status: DailyReportStatus.SUBMITTED,
      },
      comment: {
        id: "comment-1",
        authorName: "管理者 太郎",
        body: "確認しました。明日もよろしくお願いします。",
        createdAt: "2026-04-01T09:00:00.000Z",
      },
    });

    expect(logOperationEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "daily_report.comment.add",
        actorStaffId: "admin-1",
        targetStaffId: "staff-1",
        details: expect.objectContaining({
          commentId: "comment-1",
          commentAuthorName: "管理者 太郎",
          commentBodyPreview: "確認しました。明日もよろしくお願いします。",
        }),
      }),
    );
  });

  it("writes reaction update payload with operation metadata", async () => {
    await logDailyReportReactionUpdate({
      actorStaffId: "admin-1",
      before: {
        id: "report-1",
        staffId: "staff-1",
        date: "2026-04-01",
        title: "日報",
        status: DailyReportStatus.SUBMITTED,
      },
      after: {
        id: "report-1",
        staffId: "staff-1",
        reportDate: "2026-04-01",
        title: "日報",
        status: DailyReportStatus.SUBMITTED,
      },
      operation: "add",
      reactionType: DailyReportReactionType.CHECK,
    });

    expect(logOperationEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "daily_report.reaction.update",
        actorStaffId: "admin-1",
        targetStaffId: "staff-1",
        details: expect.objectContaining({
          operation: "add",
          reactionType: DailyReportReactionType.CHECK,
        }),
      }),
    );
  });
});
