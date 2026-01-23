import { GraphQLResult } from "aws-amplify/api";

import { graphqlClient } from "@/shared/api/amplify/graphqlClient";

import {
  fetchWorkflowById,
  resolveWorkflowLoaderData,
  workflowDetailLoader,
  WorkflowLoaderError,
} from "../workflowDetailLoader";
import { createLoaderArgs } from "./loaderTestUtils";

type Workflow = {
  id: string;
  __typename?: string;
};

// JSDOM環境でもResponseが未定義となる場合があるため簡易ポリフィルを設定
const ensureResponse = () => {
  if (typeof Response === "undefined") {
    class SimpleResponse {
      status: number;
      body?: unknown;
      constructor(body?: unknown, init?: ResponseInit) {
        this.body = body;
        this.status = init?.status ?? 200;
      }
    }

    (global as unknown as Record<string, unknown>).Response =
      SimpleResponse as typeof Response;
  }

  // Requestのポリフィルも追加
  if (typeof Request === "undefined") {
    class SimpleRequest {
      url: string;
      constructor(url: string) {
        this.url = url;
      }
    }
    (global as unknown as Record<string, unknown>).Request =
      SimpleRequest as typeof Request;
  }
};

describe("workflowDetailLoader", () => {
  ensureResponse();

  const mockGraphql = graphqlClient.graphql as jest.Mock;
  const workflow: Workflow = { id: "wf-1", __typename: "Workflow" };

  afterEach(() => {
    mockGraphql.mockReset();
  });

  it("fetchWorkflowById returns workflow when found", async () => {
    mockGraphql.mockResolvedValue({
      data: { getWorkflow: workflow },
    } satisfies GraphQLResult);

    const result = await fetchWorkflowById("wf-1");

    expect(mockGraphql).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { id: "wf-1" },
        authMode: "userPool",
      })
    );
    expect(result).toEqual(workflow);
  });

  it("fetchWorkflowById throws when GraphQL returns errors", async () => {
    mockGraphql.mockResolvedValue({
      data: null,
      errors: [{ message: "boom" }] as GraphQLResult["errors"],
    } satisfies GraphQLResult);

    await expect(fetchWorkflowById("wf-1")).rejects.toThrow(
      WorkflowLoaderError
    );
  });

  it("fetchWorkflowById throws 404 when workflow is missing", async () => {
    mockGraphql.mockResolvedValue({ data: { getWorkflow: null } });

    await expect(fetchWorkflowById("wf-1")).rejects.toMatchObject({
      status: 404,
    });
  });

  it("resolveWorkflowLoaderData throws 404 Response when id missing", async () => {
    await expect(resolveWorkflowLoaderData({})).rejects.toBeInstanceOf(
      Response
    );
    await expect(resolveWorkflowLoaderData({})).rejects.toMatchObject({
      status: 404,
    });
  });

  it("resolveWorkflowLoaderData wraps WorkflowLoaderError into Response with status", async () => {
    mockGraphql.mockResolvedValue({ errors: [{ message: "not found" }] });

    await expect(
      resolveWorkflowLoaderData({ id: "wf-1" })
    ).rejects.toMatchObject({
      status: 500,
    });
  });

  it("workflowDetailLoader delegates to resolver", async () => {
    mockGraphql.mockResolvedValue({ data: { getWorkflow: workflow } });

    const result = await workflowDetailLoader(
      createLoaderArgs({ params: { id: "wf-1" } })
    );

    expect(result.workflow).toEqual(workflow);
  });
});
