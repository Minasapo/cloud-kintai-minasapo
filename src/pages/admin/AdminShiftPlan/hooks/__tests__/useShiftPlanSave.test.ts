import { useAppDispatchV2 } from "@app/hooks";
import { graphqlClient } from "@shared/api/amplify/graphqlClient";
import { pushNotification } from "@shared/lib/store/notificationSlice";
import { act, renderHook } from "@testing-library/react";

import { createDefaultRows } from "../../shiftPlanUtils";
import { useShiftPlanSave } from "../useShiftPlanSave";

jest.mock("@app/hooks", () => ({
  useAppDispatchV2: jest.fn(),
}));

jest.mock("@shared/api/amplify/graphqlClient", () => ({
  graphqlClient: { graphql: jest.fn() },
}));

jest.mock("@shared/api/graphql/documents/mutations", () => ({
  createShiftPlanYear: "createShiftPlanYear",
  updateShiftPlanYear: "updateShiftPlanYear",
}));

jest.mock("@shared/api/graphql/concurrency", () => ({
  buildVersionOrUpdatedAtCondition: jest.fn(() => ({ version: { eq: 1 } })),
  getNextVersion: jest.fn((v: number | null | undefined) => (v ?? 0) + 1),
}));

jest.mock("@shared/lib/store/notificationSlice", () => ({
  pushNotification: jest.fn((payload: unknown) => ({
    type: "notification/push",
    payload,
  })),
}));

const mockDispatch = jest.fn();
const mockSetSavedYearlyPlans = jest.fn();

const makeCreateResponse = (overrides: Record<string, unknown> = {}) => ({
  data: {
    createShiftPlanYear: {
      id: "created-id",
      version: 1,
      updatedAt: "2024-01-01T00:00:00Z",
      ...overrides,
    },
  },
  errors: undefined,
});

const makeUpdateResponse = (overrides: Record<string, unknown> = {}) => ({
  data: {
    updateShiftPlanYear: {
      id: "existing-id",
      version: 2,
      updatedAt: "2024-02-01T00:00:00Z",
      ...overrides,
    },
  },
  errors: undefined,
});

