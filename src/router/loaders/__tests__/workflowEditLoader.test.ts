import { resolveWorkflowLoaderData } from "@/router/loaders/workflowDetailLoader";
import * as workflowDetailLoaderModule from "@/router/loaders/workflowDetailLoader";
import { workflowEditLoader } from "@/router/loaders/workflowEditLoader";

describe("workflowEditLoader", () => {
  it("delegates to resolveWorkflowLoaderData", async () => {
    const spy = jest.spyOn(
      workflowDetailLoaderModule,
      "resolveWorkflowLoaderData"
    );
    spy.mockResolvedValue({ workflow: { id: "wf-1" } } as any);

    const result = await workflowEditLoader({ params: { id: "wf-1" } } as any);

    expect(result.workflow.id).toBe("wf-1");
    expect(resolveWorkflowLoaderData).toHaveBeenCalledWith({ id: "wf-1" });

    spy.mockRestore();
  });
});
