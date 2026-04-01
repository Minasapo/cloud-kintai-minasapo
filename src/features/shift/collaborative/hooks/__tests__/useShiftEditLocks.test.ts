import { act, renderHook, waitFor } from "@testing-library/react";

import { useShiftEditLocks } from "../useShiftEditLocks";

type HookProps = {
  targetMonth?: string;
};

const mockGraphql = jest.fn();
const mockUnsubscribe = jest.fn();

jest.mock("@/shared/api/amplify/graphqlClient", () => ({
  graphqlClient: {
    graphql: (...args: unknown[]) => mockGraphql(...args),
  },
}));

describe("useShiftEditLocks", () => {
  const activeLock = {
    __typename: "ShiftEditLock",
    id: "2026-03#staff-1#01",
    targetMonth: "2026-03",
    staffId: "staff-1",
    date: "01",
    holderUserId: "other-user",
    holderUserName: "他ユーザー",
    acquiredAt: "2026-03-01T10:00:00.000Z",
    expiresAt: "2099-03-01T10:01:30.000Z",
    version: 3,
    createdAt: "2026-03-01T10:00:00.000Z",
    updatedAt: "2026-03-01T10:00:00.000Z",
  };

  beforeEach(() => {
    jest.useFakeTimers();
    mockGraphql.mockReset();
    mockUnsubscribe.mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("他ユーザーがロック中のセルは取得失敗として返す", async () => {
    mockGraphql.mockImplementation(({ query }: { query: string }) => {
      if (query.includes("ListShiftEditLocks")) {
        return Promise.resolve({
          data: { listShiftEditLocks: { items: [], nextToken: null } },
        });
      }

      if (query.includes("GetShiftEditLock")) {
        return Promise.resolve({
          data: { getShiftEditLock: activeLock },
        });
      }

      if (query.includes("OnCreateShiftEditLock")) {
        return {
          subscribe: jest.fn(() => ({ unsubscribe: mockUnsubscribe })),
        };
      }

      if (query.includes("OnUpdateShiftEditLock")) {
        return {
          subscribe: jest.fn(() => ({ unsubscribe: mockUnsubscribe })),
        };
      }

      if (query.includes("OnDeleteShiftEditLock")) {
        return {
          subscribe: jest.fn(() => ({ unsubscribe: mockUnsubscribe })),
        };
      }

      return Promise.resolve({ data: {} });
    });

    const { result } = renderHook(() =>
      useShiftEditLocks({
        currentUserId: "user-1",
        currentUserName: "User One",
        targetMonth: "2026-03",
      }),
    );

    await waitFor(() => expect(mockGraphql).toHaveBeenCalled());

    let acquireResult:
      | Awaited<ReturnType<typeof result.current.acquireEditLock>>
      | undefined;

    await act(async () => {
      acquireResult = await result.current.acquireEditLock("staff-1", "01");
    });

    expect(acquireResult).toEqual({
      acquired: false,
      conflict: activeLock,
    });
    expect(result.current.isCellBeingEdited("staff-1", "01")).toBe(true);
  });

  it("subscriptionイベントでロック状態を即時反映する", async () => {
    let createNext:
      | ((value: { data?: { onCreateShiftEditLock?: typeof activeLock } }) => void)
      | undefined;
    let deleteNext:
      | ((value: { data?: { onDeleteShiftEditLock?: typeof activeLock } }) => void)
      | undefined;

    mockGraphql.mockImplementation(({ query }: { query: string }) => {
      if (query.includes("ListShiftEditLocks")) {
        return Promise.resolve({
          data: { listShiftEditLocks: { items: [], nextToken: null } },
        });
      }

      if (query.includes("OnCreateShiftEditLock")) {
        return {
          subscribe: jest.fn((handlers: { next: typeof createNext }) => {
            createNext = handlers.next;
            return { unsubscribe: mockUnsubscribe };
          }),
        };
      }

      if (query.includes("OnUpdateShiftEditLock")) {
        return {
          subscribe: jest.fn(() => ({ unsubscribe: mockUnsubscribe })),
        };
      }

      if (query.includes("OnDeleteShiftEditLock")) {
        return {
          subscribe: jest.fn((handlers: { next: typeof deleteNext }) => {
            deleteNext = handlers.next;
            return { unsubscribe: mockUnsubscribe };
          }),
        };
      }

      return Promise.resolve({ data: {} });
    });

    const { result } = renderHook(() =>
      useShiftEditLocks({
        currentUserId: "user-1",
        currentUserName: "User One",
        targetMonth: "2026-03",
      }),
    );

    await waitFor(() => expect(createNext).toBeDefined());
    expect(deleteNext).toBeDefined();

    act(() => {
      createNext?.({
        data: {
          onCreateShiftEditLock: activeLock,
        },
      });
    });

    await waitFor(() =>
      expect(result.current.isCellBeingEdited("staff-1", "01")).toBe(true),
    );

    act(() => {
      deleteNext?.({
        data: {
          onDeleteShiftEditLock: activeLock,
        },
      });
    });

    await waitFor(() =>
      expect(result.current.isCellBeingEdited("staff-1", "01")).toBe(false),
    );
  });

  it("targetMonth がないときは公開状態を空として扱う", async () => {
    const listShiftEditLocksResponse = {
      data: { listShiftEditLocks: { items: [activeLock], nextToken: null } },
    };

    mockGraphql.mockImplementation(({ query }: { query: string }) => {
      if (query.includes("ListShiftEditLocks")) {
        return Promise.resolve(listShiftEditLocksResponse);
      }

      if (query.includes("OnCreateShiftEditLock")) {
        return {
          subscribe: jest.fn(() => ({ unsubscribe: mockUnsubscribe })),
        };
      }

      if (query.includes("OnUpdateShiftEditLock")) {
        return {
          subscribe: jest.fn(() => ({ unsubscribe: mockUnsubscribe })),
        };
      }

      if (query.includes("OnDeleteShiftEditLock")) {
        return {
          subscribe: jest.fn(() => ({ unsubscribe: mockUnsubscribe })),
        };
      }

      return Promise.resolve({ data: {} });
    });

    const initialProps: HookProps = { targetMonth: "2026-03" };

    const { result, rerender } = renderHook(
      ({ targetMonth }: HookProps) =>
        useShiftEditLocks({
          currentUserId: "user-1",
          currentUserName: "User One",
          targetMonth,
        }),
      {
        initialProps,
      },
    );

    await waitFor(() =>
      expect(result.current.isCellBeingEdited("staff-1", "01")).toBe(true),
    );

    rerender({ targetMonth: undefined });

    expect(result.current.editingCells.size).toBe(0);
    expect(result.current.isCellBeingEdited("staff-1", "01")).toBe(false);
    expect(result.current.getAllEditingCells()).toEqual([]);
  });

  it("releaseEditLock は deleteShiftEditLock に id のみを渡す", async () => {
    const ownLock = {
      ...activeLock,
      holderUserId: "user-1",
      holderUserName: "User One",
    };

    mockGraphql.mockImplementation(
      ({
        query,
        variables,
      }: {
        query: string;
        variables?: Record<string, unknown>;
      }) => {
        if (query.includes("ListShiftEditLocks")) {
          return Promise.resolve({
            data: { listShiftEditLocks: { items: [], nextToken: null } },
          });
        }

        if (query.includes("GetShiftEditLock")) {
          return Promise.resolve({
            data: { getShiftEditLock: ownLock },
          });
        }

        if (query.includes("OnCreateShiftEditLock")) {
          return {
            subscribe: jest.fn(() => ({ unsubscribe: mockUnsubscribe })),
          };
        }

        if (query.includes("OnUpdateShiftEditLock")) {
          return {
            subscribe: jest.fn(() => ({ unsubscribe: mockUnsubscribe })),
          };
        }

        if (query.includes("OnDeleteShiftEditLock")) {
          return {
            subscribe: jest.fn(() => ({ unsubscribe: mockUnsubscribe })),
          };
        }

        if (query.includes("DeleteShiftEditLock")) {
          return Promise.resolve({
            data: {
              deleteShiftEditLock: {
                ...ownLock,
                ...(variables?.input as Record<string, unknown> | undefined),
              },
            },
          });
        }

        return Promise.resolve({ data: {} });
      },
    );

    const { result } = renderHook(() =>
      useShiftEditLocks({
        currentUserId: "user-1",
        currentUserName: "User One",
        targetMonth: "2026-03",
      }),
    );

    await waitFor(() => expect(mockGraphql).toHaveBeenCalled());

    await act(async () => {
      await result.current.releaseEditLock("staff-1", "01");
    });

    expect(mockGraphql).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.stringContaining("DeleteShiftEditLock"),
        variables: {
          input: { id: "2026-03#staff-1#01" },
          condition: {
            version: { eq: 3 },
          },
        },
        authMode: "userPool",
      }),
    );
  });

  it("forceReleaseLock は deleteShiftEditLock に id のみを渡す", async () => {
    mockGraphql.mockImplementation(
      ({
        query,
        variables,
      }: {
        query: string;
        variables?: Record<string, unknown>;
      }) => {
        if (query.includes("ListShiftEditLocks")) {
          return Promise.resolve({
            data: { listShiftEditLocks: { items: [], nextToken: null } },
          });
        }

        if (query.includes("GetShiftEditLock")) {
          return Promise.resolve({
            data: { getShiftEditLock: activeLock },
          });
        }

        if (query.includes("OnCreateShiftEditLock")) {
          return {
            subscribe: jest.fn(() => ({ unsubscribe: mockUnsubscribe })),
          };
        }

        if (query.includes("OnUpdateShiftEditLock")) {
          return {
            subscribe: jest.fn(() => ({ unsubscribe: mockUnsubscribe })),
          };
        }

        if (query.includes("OnDeleteShiftEditLock")) {
          return {
            subscribe: jest.fn(() => ({ unsubscribe: mockUnsubscribe })),
          };
        }

        if (query.includes("DeleteShiftEditLock")) {
          return Promise.resolve({
            data: {
              deleteShiftEditLock: {
                ...activeLock,
                ...(variables?.input as Record<string, unknown> | undefined),
              },
            },
          });
        }

        return Promise.resolve({ data: {} });
      },
    );

    const { result } = renderHook(() =>
      useShiftEditLocks({
        currentUserId: "user-1",
        currentUserName: "User One",
        targetMonth: "2026-03",
      }),
    );

    await waitFor(() => expect(mockGraphql).toHaveBeenCalled());

    await act(async () => {
      await result.current.forceReleaseLock("staff-1", "01");
    });

    expect(mockGraphql).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.stringContaining("DeleteShiftEditLock"),
        variables: {
          input: { id: "2026-03#staff-1#01" },
          condition: {
            version: { eq: 3 },
          },
        },
        authMode: "userPool",
      }),
    );
  });
});
