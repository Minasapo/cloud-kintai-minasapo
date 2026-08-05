import { act, renderHook } from "@testing-library/react";

import fetchAdminOperationLogs from "../fetchOperationLogsAdmin";
import useAdminOperationLogs from "../useAdminOperationLogs";

jest.mock("../fetchOperationLogsAdmin", () => jest.fn());

const mockFetchLogs = fetchAdminOperationLogs as jest.Mock;

const makeLog = (overrides: Record<string, unknown> = {}) => ({
  __typename: "OperationLog" as const,
  id: "log-1",
  createdAt: "2024-01-15T10:00:00.000Z",
  updatedAt: "2024-01-15T10:00:00.000Z",
  timestamp: "2024-01-15T10:00:00.000Z",
  action: "clock_in",
  staffId: "staff-1",
  resourceKey: "attendance#att-1",
  ...overrides,
});

describe("useAdminOperationLogs", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("loadInitial", () => {
    it("loadInitial 成功時に logs を設定し loading を解除すること", async () => {
      mockFetchLogs.mockResolvedValue({
        items: [makeLog()],
        nextToken: null,
        excludedInvalidRecords: false,
        excludedInvalidRecordCount: 0,
      });

      const { result } = renderHook(() => useAdminOperationLogs());
      await act(async () => {
        await result.current.loadInitial();
      });

      expect(result.current.logs).toHaveLength(1);
      expect(result.current.logs[0].id).toBe("log-1");
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("nextToken が返された場合に nextToken を設定すること", async () => {
      mockFetchLogs.mockResolvedValue({
        items: [makeLog()],
        nextToken: "token-123",
        excludedInvalidRecords: false,
        excludedInvalidRecordCount: 0,
      });

      const { result } = renderHook(() => useAdminOperationLogs());
      await act(async () => {
        await result.current.loadInitial();
      });

      expect(result.current.nextToken).toBe("token-123");
    });

    it("timestamp の新しい順に logs をソートすること", async () => {
      const older = makeLog({
        id: "old",
        timestamp: "2024-01-10T08:00:00.000Z",
      });
      const newer = makeLog({
        id: "new",
        timestamp: "2024-01-15T10:00:00.000Z",
      });
      mockFetchLogs.mockResolvedValue({
        items: [older, newer],
        nextToken: null,
      });

      const { result } = renderHook(() => useAdminOperationLogs());
      await act(async () => {
        await result.current.loadInitial();
      });

      expect(result.current.logs[0].id).toBe("new");
      expect(result.current.logs[1].id).toBe("old");
    });

    it("timestamp が null の場合は createdAt を使ってソートすること", async () => {
      const older = makeLog({
        id: "old",
        timestamp: null,
        createdAt: "2024-01-10T08:00:00.000Z",
      });
      const newer = makeLog({
        id: "new",
        timestamp: null,
        createdAt: "2024-01-15T10:00:00.000Z",
      });
      mockFetchLogs.mockResolvedValue({
        items: [older, newer],
        nextToken: null,
      });

      const { result } = renderHook(() => useAdminOperationLogs());
      await act(async () => {
        await result.current.loadInitial();
      });

      expect(result.current.logs[0].id).toBe("new");
    });

    it("レスポンスの items を返すこと", async () => {
      const log = makeLog();
      mockFetchLogs.mockResolvedValue({
        items: [log],
        nextToken: null,
      });

      const { result } = renderHook(() => useAdminOperationLogs());
      let returned: unknown;
      await act(async () => {
        returned = await result.current.loadInitial();
      });

      expect(returned).toHaveLength(1);
    });

    it("レスポンスから excludedInvalidRecords と件数を設定すること", async () => {
      mockFetchLogs.mockResolvedValue({
        items: [makeLog()],
        nextToken: null,
        excludedInvalidRecords: true,
        excludedInvalidRecordCount: 3,
      });

      const { result } = renderHook(() => useAdminOperationLogs());
      await act(async () => {
        await result.current.loadInitial();
      });

      expect(result.current.excludedInvalidRecords).toBe(true);
      expect(result.current.excludedInvalidRecordCount).toBe(3);
    });

    it("fetchOperationLogs に filter と initialLimit を渡すこと", async () => {
      mockFetchLogs.mockResolvedValue({
        items: [],
        nextToken: null,
      });

      const filter = { staffId: { eq: "staff-1" } };
      const { result } = renderHook(() => useAdminOperationLogs(50, filter));
      await act(async () => {
        await result.current.loadInitial();
      });

      expect(fetchAdminOperationLogs).toHaveBeenCalledWith(null, 50, filter);
    });

    it("失敗時に error 状態を設定し再 throw すること", async () => {
      const error = new Error("Fetch failed");
      mockFetchLogs.mockRejectedValue(error);

      const { result } = renderHook(() => useAdminOperationLogs());
      await act(async () => {
        await result.current.loadInitial().catch(() => {
          /* expected rejection */
        });
      });

      expect(result.current.error?.message).toBe("Fetch failed");
      expect(result.current.loading).toBe(false);
    });
  });

  describe("loadMore", () => {
    it("nextToken が null の場合は空配列を返して取得をスキップすること", async () => {
      const { result } = renderHook(() => useAdminOperationLogs());
      let returned: unknown;
      await act(async () => {
        returned = await result.current.loadMore();
      });

      expect(returned).toEqual([]);
      expect(fetchAdminOperationLogs).not.toHaveBeenCalled();
    });

    it("新規 logs を追加し結合結果を新しい順にソートすること", async () => {
      const initial = makeLog({
        id: "log-1",
        timestamp: "2024-01-10T10:00:00.000Z",
      });
      const additional = makeLog({
        id: "log-2",
        timestamp: "2024-01-15T10:00:00.000Z",
      });
      mockFetchLogs
        .mockResolvedValueOnce({
          items: [initial],
          nextToken: "token-1",
        })
        .mockResolvedValueOnce({
          items: [additional],
          nextToken: null,
        });

      const { result } = renderHook(() => useAdminOperationLogs());
      await act(async () => {
        await result.current.loadInitial();
      });
      await act(async () => {
        await result.current.loadMore();
      });

      expect(result.current.logs).toHaveLength(2);
      expect(result.current.logs[0].id).toBe("log-2");
      expect(result.current.nextToken).toBeNull();
    });

    it("レスポンスの nextToken が null の場合に nextToken を null に更新すること", async () => {
      mockFetchLogs
        .mockResolvedValueOnce({
          items: [makeLog()],
          nextToken: "token-1",
        })
        .mockResolvedValueOnce({
          items: [],
          nextToken: null,
        });

      const { result } = renderHook(() => useAdminOperationLogs());
      await act(async () => {
        await result.current.loadInitial();
      });
      await act(async () => {
        await result.current.loadMore();
      });

      expect(result.current.nextToken).toBeNull();
    });

    it("loadMore 複数回で excludedInvalidRecordCount を累積すること", async () => {
      mockFetchLogs
        .mockResolvedValueOnce({
          items: [makeLog({ id: "log-1" })],
          nextToken: "token-1",
          excludedInvalidRecords: true,
          excludedInvalidRecordCount: 1,
        })
        .mockResolvedValueOnce({
          items: [],
          nextToken: null,
          excludedInvalidRecords: true,
          excludedInvalidRecordCount: 2,
        });

      const { result } = renderHook(() => useAdminOperationLogs());
      await act(async () => {
        await result.current.loadInitial();
      });
      await act(async () => {
        await result.current.loadMore();
      });

      expect(result.current.excludedInvalidRecordCount).toBe(3);
    });

    it("loadMore 失敗時に error 状態を設定し再 throw すること", async () => {
      mockFetchLogs
        .mockResolvedValueOnce({
          items: [makeLog()],
          nextToken: "token-1",
        })
        .mockRejectedValueOnce(new Error("Load more failed"));

      const { result } = renderHook(() => useAdminOperationLogs());
      await act(async () => {
        await result.current.loadInitial();
      });
      await act(async () => {
        await result.current.loadMore().catch(() => {
          /* expected rejection */
        });
      });

      expect(result.current.error?.message).toBe("Load more failed");
      expect(result.current.loading).toBe(false);
    });
  });

  describe("error conversion", () => {
    it("文字列エラーを Error に変換すること", async () => {
      mockFetchLogs.mockRejectedValue("string error");

      const { result } = renderHook(() => useAdminOperationLogs());
      await act(async () => {
        await result.current.loadInitial().catch(() => {
          /* expected */
        });
      });

      expect(result.current.error?.message).toBe("string error");
    });

    it("message プロパティを持つオブジェクトを Error に変換すること", async () => {
      mockFetchLogs.mockRejectedValue({ message: "object error" });

      const { result } = renderHook(() => useAdminOperationLogs());
      await act(async () => {
        await result.current.loadInitial().catch(() => {
          /* expected */
        });
      });

      expect(result.current.error?.message).toBe("object error");
    });

    it("errors 配列を持つオブジェクトは先頭要素を使って Error に変換すること", async () => {
      mockFetchLogs.mockRejectedValue({
        errors: [{ message: "errors array msg" }],
      });

      const { result } = renderHook(() => useAdminOperationLogs());
      await act(async () => {
        await result.current.loadInitial().catch(() => {
          /* expected */
        });
      });

      expect(result.current.error?.message).toBe("errors array msg");
    });

    it("認識できないエラー形式ではフォールバックメッセージを使うこと", async () => {
      mockFetchLogs.mockRejectedValue({ weird: "stuff" });

      const { result } = renderHook(() => useAdminOperationLogs());
      await act(async () => {
        await result.current.loadInitial().catch(() => {
          /* expected */
        });
      });

      expect(result.current.error?.message).toBe("ログの取得に失敗しました。");
    });
  });
});
