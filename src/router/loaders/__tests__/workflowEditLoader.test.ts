import { resolveWorkflowLoaderData } from "@/entities/workflow/model/loader";
import * as workflowDetailLoaderModule from "@/entities/workflow/model/loader";
import { workflowEditLoader } from "@/router/loaders/workflowEditLoader";

import { createLoaderArgs } from "./loaderTestUtils";

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

    const result = await workflowEditLoader(
      createLoaderArgs({ params: { id: "wf-1" } })
    );

    expect(result.workflow.id).toBe("wf-1");
    expect(resolveWorkflowLoaderData).toHaveBeenCalledWith({ id: "wf-1" });

    spy.mockRestore();
  });
});
