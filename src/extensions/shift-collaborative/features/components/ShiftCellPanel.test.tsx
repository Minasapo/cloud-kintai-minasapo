import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import dayjs from "dayjs";

import {
  buildShiftLockChangedSystemMessage,
  CHAT_SYSTEM_MESSAGE_PREFIX,
} from "../lib/chatSystemMessages";
import { ShiftCellPanel } from "./ShiftCellPanel";

const baseProps = {
  currentUserId: "user-1",
  currentUserName: "石本達也",
  selectionCount: 1,
  selectedCells: [{ staffId: "staff-1", date: "01" }],
  comments: [],
  onClear: jest.fn(),
  onChangeState: jest.fn(),
  onLock: jest.fn().mockResolvedValue(true),
  onAddComments: jest.fn(),
  canUnlock: true,
  showLock: true,
  isUpdating: false,
  hasEditLockForSelected: false,
  isOthersEditingSelected: false,
  editLockError: null,
  onClearEditLockError: jest.fn(),
  onAcquireEditLock: jest.fn(),
  onReleaseEditLock: jest.fn(),
  onForceReleaseLock: jest.fn(),
};

describe("ShiftCellPanel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("ロック取得成功時だけシステムコメントを追加する", async () => {
    const user = userEvent.setup();
    const onAddComments = jest.fn().mockResolvedValue(undefined);
    const onAcquireEditLock = jest.fn().mockResolvedValue(true);

    render(
      <ShiftCellPanel
        {...baseProps}
        onAddComments={onAddComments}
        onAcquireEditLock={onAcquireEditLock}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "編集開始（ロック取得）" }),
    );

    expect(onAcquireEditLock).toHaveBeenCalledTimes(1);
    expect(onAddComments).toHaveBeenCalledWith(
      `${CHAT_SYSTEM_MESSAGE_PREFIX}石本達也が編集ロックを取得しました`,
      [],
    );
  });

  it("ロック取得失敗時はシステムコメントを追加しない", async () => {
    const user = userEvent.setup();
    const onAddComments = jest.fn().mockResolvedValue(undefined);
    const onAcquireEditLock = jest.fn().mockResolvedValue(false);

    render(
      <ShiftCellPanel
        {...baseProps}
        onAddComments={onAddComments}
        onAcquireEditLock={onAcquireEditLock}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "編集開始（ロック取得）" }),
    );

    expect(onAcquireEditLock).toHaveBeenCalledTimes(1);
    expect(onAddComments).not.toHaveBeenCalled();
  });

  it("確定成功時にシステムコメントを追加する", async () => {
    const user = userEvent.setup();
    const onLock = jest.fn().mockResolvedValue(true);
    const onAddComments = jest.fn().mockResolvedValue(undefined);

    render(
      <ShiftCellPanel
        {...baseProps}
        showLock
        onLock={onLock}
        onAddComments={onAddComments}
      />,
    );

    await user.click(screen.getByRole("button", { name: "確定" }));

    expect(onLock).toHaveBeenCalledTimes(1);
    expect(onAddComments).toHaveBeenCalledWith(
      buildShiftLockChangedSystemMessage("石本達也", true),
      [],
    );
  });

  it("確定ボタンのみ表示し確定解除は表示しない", () => {
    render(<ShiftCellPanel {...baseProps} />);

    expect(screen.getByRole("button", { name: "確定" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "確定解除" }),
    ).not.toBeInTheDocument();
  });

  it("編集ロックエラーをダイアログ内に表示する", () => {
    render(
      <ShiftCellPanel
        {...baseProps}
        editLockError="編集ロックの取得に失敗しました"
      />,
    );

    expect(
      screen.getByText("編集ロックの取得に失敗しました"),
    ).toBeInTheDocument();
  });

  it("管理者はロック状態に関係なく強制解除ボタンを表示する", () => {
    render(
      <ShiftCellPanel
        {...baseProps}
        canUnlock
        hasEditLockForSelected={false}
        isOthersEditingSelected={false}
      />,
    );

    expect(
      screen.getByRole("button", { name: "編集ロックを強制解除" }),
    ).toBeInTheDocument();
  });

  it("強制解除の実行中は処理中表示に切り替わる", async () => {
    const user = userEvent.setup();
    let resolveForceRelease: () => void;
    const onForceReleaseLock = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveForceRelease = resolve;
        }),
    );

    render(
      <ShiftCellPanel
        {...baseProps}
        canUnlock
        hasEditLockForSelected={false}
        isOthersEditingSelected={false}
        onForceReleaseLock={onForceReleaseLock}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "編集ロックを強制解除" }),
    );

    expect(screen.getAllByRole("button", { name: "処理中..." })).toHaveLength(
      2,
    );

    resolveForceRelease!();

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "編集ロックを強制解除" }),
      ).toBeEnabled();
    });
  });

  it("月次帯の日付セルクリックで選択ハンドラを呼ぶ", async () => {
    const user = userEvent.setup();
    const onDateCellClick = jest.fn();

    render(
      <ShiftCellPanel
        {...baseProps}
        selectedCells={[{ staffId: "staff-1", date: "01" }]}
        shiftDataMap={
          new Map([
            [
              "staff-1",
              new Map([
                [
                  "01",
                  {
                    state: "empty",
                    isLocked: false,
                  },
                ],
              ]),
            ],
          ])
        }
        days={[dayjs("2026-07-01")]}
        staffNameMap={new Map([["staff-1", "スタッフ1"]])}
        onDateCellClick={onDateCellClick}
      />,
    );

    await user.click(screen.getByRole("button", { name: /7\/1/ }));

    expect(onDateCellClick).toHaveBeenCalledWith(
      "staff-1",
      "01",
      expect.any(Object),
    );
  });

  it("月次帯の確定セルはロック絵文字ではなくチェックアイコンを表示する", () => {
    render(
      <ShiftCellPanel
        {...baseProps}
        selectedCells={[{ staffId: "staff-1", date: "01" }]}
        shiftDataMap={
          new Map([
            [
              "staff-1",
              new Map([
                [
                  "01",
                  {
                    state: "requestedOff",
                    isLocked: true,
                  },
                ],
              ]),
            ],
          ])
        }
        days={[dayjs("2026-07-01")]}
        staffNameMap={new Map([["staff-1", "スタッフ1"]])}
      />,
    );

    const dayButton = screen.getByRole("button", { name: /7\/1/ });

    expect(within(dayButton).getByTestId("CheckIcon")).toBeInTheDocument();
    expect(within(dayButton).queryByText("🔒")).not.toBeInTheDocument();
  });
});
