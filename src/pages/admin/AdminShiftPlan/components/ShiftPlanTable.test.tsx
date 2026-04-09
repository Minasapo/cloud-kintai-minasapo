import { fireEvent, render, screen } from "@testing-library/react";

import type { ShiftPlanRow } from "../shiftPlanUtils";
import ShiftPlanTable from "./ShiftPlanTable";

jest.mock("./DayCapacityCell", () => ({
  __esModule: true,
  default: () => <td data-testid="day-capacity-cell" />,
}));

const baseRow: ShiftPlanRow = {
  month: 4,
  editStart: "2026-04-01",
  editEnd: "2026-04-30",
  enabled: true,
  dailyCapacity: Array.from({ length: 31 }, () => ""),
};

const renderTable = (rows: ShiftPlanRow[], onToggleEnabled = jest.fn()) => {
  render(
    <ShiftPlanTable
      selectedYear={2026}
      rows={rows}
      isBusy={false}
      holidayNameMap={new Map()}
      onFieldChange={jest.fn()}
      onToggleEnabled={onToggleEnabled}
      onDailyCapacityChange={jest.fn()}
      onTabNextDay={jest.fn()}
      onRegisterCellRef={jest.fn()}
    />,
  );

  return { onToggleEnabled };
};

describe("ShiftPlanTable", () => {
  it("申請停止ボタンを共通AppButtonで描画する", () => {
    const { onToggleEnabled } = renderTable([{ ...baseRow, enabled: true }]);

    const button = screen.getByRole("button", { name: "申請停止" });
    expect(button).toHaveAttribute("data-app-button-variant", "outline");
    expect(button).toHaveAttribute("data-app-button-tone", "neutral");
    expect(button).toHaveAttribute("data-app-button-size", "sm");
    expect(button).toHaveClass("app-save-button");

    fireEvent.click(button);
    expect(onToggleEnabled).toHaveBeenCalledWith(4);
  });

  it("申請再開ボタンを共通AppButtonで描画する", () => {
    const { onToggleEnabled } = renderTable([{ ...baseRow, enabled: false }]);

    const button = screen.getByRole("button", { name: "申請再開" });
    expect(button).toHaveAttribute("data-app-button-variant", "solid");
    expect(button).toHaveAttribute("data-app-button-tone", "primary");
    expect(button).toHaveAttribute("data-app-button-size", "sm");
    expect(button).toHaveClass("app-save-button");

    fireEvent.click(button);
    expect(onToggleEnabled).toHaveBeenCalledWith(4);
  });
});
