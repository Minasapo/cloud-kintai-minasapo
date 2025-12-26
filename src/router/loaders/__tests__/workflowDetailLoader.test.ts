import { graphqlClient } from "@/lib/amplify/graphqlClient";
import {
  fetchWorkflowById,
  resolveWorkflowLoaderData,
  workflowDetailLoader,
} from "../workflowDetailLoader";
import { workflowEditLoader } from "../workflowEditLoader";

jest.mock("@/lib/amplify/graphqlClient", () => ({
  graphqlClient: { graphql: jest.fn() },
}));

const mockGraphql = graphqlClient.graphql as jest.Mock;

const sampleWorkflow = { __typename: "Workflow", id: "wf-1" } as const;

describe("workflow loaders", () => {
  beforeEach(() => {
    mockGraphql.mockReset();
  });

  it("fetchWorkflowById returns workflow when found", async () => {
    mockGraphql.mockResolvedValue({ data: { getWorkflow: sampleWorkflow } });

    const result = await fetchWorkflowById("wf-1");

    expect(result).toBe(sampleWorkflow);
    expect(mockGraphql).toHaveBeenCalledWith({
      query: expect.anything(),
      variables: { id: "wf-1" },
      authMode: "userPool",
    });
  });

  it("fetchWorkflowById throws when GraphQL errors present", async () => {
    mockGraphql.mockResolvedValue({ errors: [{ message: "boom" }] });

    await expect(fetchWorkflowById("wf-1")).rejects.toThrow("boom");
  });

  it("fetchWorkflowById throws 404 when workflow missing", async () => {
    mockGraphql.mockResolvedValue({ data: { getWorkflow: null } });

    await expect(fetchWorkflowById("wf-1")).rejects.toThrow("見つかりません");
  });

  it("resolveWorkflowLoaderData rejects when id is missing", async () => {
    await expect(resolveWorkflowLoaderData({})).rejects.toBeInstanceOf(
      Response
    );
  });

  it("resolveWorkflowLoaderData maps WorkflowLoaderError to Response with status", async () => {
    mockGraphql.mockResolvedValue({ errors: [{ message: "boom" }] });

    const promise = resolveWorkflowLoaderData({ id: "wf-1" });
    await expect(promise).rejects.toMatchObject({ status: 500 });
  });

  it("resolveWorkflowLoaderData returns workflow on success", async () => {
    mockGraphql.mockResolvedValue({ data: { getWorkflow: sampleWorkflow } });

    const result = await resolveWorkflowLoaderData({ id: "wf-1" });

    expect(result.workflow).toBe(sampleWorkflow);
  });

  it("resolveWorkflowLoaderData wraps unexpected error as Response 500", async () => {
    mockGraphql.mockRejectedValue(new Error("network down"));

    const promise = resolveWorkflowLoaderData({ id: "wf-1" });
    await expect(promise).rejects.toMatchObject({ status: 500 });
  });

  it("workflowDetailLoader delegates to resolver", async () => {
    mockGraphql.mockResolvedValue({ data: { getWorkflow: sampleWorkflow } });

    const result = await workflowDetailLoader({ params: { id: "wf-1" } });

    expect(result.workflow.id).toBe("wf-1");
  });

  it("workflowEditLoader delegates to resolver", async () => {
    mockGraphql.mockResolvedValue({ data: { getWorkflow: sampleWorkflow } });

    const result = await workflowEditLoader({ params: { id: "wf-1" } });

    expect(result.workflow.id).toBe("wf-1");
  });
});
