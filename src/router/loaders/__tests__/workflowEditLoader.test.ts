import { resolveWorkflowLoaderData } from "@/router/loaders/workflowDetailLoader";
import * as workflowDetailLoaderModule from "@/router/loaders/workflowDetailLoader";
import { workflowEditLoader } from "@/router/loaders/workflowEditLoader";

// Requestのポリフィル
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

describe("workflowEditLoader", () => {
  it("delegates to resolveWorkflowLoaderData", async () => {
    const spy = jest.spyOn(
      workflowDetailLoaderModule,
      "resolveWorkflowLoaderData"
    );
    spy.mockResolvedValue({ workflow: { id: "wf-1" } } as Awaited<
      ReturnType<typeof resolveWorkflowLoaderData>
    >);

    const result = await workflowEditLoader({
      params: { id: "wf-1" },
      request: new Request("http://localhost"),
    } as Parameters<typeof workflowEditLoader>[0]);

    expect(result.workflow.id).toBe("wf-1");
    expect(resolveWorkflowLoaderData).toHaveBeenCalledWith({ id: "wf-1" });

    spy.mockRestore();
  });
});
