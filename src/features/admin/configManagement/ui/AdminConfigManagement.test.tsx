import { render, screen } from "@testing-library/react";

import AdminConfigManagement from "./AdminConfigManagement";

const mockHandleWorkflowNotificationEnabledChange = jest.fn();
const mockHandleOverTimeCheckEnabledChange = jest.fn();
const mockHandleShiftCollaborativeEnabledChange = jest.fn();
const mockHandleShiftDefaultModeChange = jest.fn();
const mockHandleSave = jest.fn();

jest.mock("../model/useAdminConfigForm", () => ({
  useAdminConfigForm: () => ({
    sectionSpacing: 2,
    workflowNotificationEnabled: true,
    overTimeCheckEnabled: false,
    shiftCollaborativeEnabled: true,
    shiftDefaultMode: "normal",
    handleWorkflowNotificationEnabledChange:
      mockHandleWorkflowNotificationEnabledChange,
    handleOverTimeCheckEnabledChange: mockHandleOverTimeCheckEnabledChange,
    handleShiftCollaborativeEnabledChange:
      mockHandleShiftCollaborativeEnabledChange,
    handleShiftDefaultModeChange: mockHandleShiftDefaultModeChange,
    handleSave: mockHandleSave,
  }),
}));

describe("AdminConfigManagement", () => {
  beforeEach(() => {
    mockHandleWorkflowNotificationEnabledChange.mockReset();
    mockHandleOverTimeCheckEnabledChange.mockReset();
    mockHandleShiftCollaborativeEnabledChange.mockReset();
    mockHandleShiftDefaultModeChange.mockReset();
    mockHandleSave.mockReset();
  });

  it("shows only settings that remain on the summary page", () => {
    render(<AdminConfigManagement />);

    expect(
      screen.getByText(
        "勤務時間や残業確認、特別休暇などの個別設定は、各専用ページから変更してください。",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("通知機能(開発中)")).toBeInTheDocument();
    expect(screen.queryByText("シフト表示モード")).not.toBeInTheDocument();
  });

  it("does not show settings that have dedicated pages", () => {
    render(<AdminConfigManagement />);

    expect(screen.queryByText("勤務時間")).not.toBeInTheDocument();
    expect(screen.queryByText("残業確認")).not.toBeInTheDocument();
    expect(screen.queryByText("特別休暇")).not.toBeInTheDocument();
    expect(screen.queryByText("欠勤")).not.toBeInTheDocument();
    expect(screen.queryByText("出勤モード")).not.toBeInTheDocument();
    expect(screen.queryByText("外部リンク")).not.toBeInTheDocument();
    expect(screen.queryByText("打刻理由リスト")).not.toBeInTheDocument();
    expect(
      screen.queryByText("クイック入力(打刻)設定"),
    ).not.toBeInTheDocument();
  });
});
