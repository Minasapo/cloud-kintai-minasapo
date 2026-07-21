import { act, renderHook } from "@testing-library/react";

import { CHAT_SYSTEM_MESSAGE_PREFIX } from "../../lib/chatSystemMessages";
import { useCollaborativePageState } from "../useCollaborativePageState";

const mockUseCollaborativeShift = jest.fn();
const mockUseShiftCalendar = jest.fn();
const mockUseSelectionState = jest.fn();
const mockUseShiftSuggestions = jest.fn();
const mockUseShiftMetrics = jest.fn();
const mockUseAuthSessionSummary = jest.fn();
const mockGraphql = jest.fn();

jest.mock("../../context/CollaborativeShiftContext", () => ({
  useCollaborativeShift: () => mockUseCollaborativeShift(),
}));

jest.mock("../useShiftCalendar", () => ({
  useShiftCalendar: (...args: unknown[]) => mockUseShiftCalendar(...args),
}));

jest.mock("../useSelectionState", () => ({
  useSelectionState: (...args: unknown[]) => mockUseSelectionState(...args),
}));

jest.mock("../useShiftSuggestions", () => ({
  useShiftSuggestions: (...args: unknown[]) => mockUseShiftSuggestions(...args),
}));

jest.mock("../useShiftMetrics", () => ({
  useShiftMetrics: (...args: unknown[]) => mockUseShiftMetrics(...args),
}));

jest.mock("@shared/lib/useAuthSessionSummary", () => ({
  useAuthSessionSummary: (...args: unknown[]) =>
    mockUseAuthSessionSummary(...args),
}));

jest.mock("@entities/calendar/api/calendarApi", () => ({
  useGetCompanyHolidayCalendarsQuery: () => ({ data: [] }),
  useGetEventCalendarsQuery: () => ({ data: [] }),
  useGetHolidayCalendarsQuery: () => ({ data: [] }),
}));

jest.mock("@/shared/api/amplify/graphqlClient", () => ({
  graphqlClient: {
    graphql: (...args: unknown[]) => mockGraphql(...args),
  },
}));

