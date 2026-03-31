import { act, renderHook } from "@testing-library/react";

import { useCollaborativePageState } from "../useCollaborativePageState";

const mockUseCollaborativeShift = jest.fn();
const mockUseShiftCalendar = jest.fn();
const mockUseSelectionState = jest.fn();
const mockUseClipboardOps = jest.fn();
const mockUseShiftSuggestions = jest.fn();
const mockUseShiftMetrics = jest.fn();
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

jest.mock("../useClipboardOps", () => ({
  useClipboardOps: (...args: unknown[]) => mockUseClipboardOps(...args),
}));

jest.mock("../useShiftSuggestions", () => ({
  useShiftSuggestions: (...args: unknown[]) => mockUseShiftSuggestions(...args),
}));

jest.mock("../useShiftMetrics", () => ({
  useShiftMetrics: (...args: unknown[]) => mockUseShiftMetrics(...args),
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

  beforeEach(() => {
    mockUpdateShift.mockReset();
    mockBatchUpdateShifts.mockReset();
    mockStartEditingCell.mockReset();
    mockGraphql.mockReset();
    mockGraphql.mockReturnValue(new Promise(() => undefined));

    mockUseShiftCalendar.mockReturnValue({
      days: [],
      dateKeys: ["01"],
      eventCalendar: [],
    });

    mockUseClipboardOps.mockReturnValue({
      copy: jest.fn(),
      paste: jest.fn(() => []),
      hasClipboard: false,
      clearClipboard: jest.fn(),
    });

    mockUseShiftSuggestions.mockReturnValue({
      violations: [],
      isAnalyzing: false,
      analyzeShifts: jest.fn(),
    });

    mockUseShiftMetrics.mockReturnValue({
      calculateDailyCount: jest.fn(() => 0),
      progress: [],
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
  });

  it("通信断中は単一セル更新をブロックする", () => {
    mockUseCollaborativeShift.mockReturnValue({
      state: {
        shiftDataMap: new Map([
          ["staff-1", new Map([["01", { state: "work", isLocked: false }]])],
        ]),
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
        connectionState: "connected",
        isOnline: false,
        lastRemoteUpdate: null,
      },
      updateShift: mockUpdateShift,
      batchUpdateShifts: mockBatchUpdateShifts,
      isBatchUpdating: false,
      startEditingCell: mockStartEditingCell,
      stopEditingCell: jest.fn(),
      isCellBeingEdited: jest.fn(() => false),
      hasEditLock: jest.fn(() => true),
      getCellEditor: jest.fn(),
      forceReleaseCell: jest.fn(),
      getAllEditingCells: jest.fn(() => []),
      refreshLocks: jest.fn(),
      triggerSync: jest.fn(),
      clearSyncError: jest.fn(),
      updateUserActivity: jest.fn(),
      retryPendingChanges: jest.fn(),
      canUndo: false,
      canRedo: false,
      undo: jest.fn(),
      redo: jest.fn(),
      getLastUndo: jest.fn(),
      getLastRedo: jest.fn(),
      undoHistory: [],
      redoHistory: [],
      showHistory: false,
      toggleHistory: jest.fn(),
      getCellHistory: jest.fn(() => []),
      getAllCellHistory: jest.fn(() => []),
      addComment: jest.fn(),
      updateComment: jest.fn(),
      deleteComment: jest.fn(),
      getCommentsByCell: jest.fn(() => []),
      replyToComment: jest.fn(),
      deleteCommentReply: jest.fn(),
    });

    const { result } = renderHook(() => useCollaborativePageState("2026-02"));

    act(() => {
      result.current.handleChangeState("fixedOff");
    });

    expect(mockUpdateShift).not.toHaveBeenCalled();
    expect(result.current.editLockError).toBe(
      "通信が切断されています。再接続後に編集を再開してください。",
    );
  });

  it("接続断状態ではロック取得をブロックする", async () => {
    mockUseCollaborativeShift.mockReturnValue({
      state: {
        shiftDataMap: new Map([
          ["staff-1", new Map([["01", { state: "work", isLocked: false }]])],
        ]),
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
        connectionState: "disconnected",
        isOnline: true,
        lastRemoteUpdate: null,
      },
      updateShift: mockUpdateShift,
      batchUpdateShifts: mockBatchUpdateShifts,
      isBatchUpdating: false,
      startEditingCell: mockStartEditingCell,
      stopEditingCell: jest.fn(),
      isCellBeingEdited: jest.fn(() => false),
      hasEditLock: jest.fn(() => false),
      getCellEditor: jest.fn(),
      forceReleaseCell: jest.fn(),
      getAllEditingCells: jest.fn(() => []),
      refreshLocks: jest.fn(),
      triggerSync: jest.fn(),
      clearSyncError: jest.fn(),
      updateUserActivity: jest.fn(),
      retryPendingChanges: jest.fn(),
      canUndo: false,
      canRedo: false,
      undo: jest.fn(),
      redo: jest.fn(),
      getLastUndo: jest.fn(),
      getLastRedo: jest.fn(),
      undoHistory: [],
      redoHistory: [],
      showHistory: false,
      toggleHistory: jest.fn(),
      getCellHistory: jest.fn(() => []),
      getAllCellHistory: jest.fn(() => []),
      addComment: jest.fn(),
      updateComment: jest.fn(),
      deleteComment: jest.fn(),
      getCommentsByCell: jest.fn(() => []),
      replyToComment: jest.fn(),
      deleteCommentReply: jest.fn(),
    });

    const { result } = renderHook(() => useCollaborativePageState("2026-02"));

    await act(async () => {
      result.current.handleAcquireEditLock();
    });

    expect(mockStartEditingCell).not.toHaveBeenCalled();
    expect(result.current.editLockError).toBe(
      "通信が切断されています。再接続後に編集を再開してください。",
    );
  });
});
