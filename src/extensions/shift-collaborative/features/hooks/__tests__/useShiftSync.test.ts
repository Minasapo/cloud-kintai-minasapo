import { act, renderHook, waitFor } from "@testing-library/react";

import { useShiftSync } from "../useShiftSync";

describe("useShiftSync", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("手動同期を実行できる", async () => {
    const onManualSync = jest.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() => useShiftSync({ onManualSync }));

    await act(async () => {
      await result.current.triggerSync();
    });

    expect(onManualSync).toHaveBeenCalledTimes(1);
    expect(result.current.lastSyncedAt).toBeGreaterThan(0);
    expect(result.current.syncError).toBeNull();
    expect(result.current.dataStatus).toBe("synced");
  });

  it("手動同期失敗時にsyncErrorとerrorステータスを設定する", async () => {
    const onManualSync = jest
      .fn()
      .mockRejectedValue(new Error("network failed"));

    const { result } = renderHook(() => useShiftSync({ onManualSync }));

    await act(async () => {
      await result.current.triggerSync();
    });

    await waitFor(() => {
      expect(result.current.syncError).toBe("network failed");
    });
    expect(result.current.isSyncing).toBe(false);
    expect(result.current.dataStatus).toBe("error");
  });

  it("二重実行を防止する", async () => {
    let resolveSync: () => void;
    const onManualSync = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSync = resolve;
        }),
    );

    const { result } = renderHook(() => useShiftSync({ onManualSync }));

    // 1回目の同期開始
    let syncPromise: Promise<void>;
    act(() => {
      syncPromise = result.current.triggerSync();
    });

    expect(result.current.isSyncing).toBe(true);

    // 2回目はスキップ
    await act(async () => {
      await result.current.triggerSync();
    });

    expect(onManualSync).toHaveBeenCalledTimes(1);

    // 1回目を完了
    await act(async () => {
      resolveSync!();
      await syncPromise!;
    });

    expect(result.current.isSyncing).toBe(false);
  });

  it("notifyAutoSyncReceivedでlastAutoSyncedAtが更新される", () => {
    const onManualSync = jest.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() => useShiftSync({ onManualSync }));

    expect(result.current.lastAutoSyncedAt).toBe(0);

    act(() => {
      result.current.notifyAutoSyncReceived();
    });

    expect(result.current.lastAutoSyncedAt).toBeGreaterThan(0);
    expect(result.current.dataStatus).toBe("synced");
  });

  it("notifySaveStarted/Completedで保存ステータスが遷移する", () => {
    const onManualSync = jest.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() => useShiftSync({ onManualSync }));

    act(() => {
      result.current.notifySaveStarted();
    });

    expect(result.current.dataStatus).toBe("saving");

    act(() => {
      result.current.notifySaveCompleted();
    });

    expect(result.current.dataStatus).toBe("saved");
  });

  it("notifySaveFailedでエラーステータスになる", () => {
    const onManualSync = jest.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() => useShiftSync({ onManualSync }));

    act(() => {
      result.current.notifySaveFailed("保存に失敗しました");
    });

    expect(result.current.dataStatus).toBe("error");
    expect(result.current.syncError).toBe("保存に失敗しました");
  });

  it("clearSyncErrorでエラーをクリアする", () => {
    const onManualSync = jest.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() => useShiftSync({ onManualSync }));

    act(() => {
      result.current.notifySaveFailed("テストエラー");
    });

    expect(result.current.dataStatus).toBe("error");

    act(() => {
      result.current.clearSyncError();
    });

    expect(result.current.dataStatus).toBe("idle");
    expect(result.current.syncError).toBeNull();
  });

  it("saving中にnotifyAutoSyncReceivedしてもsavingを維持する", () => {
    const onManualSync = jest.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() => useShiftSync({ onManualSync }));

    act(() => {
      result.current.notifySaveStarted();
    });

    expect(result.current.dataStatus).toBe("saving");

    act(() => {
      result.current.notifyAutoSyncReceived();
    });

    expect(result.current.dataStatus).toBe("saving");
    expect(result.current.lastAutoSyncedAt).toBeGreaterThan(0);
  });

  it("saved/syncedステータスが3秒後にidleへ戻る", () => {
    const onManualSync = jest.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() => useShiftSync({ onManualSync }));

    act(() => {
      result.current.notifySaveCompleted();
    });

    expect(result.current.dataStatus).toBe("saved");

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(result.current.dataStatus).toBe("idle");
  });

  it("lastSyncedAtはautoとmanualの最大値を返す", async () => {
    const onManualSync = jest.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() => useShiftSync({ onManualSync }));

    act(() => {
      result.current.notifyAutoSyncReceived();
    });

    const autoTime = result.current.lastAutoSyncedAt;

    await act(async () => {
      jest.advanceTimersByTime(100);
      await result.current.triggerSync();
    });

    expect(result.current.lastSyncedAt).toBeGreaterThanOrEqual(autoTime);
  });
});
