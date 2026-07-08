import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CHAT_SYSTEM_MESSAGE_PREFIX } from "../lib/chatSystemMessages";
import { ShiftCellPanel } from "./ShiftCellPanel";

const baseProps = {
  currentUserId: "user-1",
  currentUserName: "石本達也",
  selectionCount: 1,
  selectedCells: [{ staffId: "staff-1", date: "01" }],
  comments: [],
  onClear: jest.fn(),
  onChangeState: jest.fn(),
  onLock: jest.fn(),
  onUnlock: jest.fn(),
  onAddComments: jest.fn(),
  canUnlock: true,
  showLock: true,
  showUnlock: false,
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
});
