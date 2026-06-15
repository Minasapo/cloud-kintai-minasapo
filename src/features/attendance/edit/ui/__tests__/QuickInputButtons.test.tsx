import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import QuickInputButtons from "../QuickInputButtons";

const mockSetSelectedKey = jest.fn();
const mockAskConfirm = jest.fn();
const mockApplySelectedAction = jest.fn();
const mockClose = jest.fn();

const actionFn1 = jest.fn();
const actionFn2 = jest.fn();

jest.mock("../../model/useQuickInputActions", () => ({
  useQuickInputActions: () => [
    {
      key: "normal",
      label: "通常勤務",
      tooltip: "規定の出勤時間と昼休みをセットします。",
      action: actionFn1,
    },
    {
      key: "clear",
      label: "クリア",
      tooltip: "入力内容をすべてクリアします。",
      action: actionFn2,
    },
  ],
}));

jest.mock("../../model/useQuickInputSelection", () => ({
  useQuickInputSelection: () => ({
    open: false,
    selectedKey: null,
    setSelectedKey: mockSetSelectedKey,
    confirmLabel: null,
    askConfirm: mockAskConfirm,
    applySelectedAction: mockApplySelectedAction,
    close: mockClose,
  }),
}));

describe("QuickInputButtons", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("初期表示時に先頭アクションが選択される", () => {
    render(
      <QuickInputButtons
        setValue={jest.fn()}
        restReplace={jest.fn()}
        hourlyPaidHolidayTimeReplace={jest.fn()}
        workDate={null}
      />,
    );

    expect(mockSetSelectedKey).toHaveBeenCalledWith("normal");
  });

  it("主ボタン押下で選択中アクションの確認を開く", async () => {
    const user = userEvent.setup();

    render(
      <QuickInputButtons
        setValue={jest.fn()}
        restReplace={jest.fn()}
        hourlyPaidHolidayTimeReplace={jest.fn()}
        workDate={null}
      />,
    );

    await user.click(screen.getByRole("button", { name: "通常勤務" }));

    expect(mockAskConfirm).toHaveBeenCalledWith(
      "定型入力: 「通常勤務」を適用します。よろしいですか？",
      actionFn1,
    );
  });
});
