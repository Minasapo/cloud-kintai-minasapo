import {
  StaffRole,
  StaffType,
} from "@entities/staff/model/useStaffs/useStaffs";
import { fireEvent, render, screen } from "@testing-library/react";

import { WorkflowCommentThreadView as WorkflowCommentThread } from "../WorkflowCommentThread";

describe("WorkflowCommentThread", () => {
  const baseMessages = [
    {
      id: "msg-1",
      sender: "山田 太郎",
      staffId: "staff-1",
      text: "通常メッセージ",
      time: "2026/03/24 10:00",
    },
    {
      id: "msg-2",
      sender: "鈴木 花子",
      staffId: "staff-2",
      text: "a".repeat(810),
      time: "2026/03/24 10:05",
    },
  ];

  const staffs: StaffType[] = [
    {
      id: "staff-1",
      familyName: "山田",
      givenName: "太郎",
      cognitoUserId: "cognito-1",
      role: StaffRole.STAFF,
      mailAddress: "a@example.com",
      enabled: true,
      status: "active",
      owner: false,
      createdAt: "",
      updatedAt: "",
      version: 1,
    },
    {
      id: "staff-2",
      familyName: "鈴木",
      givenName: "花子",
      cognitoUserId: "cognito-2",
      role: StaffRole.STAFF,
      mailAddress: "b@example.com",
      enabled: true,
      status: "active",
      owner: false,
      createdAt: "",
      updatedAt: "",
      version: 1,
    },
  ];

  it("Ctrl+Enter と送信ボタンで onSend を呼び出す", () => {
    const onSend = jest.fn();

    render(
      <WorkflowCommentThread
        messages={baseMessages}
        staffs={staffs}
        currentStaff={staffs[0]}
        expandedMessages={{}}
        onToggle={jest.fn()}
        input="送信内容"
        setInput={jest.fn()}
        onSend={onSend}
        sending={false}
        formatSender={(sender) => sender ?? ""}
      />,
    );

    const textarea = screen.getByPlaceholderText("メッセージを入力...");
    fireEvent.keyDown(textarea, { key: "Enter", ctrlKey: true });

    expect(onSend).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "送信" }));
    expect(onSend).toHaveBeenCalledTimes(2);
  });

  it("長文メッセージで もっと見る が表示される", () => {
    const onToggle = jest.fn();

    render(
      <WorkflowCommentThread
        messages={baseMessages}
        staffs={staffs}
        currentStaff={staffs[0]}
        expandedMessages={{}}
        onToggle={onToggle}
        input="テスト"
        setInput={jest.fn()}
        onSend={jest.fn()}
        sending={false}
        formatSender={(sender) => sender ?? ""}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "もっと見る" }));
    expect(onToggle).toHaveBeenCalledWith("msg-2");
  });
});
