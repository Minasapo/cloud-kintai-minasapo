import { subscribeWorkflowCommentNotifications } from "@features/workflow/notification/model/workflowNotificationEventService";
import { useWorkflowDetailData } from "@pages/admin/AdminWorkflow/hooks/useWorkflowDetailData";
import { graphqlClient } from "@shared/api/amplify/graphqlClient";
import { getWorkflow } from "@shared/api/graphql/documents/queries";
import { act, renderHook, waitFor } from "@testing-library/react";

jest.mock("@shared/api/amplify/graphqlClient", () => ({
  graphqlClient: { graphql: jest.fn() },
}));

jest.mock(
  "@features/workflow/notification/model/workflowNotificationEventService",
);

jest.mock("@shared/lib/logger", () => ({
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));

const mockGraphql = graphqlClient.graphql as jest.Mock;
const mockSubscribeNotifications =
  subscribeWorkflowCommentNotifications as jest.Mock;

const mockUnsubscribe = jest.fn();
const mockSubscribe = jest
  .fn()
  .mockReturnValue({ unsubscribe: mockUnsubscribe });
const mockUnsubscribeNotification = jest.fn();

const makeWorkflow = (overrides: Record<string, unknown> = {}) => ({
  id: "wf-1",
  staffId: "staff-1",
  status: "PENDING",
  createdAt: "1700000000000",
  comments: [],
  ...overrides,
});

/**
 * graphqlClient.graphql を query-aware モックとして設定するヘルパー。
 * getWorkflow クエリには fetchResult を返し、それ以外（subscription）は
 * { subscribe: mockSubscribe } を返す。
 */
const setupGraphqlMock = (
  fetchResult: unknown = { data: { getWorkflow: makeWorkflow() }, errors: [] },
) => {
  mockGraphql.mockImplementation(
    ({ query }: { query: string }) => {
      if (query === getWorkflow) {
        return Promise.resolve(fetchResult);
      }
      return { subscribe: mockSubscribe };
    },
  );
};

describe("useWorkflowDetailData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGraphql.mockReturnValue({ subscribe: mockSubscribe });
    mockSubscribeNotifications.mockReturnValue(mockUnsubscribeNotification);
  });

  it("id が undefined の場合、workflow は null かつ loading は false で開始すること", async () => {
    const { result } = renderHook(() => useWorkflowDetailData(undefined));

    expect(result.current.workflow).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("id が指定された場合、workflow を取得すること", async () => {
    const workflow = makeWorkflow();
    setupGraphqlMock({ data: { getWorkflow: workflow }, errors: [] });

    const { result } = renderHook(() => useWorkflowDetailData("wf-1"));

    await waitFor(() => {
      expect(result.current.workflow).toBeTruthy();
    });

    expect(result.current.workflow?.id).toBe("wf-1");
    expect(result.current.error).toBeNull();
  });

  it("取得中は loading=true、完了後は loading=false になること", async () => {
    let resolveFetch!: (value: unknown) => void;
    const fetchPromise = new Promise((resolve) => {
      resolveFetch = resolve;
    });
    mockGraphql.mockImplementation(({ query }: { query: string }) => {
      if (query === getWorkflow) return fetchPromise;
      return { subscribe: mockSubscribe };
    });

    const { result } = renderHook(() => useWorkflowDetailData("wf-1"));

    await waitFor(() => expect(result.current.loading).toBe(true));

    await act(async () => {
      resolveFetch({
        data: { getWorkflow: makeWorkflow() },
        errors: [],
      });
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it("workflow が見つからない場合、error を設定すること", async () => {
    setupGraphqlMock({ data: { getWorkflow: null }, errors: [] });

    const { result } = renderHook(() => useWorkflowDetailData("wf-1"));

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    expect(result.current.workflow).toBeNull();
    expect(result.current.error).toContain("見つかりませんでした");
  });

  it("graphql が throw した場合、error を設定すること", async () => {
    mockGraphql.mockImplementation(({ query }: { query: string }) => {
      if (query === getWorkflow) return Promise.reject(new Error("Network error"));
      return { subscribe: mockSubscribe };
    });

    const { result } = renderHook(() => useWorkflowDetailData("wf-1"));

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    expect(result.current.error).toBe("Network error");
  });

  it("レスポンスに GraphQL errors がある場合、error を設定すること", async () => {
    setupGraphqlMock({ data: null, errors: [{ message: "Unauthorized" }] });

    const { result } = renderHook(() => useWorkflowDetailData("wf-1"));

    await waitFor(() => {
      expect(result.current.error).toBe("Unauthorized");
    });
  });

  it("id が指定された場合、workflow 更新サブスクリプションを開始すること", async () => {
    setupGraphqlMock();

    const { unmount } = renderHook(() => useWorkflowDetailData("wf-1"));

    await waitFor(() => expect(mockSubscribe).toHaveBeenCalled());

    unmount();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it("id が undefined の場合、サブスクリプションを開始しないこと", () => {
    renderHook(() => useWorkflowDetailData(undefined));
    expect(mockSubscribe).not.toHaveBeenCalled();
  });

  it("setWorkflow で workflow を更新できること", async () => {
    setupGraphqlMock();

    const { result } = renderHook(() => useWorkflowDetailData("wf-1"));

    await waitFor(() => expect(result.current.workflow).toBeTruthy());

    const updatedWorkflow = makeWorkflow({ status: "APPROVED" });
    act(() => {
      result.current.setWorkflow(updatedWorkflow as never);
    });

    expect(result.current.workflow?.status).toBe("APPROVED");
  });

  it("currentStaffId と onNewComment がある場合、コメント通知サブスクリプションを開始すること", async () => {
    setupGraphqlMock();

    const onNewComment = jest.fn();
    const { unmount } = renderHook(() =>
      useWorkflowDetailData("wf-1", {
        currentStaffId: "staff-1",
        onNewComment,
      }),
    );

    await waitFor(() =>
      expect(mockSubscribeNotifications).toHaveBeenCalledWith(
        expect.objectContaining({
          workflowId: "wf-1",
          recipientStaffId: "staff-1",
        }),
      ),
    );

    unmount();
    expect(mockUnsubscribeNotification).toHaveBeenCalled();
  });

  it("currentStaffId がない場合、通知サブスクリプションを開始しないこと", async () => {
    setupGraphqlMock();

    renderHook(() =>
      useWorkflowDetailData("wf-1", {
        onNewComment: jest.fn(),
      }),
    );

    await waitFor(() => expect(mockGraphql).toHaveBeenCalled());
    expect(mockSubscribeNotifications).not.toHaveBeenCalled();
  });

  it("refetchWorkflow 呼び出しで workflow を再取得すること", async () => {
    const workflow = makeWorkflow();
    const updatedWorkflow = makeWorkflow({ status: "APPROVED" });
    let callCount = 0;

    mockGraphql.mockImplementation(({ query }: { query: string }) => {
      if (query === getWorkflow) {
        callCount++;
        const data = callCount === 1 ? workflow : updatedWorkflow;
        return Promise.resolve({ data: { getWorkflow: data }, errors: [] });
      }
      return { subscribe: mockSubscribe };
    });

    const { result } = renderHook(() => useWorkflowDetailData("wf-1"));

    await waitFor(() => expect(result.current.workflow?.status).toBe("PENDING"));

    await act(async () => {
      await result.current.refetchWorkflow();
    });

    expect(result.current.workflow?.status).toBe("APPROVED");
  });
});
