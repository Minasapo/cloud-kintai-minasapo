import { act, renderHook, waitFor } from "@testing-library/react";

import useShiftPlanYear from "../useShiftPlanYear";

type MockGraphQL = jest.Mock;
const mockGraphql: MockGraphQL = jest.fn();

jest.mock("@/lib/amplify/graphqlClient", () => ({
  graphqlClient: {
    graphql: (...args: unknown[]) => mockGraphql(...args),
  },
}));

describe("useShiftPlanYear", () => {
  const baseItem = {
    __typename: "ShiftPlanYear",
    plans: [
      {
        __typename: "ShiftPlanMonthSetting",
        month: 1,
        settings: [],
      },
      null,
    ],
  };

  beforeEach(() => {
    mockGraphql.mockReset();
  });

  it("正常系: plansを取得しnullを除外してセットする", async () => {
    mockGraphql.mockResolvedValue({
      data: {
        shiftPlanYearByTargetYear: {
          items: [baseItem],
        },
      },
    });

    const { result } = renderHook(() => useShiftPlanYear(2024));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(result.current.plans).toHaveLength(1);
    expect(result.current.plans?.[0]?.month).toBe(1);
    expect(mockGraphql).toHaveBeenCalledTimes(1);
  });

  it("データなしの場合はplansがnullになる", async () => {
    mockGraphql.mockResolvedValue({
      data: {
        shiftPlanYearByTargetYear: {
          items: [],
        },
      },
    });

    const { result } = renderHook(() => useShiftPlanYear(2024));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.plans).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("enabledがfalseならfetchしない", async () => {
    const { result } = renderHook(() =>
      useShiftPlanYear(2024, { enabled: false })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockGraphql).not.toHaveBeenCalled();
    expect(result.current.plans).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("GraphQL errorsが返った場合はerrorをセットする", async () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockGraphql.mockResolvedValue({
      errors: [{ message: "boom" }],
    });

    const { result } = renderHook(() => useShiftPlanYear(2024));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("boom");
    expect(result.current.plans).toBeNull();
    consoleSpy.mockRestore();
  });

  it("例外が投げられた場合はerrorをセットする", async () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockGraphql.mockRejectedValue(new Error("network"));

    const { result } = renderHook(() => useShiftPlanYear(2024));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("network");
    expect(result.current.plans).toBeNull();
    consoleSpy.mockRestore();
  });

  it("refetchを呼ぶと再度fetchされる", async () => {
    mockGraphql.mockResolvedValue({
      data: {
        shiftPlanYearByTargetYear: {
          items: [baseItem],
        },
      },
    });

    const { result } = renderHook(() => useShiftPlanYear(2024));

    await waitFor(() => expect(result.current.loading).toBe(false));

    mockGraphql.mockResolvedValue({
      data: {
        shiftPlanYearByTargetYear: {
          items: [
            {
              ...baseItem,
              plans: [
                {
                  __typename: "ShiftPlanMonthSetting",
                  month: 2,
                  settings: [],
                },
              ],
            },
          ],
        },
      },
    });

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.plans?.[0]?.month).toBe(2);
    expect(mockGraphql).toHaveBeenCalledTimes(2);
  });
});
