import { act, renderHook, waitFor } from "@testing-library/react";

import { useShiftSync } from "../useShiftSync";

describe("useShiftSync", () => {
  it("自動同期が無効でも手動同期を実行できる", async () => {
    const onSync = jest.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useShiftSync({
        enabled: false,
        onSync,
      }),
    );

    await act(async () => {
      await result.current.triggerSync();
    });

    expect(onSync).toHaveBeenCalledTimes(1);
    expect(result.current.lastSyncedAt).toBeGreaterThan(0);
    expect(result.current.syncError).toBeNull();
  });

  it("手動同期失敗時にsyncErrorを設定する", async () => {
    const onSync = jest.fn().mockRejectedValue(new Error("network failed"));

    const { result } = renderHook(() =>
      useShiftSync({
        enabled: false,
        onSync,
      }),
    );

    await act(async () => {
      await result.current.triggerSync();
    });

    await waitFor(() => {
      expect(result.current.syncError).toBe("network failed");
    });
    expect(result.current.isSyncing).toBe(false);
  });
});
