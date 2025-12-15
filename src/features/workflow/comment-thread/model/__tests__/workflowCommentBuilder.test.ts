import {
  buildSystemWorkflowComment,
  buildWorkflowCommentsUpdateInput,
  extractExistingWorkflowComments,
} from "@features/workflow/comment-thread/model/workflowCommentBuilder";
import type { GetWorkflowQuery } from "@shared/api/graphql/types";
import { WorkflowStatus } from "@shared/api/graphql/types";

const workflowFixture = (
  overrides: Partial<NonNullable<GetWorkflowQuery["getWorkflow"]>> = {}
): NonNullable<GetWorkflowQuery["getWorkflow"]> => ({
  __typename: "Workflow",
  id: "wf-1",
  staffId: "staff-1",
  status: WorkflowStatus.DRAFT,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  comments: [],
  approvalSteps: [],
  category: null,
  overTimeDetails: null,
  ...overrides,
});

describe("extractExistingWorkflowComments", () => {
  it("returns normalized inputs", () => {
    const workflow = workflowFixture({
      comments: [
        {
          __typename: "WorkflowComment",
          id: "c-1",
          staffId: "staff-1",
          text: "hello",
          createdAt: "2024-01-02T00:00:00Z",
        },
        null,
      ],
    });

    const result = extractExistingWorkflowComments(workflow);
    expect(result).toEqual([
      {
        id: "c-1",
        staffId: "staff-1",
        text: "hello",
        createdAt: "2024-01-02T00:00:00Z",
      },
    ]);
  });
});

describe("buildSystemWorkflowComment", () => {
  it("uses provided factories", () => {
    const comment = buildSystemWorkflowComment("info", {
      idFactory: () => "custom-id",
      timestampFactory: () => "2024-01-03T00:00:00Z",
    });
    expect(comment).toEqual({
      id: "custom-id",
      staffId: "system",
      text: "info",
      createdAt: "2024-01-03T00:00:00Z",
    });
  });
});

describe("buildWorkflowCommentsUpdateInput", () => {
  it("appends system comment to existing ones", () => {
    const workflow = workflowFixture({
      comments: [
        {
          __typename: "WorkflowComment",
          id: "c-1",
          staffId: "staff-1",
          text: "first",
          createdAt: "2024-01-02T00:00:00Z",
        },
      ],
    });

    const update = buildWorkflowCommentsUpdateInput(workflow, "auto msg", {
      idFactory: () => "new-id",
      timestampFactory: () => "2024-01-04T00:00:00Z",
    });

    expect(update).toEqual({
      id: "wf-1",
      comments: [
        {
          id: "c-1",
          staffId: "staff-1",
          text: "first",
          createdAt: "2024-01-02T00:00:00Z",
        },
        {
          id: "new-id",
          staffId: "system",
          text: "auto msg",
          createdAt: "2024-01-04T00:00:00Z",
        },
      ],
    });
  });
});