describe("useCollaborativePageState", () => {
  const mockUpdateShift = jest.fn();
  const mockBatchUpdateShifts = jest.fn();
  const mockStartEditingCell = jest.fn();
  const mockStopEditingCell = jest.fn();
  const mockUpdateUserActivity = jest.fn();
  const mockAddComment = jest.fn();

  const buildState = ({
    isOnline = true,
    connectionState = "connected",
    hasEditLock = true,
    shiftDataMap = new Map([
      ["staff-1", new Map([["01", { state: "work", isLocked: false }]])],
    ]),
  } = {}) => ({
    state: {
      shiftDataMap,
      activeUsers: [],
      editingCells: new Map(),
      pendingChanges: new Map(),
      selectedCells: new Set(),
      isLoading: false,
      isSyncing: false,
      lastSyncedAt: 0,
      lastAutoSyncedAt: 0,
      dataStatus: "idle",
      error: null,
      connectionState,
      isOnline,
      lastRemoteUpdate: null,
    },
    updateShift: mockUpdateShift,
    batchUpdateShifts: mockBatchUpdateShifts,
    isBatchUpdating: false,
    startEditingCell: mockStartEditingCell,
    stopEditingCell: mockStopEditingCell,
    isCellBeingEdited: jest.fn(() => false),
    hasEditLock: jest.fn(() => hasEditLock),
    getCellEditor: jest.fn(),
    forceReleaseCell: jest.fn(),
    getAllEditingCells: jest.fn(() => []),
    refreshLocks: jest.fn(),
    triggerSync: jest.fn(),
    clearSyncError: jest.fn(),
    updateUserActivity: mockUpdateUserActivity,
    retryPendingChanges: jest.fn(),
    getCellHistory: jest.fn(() => []),
    getAllCellHistory: jest.fn(() => []),
    addComment: mockAddComment,
    updateComment: jest.fn(),
    deleteComment: jest.fn(),
    getCommentsByCell: jest.fn(() => []),
    replyToComment: jest.fn(),
    deleteCommentReply: jest.fn(),
    getStaffCellHistory: jest.fn(() => []),
  });

  beforeEach(() => {
    mockUpdateShift.mockReset();
    mockBatchUpdateShifts.mockReset();
    mockStartEditingCell.mockReset();
    mockStopEditingCell.mockReset();
    mockUpdateUserActivity.mockReset();
    mockAddComment.mockReset();
    mockGraphql.mockReset();
    mockGraphql.mockReturnValue(new Promise(() => undefined));

    mockUseShiftCalendar.mockReturnValue({
      days: [],
      dateKeys: ["01", "02"],
      eventCalendar: [],
    });

    mockUseShiftSuggestions.mockReturnValue({
      violations: [],
      isAnalyzing: false,
      analyzeShifts: jest.fn(),
    });

    mockUseAuthSessionSummary.mockReturnValue({
      isCognitoUserRole: jest.fn(() => false),
    });

    mockUseShiftMetrics.mockReturnValue({
      calculateDailyCount: jest.fn(() => ({
        work: 0,
        fixedOff: 0,
        requestedOff: 0,
        plannedCapacity: 0,
      })),
      progress: {
        confirmedCount: 0,
        confirmedPercent: 0,
        needsAdjustmentCount: 0,
        adjustmentPercent: 0,
        emptyCount: 0,
      },
    });

    mockUseSelectionState.mockReturnValue({
      focusedCell: { staffId: "staff-1", date: "01" },
      registerCell: jest.fn(),
      focusCell: jest.fn(),
      navigate: jest.fn(),
      clearFocus: jest.fn(),
      selectedCells: [],
      selectionCount: 0,
      isCellSelected: jest.fn(() => false),
      selectCell: jest.fn(),
      toggleCell: jest.fn(),
      selectRange: jest.fn(),
      startDragSelect: jest.fn(),
      updateDragSelect: jest.fn(),
      endDragSelect: jest.fn(),
      selectAll: jest.fn(),
      clearSelection: jest.fn(),
      isDragging: false,
    });

    mockUseCollaborativeShift.mockReturnValue(buildState());
  });

  it("通信断中は単一セル更新をブロックする", async () => {
    mockUseCollaborativeShift.mockReturnValue(
      buildState({ isOnline: false, connectionState: "connected" }),
    );

    const { result } = renderHook(() => useCollaborativePageState("2026-02"));

    await act(async () => {
      result.current.handleChangeState("fixedOff");
      await Promise.resolve();
    });

    expect(mockUpdateShift).not.toHaveBeenCalled();
    expect(mockStopEditingCell).not.toHaveBeenCalled();
    expect(result.current.editLockError).toBe(
      "通信が切断されています。再接続後に編集を再開してください。",
    );
  });

  it("接続断状態ではロック取得をブロックする", async () => {
    mockUseCollaborativeShift.mockReturnValue(
      buildState({
        isOnline: true,
        connectionState: "disconnected",
        hasEditLock: false,
      }),
    );

    const { result } = renderHook(() => useCollaborativePageState("2026-02"));

    await act(async () => {
      result.current.handleAcquireEditLock();
    });

    expect(mockStartEditingCell).not.toHaveBeenCalled();
    expect(result.current.editLockError).toBe(
      "通信が切断されています。再接続後に編集を再開してください。",
    );
  });

  it("単一セルの状態変更成功後も編集ロックは維持する", async () => {
    mockUpdateShift.mockResolvedValue(undefined);

    const { result } = renderHook(() => useCollaborativePageState("2026-02"));

    await act(async () => {
      result.current.handleChangeState("fixedOff");
      await Promise.resolve();
    });

    expect(mockUpdateUserActivity).toHaveBeenCalled();
    expect(mockUpdateShift).toHaveBeenCalledWith({
      staffId: "staff-1",
      date: "01",
      newState: "fixedOff",
    });
    expect(mockStopEditingCell).not.toHaveBeenCalled();
  });

  it("一括状態変更成功後も更新対象セルの編集ロックは維持する", async () => {
    mockBatchUpdateShifts.mockResolvedValue(undefined);
    mockUseSelectionState.mockReturnValue({
      focusedCell: { staffId: "staff-1", date: "01" },
      registerCell: jest.fn(),
      focusCell: jest.fn(),
      navigate: jest.fn(),
      clearFocus: jest.fn(),
      selectedCells: [
        { staffId: "staff-1", date: "01" },
        { staffId: "staff-2", date: "02" },
      ],
      selectionCount: 2,
      isCellSelected: jest.fn(() => false),
      selectCell: jest.fn(),
      toggleCell: jest.fn(),
      selectRange: jest.fn(),
      startDragSelect: jest.fn(),
      updateDragSelect: jest.fn(),
      endDragSelect: jest.fn(),
      selectAll: jest.fn(),
      clearSelection: jest.fn(),
      isDragging: false,
    });
    mockUseCollaborativeShift.mockReturnValue(
      buildState({
        shiftDataMap: new Map([
          ["staff-1", new Map([["01", { state: "work", isLocked: false }]])],
          ["staff-2", new Map([["02", { state: "work", isLocked: false }]])],
        ]),
      }),
    );

    const { result } = renderHook(() => useCollaborativePageState("2026-02"));

    await act(async () => {
      result.current.handleChangeState("fixedOff");
      await Promise.resolve();
    });

    expect(mockBatchUpdateShifts).toHaveBeenCalledWith([
      { staffId: "staff-1", date: "01", newState: "fixedOff" },
      { staffId: "staff-2", date: "02", newState: "fixedOff" },
    ]);
    expect(mockStopEditingCell).not.toHaveBeenCalled();
  });

  it("状態変更失敗時は編集ロックを維持する", async () => {
    mockUpdateShift.mockRejectedValue(new Error("update failed"));
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    try {
      const { result } = renderHook(() => useCollaborativePageState("2026-02"));

      await act(async () => {
        result.current.handleChangeState("fixedOff");
        await Promise.resolve();
      });

      expect(mockUpdateShift).toHaveBeenCalled();
      expect(mockStopEditingCell).not.toHaveBeenCalled();
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });

  it("編集ロック未取得時は状態変更も解除も行わない", async () => {
    mockUseCollaborativeShift.mockReturnValue(
      buildState({ hasEditLock: false }),
    );

    const { result } = renderHook(() => useCollaborativePageState("2026-02"));

    await act(async () => {
      result.current.handleChangeState("fixedOff");
      await Promise.resolve();
    });

    expect(mockUpdateShift).not.toHaveBeenCalled();
    expect(mockStopEditingCell).not.toHaveBeenCalled();
    expect(result.current.editLockError).toBe(
      "編集前にロックを取得してください。",
    );
  });

  it("ロック取得APIで例外が発生した場合はエラーを表示する", async () => {
    mockStartEditingCell.mockRejectedValue(new Error("lock failed"));
    mockUseCollaborativeShift.mockReturnValue(
      buildState({ hasEditLock: false }),
    );
    mockUseSelectionState.mockReturnValue({
      focusedCell: { staffId: "staff-1", date: "01" },
      registerCell: jest.fn(),
      focusCell: jest.fn(),
      navigate: jest.fn(),
      clearFocus: jest.fn(),
      selectedCells: [{ staffId: "staff-1", date: "01" }],
      selectionCount: 1,
      isCellSelected: jest.fn(() => true),
      selectCell: jest.fn(),
      toggleCell: jest.fn(),
      selectRange: jest.fn(),
      startDragSelect: jest.fn(),
      updateDragSelect: jest.fn(),
      endDragSelect: jest.fn(),
      selectAll: jest.fn(),
      clearSelection: jest.fn(),
      isDragging: false,
    });

    const { result } = renderHook(() => useCollaborativePageState("2026-02"));

    await act(async () => {
      await result.current.handleAcquireEditLock();
    });

    expect(result.current.editLockError).toBe("lock failed");
  });

  it("管理者はロック取得失敗時に詳細メッセージを表示する", async () => {
    mockUseAuthSessionSummary.mockReturnValue({
      isCognitoUserRole: jest.fn((role) => role === "Admin"),
    });
    mockStartEditingCell.mockResolvedValue({ acquired: false });
    mockUseCollaborativeShift.mockReturnValue(
      buildState({ hasEditLock: false }),
    );
    mockUseSelectionState.mockReturnValue({
      focusedCell: { staffId: "staff-1", date: "01" },
      registerCell: jest.fn(),
      focusCell: jest.fn(),
      navigate: jest.fn(),
      clearFocus: jest.fn(),
      selectedCells: [{ staffId: "staff-1", date: "01" }],
      selectionCount: 1,
      isCellSelected: jest.fn(() => true),
      selectCell: jest.fn(),
      toggleCell: jest.fn(),
      selectRange: jest.fn(),
      startDragSelect: jest.fn(),
      updateDragSelect: jest.fn(),
      endDragSelect: jest.fn(),
      selectAll: jest.fn(),
      clearSelection: jest.fn(),
      isDragging: false,
    });

    const { result } = renderHook(() => useCollaborativePageState("2026-02"));

    await act(async () => {
      await result.current.handleAcquireEditLock();
    });

    expect(result.current.editLockError).toContain(
      "対象: スタッフID=staff-1, 日付=2026-02-01",
    );
    expect(result.current.editLockError).toContain(
      "競合ロック情報を取得できませんでした",
    );
  });

  it("競合情報なし失敗でも再取得で他ユーザーロックが見つかればロック状態を表示する", async () => {
    const refreshLocks = jest.fn().mockResolvedValue([
      {
        id: "2026-02#staff-1#01",
        targetMonth: "2026-02",
        staffId: "staff-1",
        date: "01",
        holderUserId: "other-user",
        holderUserName: "田中",
        acquiredAt: "2026-02-01T09:00:00.000Z",
        expiresAt: "2099-02-01T09:01:30.000Z",
        version: 1,
      },
    ]);

    mockStartEditingCell.mockResolvedValue({ acquired: false });
    mockUseCollaborativeShift.mockReturnValue({
      ...buildState({ hasEditLock: false }),
      refreshLocks,
    });
    mockUseSelectionState.mockReturnValue({
      focusedCell: { staffId: "staff-1", date: "01" },
      registerCell: jest.fn(),
      focusCell: jest.fn(),
      navigate: jest.fn(),
      clearFocus: jest.fn(),
      selectedCells: [{ staffId: "staff-1", date: "01" }],
      selectionCount: 1,
      isCellSelected: jest.fn(() => true),
      selectCell: jest.fn(),
      toggleCell: jest.fn(),
      selectRange: jest.fn(),
      startDragSelect: jest.fn(),
      updateDragSelect: jest.fn(),
      endDragSelect: jest.fn(),
      selectAll: jest.fn(),
      clearSelection: jest.fn(),
      isDragging: false,
    });

    const { result } = renderHook(() => useCollaborativePageState("2026-02"));

    await act(async () => {
      await result.current.handleAcquireEditLock();
    });

    expect(result.current.editLockError).toBe(
      "田中 が 01 日セルを編集中です。",
    );
  });

  it("同期実行時にロックエラーをクリアする", async () => {
    const mockTriggerSync = jest.fn().mockResolvedValue(undefined);
    mockStartEditingCell.mockResolvedValue({ acquired: false });
    mockUseCollaborativeShift.mockReturnValue({
      ...buildState({ hasEditLock: false }),
      triggerSync: mockTriggerSync,
    });
    mockUseSelectionState.mockReturnValue({
      focusedCell: { staffId: "staff-1", date: "01" },
      registerCell: jest.fn(),
      focusCell: jest.fn(),
      navigate: jest.fn(),
      clearFocus: jest.fn(),
      selectedCells: [{ staffId: "staff-1", date: "01" }],
      selectionCount: 1,
      isCellSelected: jest.fn(() => true),
      selectCell: jest.fn(),
      toggleCell: jest.fn(),
      selectRange: jest.fn(),
      startDragSelect: jest.fn(),
      updateDragSelect: jest.fn(),
      endDragSelect: jest.fn(),
      selectAll: jest.fn(),
      clearSelection: jest.fn(),
      isDragging: false,
    });

    const { result } = renderHook(() => useCollaborativePageState("2026-02"));

    await act(async () => {
      await result.current.handleAcquireEditLock();
    });

    expect(result.current.editLockError).toBe(
      "編集ロックの取得に失敗しました。最新状態を確認してから再度お試しください。",
    );

    await act(async () => {
      await result.current.handleSync();
    });

    expect(mockTriggerSync).toHaveBeenCalledTimes(1);
    expect(result.current.editLockError).toBeNull();
  });

  it("選択セルがなくなったらロックエラーをクリアする", async () => {
    mockStartEditingCell.mockResolvedValue({ acquired: false });
    mockUseCollaborativeShift.mockReturnValue(
      buildState({ hasEditLock: false }),
    );
    mockUseSelectionState.mockReturnValue({
      focusedCell: { staffId: "staff-1", date: "01" },
      registerCell: jest.fn(),
      focusCell: jest.fn(),
      navigate: jest.fn(),
      clearFocus: jest.fn(),
      selectedCells: [{ staffId: "staff-1", date: "01" }],
      selectionCount: 1,
      isCellSelected: jest.fn(() => true),
      selectCell: jest.fn(),
      toggleCell: jest.fn(),
      selectRange: jest.fn(),
      startDragSelect: jest.fn(),
      updateDragSelect: jest.fn(),
      endDragSelect: jest.fn(),
      selectAll: jest.fn(),
      clearSelection: jest.fn(),
      isDragging: false,
    });

    const { result, rerender } = renderHook(() =>
      useCollaborativePageState("2026-02"),
    );

    await act(async () => {
      await result.current.handleAcquireEditLock();
    });

    expect(result.current.editLockError).toBe(
      "編集ロックの取得に失敗しました。最新状態を確認してから再度お試しください。",
    );

    mockUseSelectionState.mockReturnValue({
      focusedCell: null,
      registerCell: jest.fn(),
      focusCell: jest.fn(),
      navigate: jest.fn(),
      clearFocus: jest.fn(),
      selectedCells: [],
      selectionCount: 0,
      isCellSelected: jest.fn(() => false),
      selectCell: jest.fn(),
      toggleCell: jest.fn(),
      selectRange: jest.fn(),
      startDragSelect: jest.fn(),
      updateDragSelect: jest.fn(),
      endDragSelect: jest.fn(),
      selectAll: jest.fn(),
      clearSelection: jest.fn(),
      isDragging: false,
    });

    act(() => {
      rerender();
    });

    expect(result.current.editLockError).toBeNull();
  });

  it("日付移動時は自分が取得したロックだけ自動解除する", async () => {
    const hasEditLockMock = jest.fn(
      (staffId: string, date: string) => staffId === "staff-1" && date === "01",
    );

    mockUseCollaborativeShift.mockReturnValue({
      ...buildState({ hasEditLock: false }),
      hasEditLock: hasEditLockMock,
    });
    mockUseSelectionState.mockReturnValue({
      focusedCell: { staffId: "staff-1", date: "01" },
      registerCell: jest.fn(),
      focusCell: jest.fn(),
      navigate: jest.fn(),
      clearFocus: jest.fn(),
      selectedCells: [
        { staffId: "staff-1", date: "01" },
        { staffId: "staff-2", date: "01" },
      ],
      selectionCount: 2,
      isCellSelected: jest.fn(() => false),
      selectCell: jest.fn(),
      toggleCell: jest.fn(),
      selectRange: jest.fn(),
      startDragSelect: jest.fn(),
      updateDragSelect: jest.fn(),
      endDragSelect: jest.fn(),
      selectAll: jest.fn(),
      clearSelection: jest.fn(),
      isDragging: false,
    });

    const { result } = renderHook(() => useCollaborativePageState("2026-02"));

    await act(async () => {
      const clickEvent = {
        shiftKey: false,
        ctrlKey: false,
        metaKey: false,
      } as unknown as Parameters<typeof result.current.handleCellClick>[2];
      result.current.handleCellClick("staff-3", "02", clickEvent);
      await Promise.resolve();
    });

    expect(mockStopEditingCell).toHaveBeenCalledTimes(1);
    expect(mockStopEditingCell).toHaveBeenCalledWith("staff-1", "01");
    expect(mockAddComment).toHaveBeenCalledWith(
      "staff-1#01",
      `${CHAT_SYSTEM_MESSAGE_PREFIX}不明ユーザーが編集ロックを解除しました`,
      [],
    );
  });

  it("同じ日付の再選択ではロックを自動解除しない", async () => {
    const hasEditLockMock = jest.fn(() => true);

    mockUseCollaborativeShift.mockReturnValue({
      ...buildState({ hasEditLock: false }),
      hasEditLock: hasEditLockMock,
    });
    mockUseSelectionState.mockReturnValue({
      focusedCell: { staffId: "staff-1", date: "01" },
      registerCell: jest.fn(),
      focusCell: jest.fn(),
      navigate: jest.fn(),
      clearFocus: jest.fn(),
      selectedCells: [{ staffId: "staff-1", date: "01" }],
      selectionCount: 1,
      isCellSelected: jest.fn(() => true),
      selectCell: jest.fn(),
      toggleCell: jest.fn(),
      selectRange: jest.fn(),
      startDragSelect: jest.fn(),
      updateDragSelect: jest.fn(),
      endDragSelect: jest.fn(),
      selectAll: jest.fn(),
      clearSelection: jest.fn(),
      isDragging: false,
    });

    const { result } = renderHook(() => useCollaborativePageState("2026-02"));

    await act(async () => {
      const clickEvent = {
        shiftKey: false,
        ctrlKey: false,
        metaKey: false,
      } as unknown as Parameters<typeof result.current.handleCellClick>[2];
      result.current.handleCellClick("staff-1", "01", clickEvent);
      await Promise.resolve();
    });

    expect(mockStopEditingCell).not.toHaveBeenCalled();
  });
});
