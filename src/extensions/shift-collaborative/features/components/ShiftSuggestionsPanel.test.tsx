import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ShiftSuggestionsPanelBase } from "./ShiftSuggestionsPanel";

describe("ShiftSuggestionsPanel", () => {
  const createViolation = () => ({
    ruleId: "min-workers",
    severity: "error" as const,
    message: "出勤者が不足しています",
    affectedCells: [{ staffId: "staff-1", date: "2026-02-26" }],
    suggestedActions: [
      {
        id: "assign-1",
        description: "staff-1を出勤にする",
        changes: [
          {
            staffId: "staff-1",
            date: "2026-02-26",
            newState: "work" as const,
          },
        ],
        impact: "出勤者数を1名増やします",
      },
    ],
  });

  it("タイトルと違反内容を表示する", () => {
    render(
      <ShiftSuggestionsPanelBase
        open
        onClose={jest.fn()}
        violations={[createViolation()]}
        isAnalyzing={false}
        onApplyAction={jest.fn()}
        onRefresh={jest.fn()}
      />,
    );

    expect(screen.getByText("シフト提案")).toBeInTheDocument();
    expect(screen.getByText("出勤者が不足しています")).toBeInTheDocument();
  });

  it("クローズボタン押下時に onClose を呼ぶ", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    render(
      <ShiftSuggestionsPanelBase
        open
        onClose={onClose}
        violations={[createViolation()]}
        isAnalyzing={false}
        onApplyAction={jest.fn()}
        onRefresh={jest.fn()}
      />,
    );

    await user.click(screen.getByLabelText("close"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