describe("useShiftPlanSave", () => {
  const defaultRows = createDefaultRows(2024);
  const defaultParams = {
    selectedYear: 2024,
    currentRows: defaultRows,
    setSavedYearlyPlans: mockSetSavedYearlyPlans,
  };

  beforeEach(() => {
    jest.resetAllMocks();
    (useAppDispatchV2 as jest.Mock).mockReturnValue(mockDispatch);
  });

  it("初期状態で isSaving=false かつ yearRecordIds が空であること", () => {
    const { result } = renderHook(() => useShiftPlanSave(defaultParams));
    expect(result.current.isSaving).toBe(false);
    expect(result.current.yearRecordIds).toEqual({});
    expect(result.current.lastAutoSaveTime).toBeNull();
  });

  describe("performSave – create path (no existing record)", () => {
    it("作成保存に成功した場合、true を返して yearRecordIds を更新すること", async () => {
      (graphqlClient.graphql as jest.Mock).mockResolvedValue(makeCreateResponse());

      const { result } = renderHook(() => useShiftPlanSave(defaultParams));
      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.performSave(defaultRows, 2024, {});
      });

      expect(success).toBe(true);
      expect(result.current.yearRecordIds[2024]).toEqual({
        id: "created-id",
        version: 1,
        updatedAt: "2024-01-01T00:00:00Z",
      });
    });

    it("作成保存に成功した場合、lastAutoSaveTime を設定すること", async () => {
      (graphqlClient.graphql as jest.Mock).mockResolvedValue(makeCreateResponse());

      const { result } = renderHook(() => useShiftPlanSave(defaultParams));
      await act(async () => {
        await result.current.performSave(defaultRows, 2024, {});
      });

      expect(result.current.lastAutoSaveTime).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });

    it("作成保存に成功した場合、setSavedYearlyPlans を呼び出すこと", async () => {
      (graphqlClient.graphql as jest.Mock).mockResolvedValue(makeCreateResponse());

      const { result } = renderHook(() => useShiftPlanSave(defaultParams));
      await act(async () => {
        await result.current.performSave(defaultRows, 2024, {});
      });

      expect(mockSetSavedYearlyPlans).toHaveBeenCalled();
    });

    it("既定では作成保存成功時に成功通知を dispatch すること", async () => {
      (graphqlClient.graphql as jest.Mock).mockResolvedValue(makeCreateResponse());

      const { result } = renderHook(() => useShiftPlanSave(defaultParams));
      await act(async () => {
        await result.current.performSave(defaultRows, 2024, {});
      });

      expect(pushNotification).toHaveBeenCalledWith(
        expect.objectContaining({ tone: "success" }),
      );
      expect(mockDispatch).toHaveBeenCalled();
    });

    it("showNotification=false の成功時は通知を抑制すること", async () => {
      (graphqlClient.graphql as jest.Mock).mockResolvedValue(makeCreateResponse());

      const { result } = renderHook(() => useShiftPlanSave(defaultParams));
      await act(async () => {
        await result.current.performSave(defaultRows, 2024, {}, false);
      });

      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it("GraphQL が reject した場合、false を返してエラー通知を dispatch すること", async () => {
      (graphqlClient.graphql as jest.Mock).mockRejectedValue(
        new Error("Network error"),
      );

      const { result } = renderHook(() => useShiftPlanSave(defaultParams));
      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.performSave(defaultRows, 2024, {});
      });

      expect(success).toBe(false);
      expect(pushNotification).toHaveBeenCalledWith(
        expect.objectContaining({ tone: "error" }),
      );
    });

    it("createShiftPlanYear が id を返さない場合、false を返すこと", async () => {
      (graphqlClient.graphql as jest.Mock).mockResolvedValue({
        data: { createShiftPlanYear: { version: 1 } },
      });

      const { result } = renderHook(() => useShiftPlanSave(defaultParams));
      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.performSave(defaultRows, 2024, {});
      });

      expect(success).toBe(false);
    });

    it("レスポンスに GraphQL errors が含まれる場合、false を返すこと", async () => {
      (graphqlClient.graphql as jest.Mock).mockResolvedValue({
        data: null,
        errors: [{ message: "Some GraphQL error" }],
      });

      const { result } = renderHook(() => useShiftPlanSave(defaultParams));
      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.performSave(defaultRows, 2024, {});
      });

      expect(success).toBe(false);
    });

    it("showNotification=false の失敗時は通知を抑制すること", async () => {
      (graphqlClient.graphql as jest.Mock).mockRejectedValue(new Error("err"));

      const { result } = renderHook(() => useShiftPlanSave(defaultParams));
      await act(async () => {
        await result.current.performSave(defaultRows, 2024, {}, false);
      });

      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });

  describe("performSave – update path (existing record)", () => {
    const existingRecord = {
      id: "existing-id",
      version: 1,
      updatedAt: "2024-01-01T00:00:00Z",
    };

    it("更新保存に成功した場合、true を返して yearRecordIds を更新すること", async () => {
      (graphqlClient.graphql as jest.Mock).mockResolvedValue(makeUpdateResponse());

      const { result } = renderHook(() => useShiftPlanSave(defaultParams));
      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.performSave(defaultRows, 2024, {
          2024: existingRecord,
        });
      });

      expect(success).toBe(true);
      expect(result.current.yearRecordIds[2024]).toEqual({
        id: "existing-id",
        version: 2,
        updatedAt: "2024-02-01T00:00:00Z",
      });
    });

    it("updateShiftPlanYear が GraphQL errors を返す場合、false を返すこと", async () => {
      (graphqlClient.graphql as jest.Mock).mockResolvedValue({
        data: { updateShiftPlanYear: null },
        errors: [{ message: "ConditionalCheckFailed" }],
      });

      const { result } = renderHook(() => useShiftPlanSave(defaultParams));
      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.performSave(defaultRows, 2024, {
          2024: existingRecord,
        });
      });

      expect(success).toBe(false);
    });

    it("updateShiftPlanYear が id を返さない場合、false を返すこと", async () => {
      (graphqlClient.graphql as jest.Mock).mockResolvedValue({
        data: { updateShiftPlanYear: { version: 2 } },
      });

      const { result } = renderHook(() => useShiftPlanSave(defaultParams));
      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.performSave(defaultRows, 2024, {
          2024: existingRecord,
        });
      });

      expect(success).toBe(false);
    });
  });

  describe("handleSaveAll", () => {
    it("バリデーション通過後に performSave を実行し、isSaving を false に戻すこと", async () => {
      (graphqlClient.graphql as jest.Mock).mockResolvedValue(makeCreateResponse());

      const { result } = renderHook(() => useShiftPlanSave(defaultParams));
      await act(async () => {
        await result.current.handleSaveAll();
      });

      expect(result.current.isSaving).toBe(false);
      expect(graphqlClient.graphql).toHaveBeenCalled();
    });

    it("有効行の editStart が空の場合、エラー通知して中断すること", async () => {
      const rowsWithMissing = defaultRows.map((r) =>
        r.month === 1 ? { ...r, enabled: true, editStart: "" } : r,
      );
      const params = { ...defaultParams, currentRows: rowsWithMissing };

      const { result } = renderHook(() => useShiftPlanSave(params));
      await act(async () => {
        await result.current.handleSaveAll();
      });

      expect(pushNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          tone: "error",
          message: expect.stringContaining("未完了"),
        }),
      );
      expect(graphqlClient.graphql).not.toHaveBeenCalled();
    });

    it("有効行の editEnd が空の場合、エラー通知して中断すること", async () => {
      const rowsWithMissing = defaultRows.map((r) =>
        r.month === 1 ? { ...r, enabled: true, editEnd: "" } : r,
      );
      const params = { ...defaultParams, currentRows: rowsWithMissing };

      const { result } = renderHook(() => useShiftPlanSave(params));
      await act(async () => {
        await result.current.handleSaveAll();
      });

      expect(pushNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          tone: "error",
          message: expect.stringContaining("未完了"),
        }),
      );
      expect(graphqlClient.graphql).not.toHaveBeenCalled();
    });

    it("editStart が editEnd より後の場合、エラー通知して中断すること", async () => {
      const rowsWithBadDates = defaultRows.map((r) =>
        r.month === 1
          ? { ...r, enabled: true, editStart: "2024-01-31", editEnd: "2024-01-01" }
          : r,
      );
      const params = { ...defaultParams, currentRows: rowsWithBadDates };

      const { result } = renderHook(() => useShiftPlanSave(params));
      await act(async () => {
        await result.current.handleSaveAll();
      });

      expect(pushNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          tone: "error",
          message: expect.stringContaining("開始日が終了日より後"),
        }),
      );
      expect(graphqlClient.graphql).not.toHaveBeenCalled();
    });

    it("バリデーション時に無効行はスキップすること", async () => {
      const rowsWithDisabled = defaultRows.map((r) =>
        r.month === 1
          ? { ...r, enabled: false, editStart: "", editEnd: "" }
          : r,
      );
      const params = { ...defaultParams, currentRows: rowsWithDisabled };
      (graphqlClient.graphql as jest.Mock).mockResolvedValue(makeCreateResponse());

      const { result } = renderHook(() => useShiftPlanSave(params));
      await act(async () => {
        await result.current.handleSaveAll();
      });

      expect(graphqlClient.graphql).toHaveBeenCalled();
    });
  });

  describe("setYearRecordIds / setIsSaving", () => {
    it("setYearRecordIds で yearRecordIds 状態を更新すること", () => {
      const { result } = renderHook(() => useShiftPlanSave(defaultParams));
      act(() => {
        result.current.setYearRecordIds({
          2024: { id: "test-id", version: 1, updatedAt: null },
        });
      });
      expect(result.current.yearRecordIds[2024].id).toBe("test-id");
    });

    it("setIsSaving で isSaving 状態を更新すること", () => {
      const { result } = renderHook(() => useShiftPlanSave(defaultParams));
      act(() => {
        result.current.setIsSaving(true);
      });
      expect(result.current.isSaving).toBe(true);
    });
  });
});
