import { renderHook } from "@testing-library/react";
import React from "react";

import { useCollaborativeShift } from "../../context/CollaborativeShiftContext";
import { CollaborativeShiftProvider } from "../CollaborativeShiftProvider";

// Mock the data hook
jest.mock("../../hooks/useCollaborativeShiftData", () => ({
  useCollaborativeShiftData: jest.fn(() => ({
    shiftDataMap: new Map(),
    pendingChanges: new Map(),
    isLoading: false,
    isBatchUpdating: false,
    error: null,
    connectionState: "connected" as const,
    fetchShifts: jest.fn(),
    updateShift: jest.fn(),
    batchUpdateShifts: jest.fn(),
    retryPendingChanges: jest.fn(),
    getShiftRequest: jest.fn(),
    getAllShiftRequests: jest.fn(() => []),
  })),
}));

// Mock the sync hook
jest.mock("../../hooks/useShiftSync", () => ({
  useShiftSync: jest.fn(() => ({
    isSyncing: false,
    syncError: null,
    triggerSync: jest.fn(),
    lastAutoSyncedAt: null,
    lastSyncedAt: null,
    dataStatus: "idle" as const,
    notifyAutoSyncReceived: jest.fn(),
    notifySaveStarted: jest.fn(),
    notifySaveCompleted: jest.fn(),
    notifySaveFailed: jest.fn(),
    clearSyncError: jest.fn(),
  })),
}));

// Mock other hooks
jest.mock("../../hooks/useOnlineStatus", () => ({
  useOnlineStatus: jest.fn(() => true),
}));

jest.mock("../../hooks/useShiftComments", () => ({
  useShiftComments: jest.fn(() => ({
    addComment: jest.fn(),
    updateComment: jest.fn(),
    deleteComment: jest.fn(),
    getCommentsByCell: jest.fn(() => []),
    replyToComment: jest.fn(),
    deleteCommentReply: jest.fn(),
    loadCommentsFromShiftRequests: jest.fn(),
    mergeRemoteComments: jest.fn(),
    getCommentsInputForStaff: jest.fn(() => []),
  })),
}));

jest.mock("../../hooks/useCellChangeHistory", () => ({
  useCellChangeHistory: jest.fn(() => ({
    recordCellChange: jest.fn(),
    recordBatchCellChanges: jest.fn(),
    recordRemoteChange: jest.fn(),
    seedHistory: jest.fn(),
    mergeHistoryRecords: jest.fn(),
    getCellHistory: jest.fn(() => []),
    getAllCellHistory: jest.fn(() => []),
    getStaffCellHistory: jest.fn(() => []),
    clearCellHistory: jest.fn(),
  })),
}));

jest.mock("../../hooks/useShiftPresence", () => ({
  useShiftPresence: jest.fn(() => ({
    activeUsers: [],
    updateActivity: jest.fn(),
  })),
}));

jest.mock("../../hooks/useShiftEditLocks", () => ({
  useShiftEditLocks: jest.fn(() => ({
    editingCells: new Map(),
    acquireEditLock: jest.fn(),
    releaseEditLock: jest.fn(),
    isCellBeingEdited: jest.fn(() => false),
    hasEditLock: jest.fn(() => false),
    getCellEditor: jest.fn(),
    forceReleaseLock: jest.fn(),
    getAllEditingCells: jest.fn(() => []),
    refreshLocks: jest.fn(),
  })),
}));

describe("CollaborativeShiftProvider Integration", () => {
  const defaultProps = {
    staffIds: ["staff1", "staff2"],
    targetMonth: "2026-05",
    currentUserId: "user1",
    currentUserName: "Test User",
    shiftRequestId: "req1",
  };

  it("renders without crashing", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CollaborativeShiftProvider {...defaultProps}>
        {children}
      </CollaborativeShiftProvider>
    );

    const { result } = renderHook(() => useCollaborativeShift(), {
      wrapper,
    });

    expect(result.current).toBeDefined();
    expect(result.current.state).toBeDefined();
  });

  it("provides correct initial state", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CollaborativeShiftProvider {...defaultProps}>
        {children}
      </CollaborativeShiftProvider>
    );

    const { result } = renderHook(() => useCollaborativeShift(), {
      wrapper,
    });

    expect(result.current.state.isLoading).toBe(false);
    expect(result.current.state.isSyncing).toBe(false);
    expect(result.current.state.connectionState).toBe("connected");
    expect(result.current.state.isOnline).toBe(true);
  });

  it("provides shift operation handlers", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CollaborativeShiftProvider {...defaultProps}>
        {children}
      </CollaborativeShiftProvider>
    );

    const { result } = renderHook(() => useCollaborativeShift(), {
      wrapper,
    });

    expect(typeof result.current.updateShift).toBe("function");
    expect(typeof result.current.batchUpdateShifts).toBe("function");
    expect(typeof result.current.toggleCellSelection).toBe("function");
    expect(typeof result.current.startEditingCell).toBe("function");
    expect(typeof result.current.stopEditingCell).toBe("function");
    expect(typeof result.current.triggerSync).toBe("function");
  });

  it("provides comment operation handlers", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CollaborativeShiftProvider {...defaultProps}>
        {children}
      </CollaborativeShiftProvider>
    );

    const { result } = renderHook(() => useCollaborativeShift(), {
      wrapper,
    });

    expect(typeof result.current.addComment).toBe("function");
    expect(typeof result.current.updateComment).toBe("function");
    expect(typeof result.current.deleteComment).toBe("function");
    expect(typeof result.current.replyToComment).toBe("function");
    expect(typeof result.current.getCommentsByCell).toBe("function");
  });

  it("provides edit lock handlers", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CollaborativeShiftProvider {...defaultProps}>
        {children}
      </CollaborativeShiftProvider>
    );

    const { result } = renderHook(() => useCollaborativeShift(), {
      wrapper,
    });

    expect(typeof result.current.isCellBeingEdited).toBe("function");
    expect(typeof result.current.hasEditLock).toBe("function");
    expect(typeof result.current.getCellEditor).toBe("function");
  });

  it("provides history retrieval handlers", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CollaborativeShiftProvider {...defaultProps}>
        {children}
      </CollaborativeShiftProvider>
    );

    const { result } = renderHook(() => useCollaborativeShift(), {
      wrapper,
    });

    expect(typeof result.current.getCellHistory).toBe("function");
    expect(typeof result.current.getAllCellHistory).toBe("function");
    expect(typeof result.current.getStaffCellHistory).toBe("function");
  });

  it("provides sync control handlers", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CollaborativeShiftProvider {...defaultProps}>
        {children}
      </CollaborativeShiftProvider>
    );

    const { result } = renderHook(() => useCollaborativeShift(), {
      wrapper,
    });

    expect(typeof result.current.clearSyncError).toBe("function");
    expect(typeof result.current.retryPendingChanges).toBe("function");
  });

  it("maintains batch update state", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CollaborativeShiftProvider {...defaultProps}>
        {children}
      </CollaborativeShiftProvider>
    );

    const { result } = renderHook(() => useCollaborativeShift(), {
      wrapper,
    });

    expect(typeof result.current.isBatchUpdating).toBe("boolean");
  });
});
