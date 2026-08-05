import type { StaffType } from "@entities/staff/model/useStaffs/useStaffs";
import { StaffRole } from "@entities/staff/model/useStaffs/useStaffs";
import {
  commentsToWorkflowMessages,
  formatWorkflowCommentSender,
  shouldTruncateWorkflowMessage,
} from "@features/workflow/comment-thread/model/workflowCommentUtils";
import type { WorkflowComment } from "@shared/api/graphql/types";

const staffFixture = (overrides: Partial<StaffType> = {}): StaffType =>
  ({
    id: "staff-1",
    cognitoUserId: "cognito-1",
    familyName: "山田",
    givenName: "太郎",
    mailAddress: "",
    owner: false,
    role: StaffRole.STAFF,
    enabled: true,
    status: "active" as StaffType["status"],
    createdAt: "",
    updatedAt: "",
    ...overrides,
  } as StaffType);

const commentFixture = (
  overrides: Partial<WorkflowComment> = {}
): WorkflowComment => ({
  __typename: "WorkflowComment",
  id: "comment-1",
  staffId: "staff-1",
  text: "テスト",
  createdAt: "2024-01-01T00:00:00Z",
  ...overrides,
});

describe("formatWorkflowCommentSender", () => {
  it("sender が未設定の場合、システムを返すこと", () => {
    expect(formatWorkflowCommentSender(undefined)).toBe("システム");
    expect(formatWorkflowCommentSender("   ")).toBe("システム");
  });

  it("system/bot ラベルを正規化すること", () => {
    expect(formatWorkflowCommentSender("system")).toBe("システム");
    expect(formatWorkflowCommentSender("system-auto")).toBe("システム");
    expect(formatWorkflowCommentSender("ApprovalBot")).toBe("システム");
  });

  it("それ以外は trim 済み sender を返すこと", () => {
    expect(formatWorkflowCommentSender(" 田中 ")).toBe("田中");
  });
});

describe("commentsToWorkflowMessages", () => {
  const staffs: StaffType[] = [
    staffFixture(),
    staffFixture({
      id: "staff-2",
      familyName: "佐藤",
      givenName: "",
    }),
  ];

  it("comments をスタッフ名付きの表示メッセージへ変換すること", () => {
    const comments: WorkflowComment[] = [
      commentFixture({ id: "c-1", staffId: "staff-1", text: "こんにちは" }),
      commentFixture({
        id: undefined,
        staffId: "system",
        createdAt: undefined,
        text: "自動通知",
      }),
      commentFixture({ id: "c-3", staffId: "unknown", text: "??" }),
    ];

    const result = commentsToWorkflowMessages(comments, staffs, {
      generateId: () => "generated-id",
      formatTimestamp: (iso) => (iso ? `formatted:${iso}` : ""),
    });

    expect(result).toEqual([
      {
        id: "c-1",
        sender: "山田 太郎",
        staffId: "staff-1",
        text: "こんにちは",
        time: "formatted:2024-01-01T00:00:00Z",
      },
      {
        id: "generated-id",
        sender: "システム",
        staffId: "system",
        text: "自動通知",
        time: "",
      },
      {
        id: "c-3",
        sender: "unknown",
        staffId: "unknown",
        text: "??",
        time: "formatted:2024-01-01T00:00:00Z",
      },
    ]);
  });

  it("formatTimestamp 未指定時はデフォルト実装を使うこと", () => {
    const comments = [commentFixture({ id: "c-1", staffId: "staff-1", text: "テスト" })];
    const result = commentsToWorkflowMessages(comments, staffs, {
      generateId: () => "gen-id",
    });
    expect(result).toHaveLength(1);
    expect(typeof result[0].time).toBe("string");
  });

  it("null エントリは無視すること", () => {
    const result = commentsToWorkflowMessages(
      [commentFixture(), null],
      staffs,
      {
        generateId: () => "generated-id",
        formatTimestamp: () => "",
      }
    );
    expect(result).toHaveLength(1);
  });
});

describe("shouldTruncateWorkflowMessage", () => {
  it("展開しておらず行数が 5 行を超える場合、true を返すこと", () => {
    const text = "1\n2\n3\n4\n5\n6";
    expect(shouldTruncateWorkflowMessage(text, false)).toBe(true);
  });

  it("文字数が 800 を超える場合、true を返すこと", () => {
    const text = "x".repeat(801);
    expect(shouldTruncateWorkflowMessage(text, false)).toBe(true);
  });

  it("展開状態の場合、false を返すこと", () => {
    const text = "1\n2\n3\n4\n5\n6";
    expect(shouldTruncateWorkflowMessage(text, true)).toBe(false);
  });
});
