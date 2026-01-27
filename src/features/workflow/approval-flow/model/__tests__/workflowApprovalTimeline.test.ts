import type { StaffType } from "@entities/staff/model/useStaffs/useStaffs";
import { StaffRole } from "@entities/staff/model/useStaffs/useStaffs";
import {
  buildWorkflowApprovalTimeline,
  deriveWorkflowApproverInfo,
} from "@features/workflow/approval-flow/model/workflowApprovalTimeline";
import {
  ApprovalStatus,
  ApproverMultipleMode,
  ApproverSettingMode,
  type GetWorkflowQuery,
  WorkflowStatus,
} from "@shared/api/graphql/types";

const staffFixture = (overrides: Partial<StaffType> = {}): StaffType =>
  ({
    id: "staff-1",
    cognitoUserId: "cognito-1",
    familyName: "山田",
    givenName: "太郎",
    mailAddress: "",
    owner: false,
    role: StaffRole.STAFF,
    enabled: true,
    status: "active" as StaffType["status"],
    createdAt: "",
    updatedAt: "",
    ...overrides,
  } as StaffType);

const workflowFixture = (
  overrides: Partial<NonNullable<GetWorkflowQuery["getWorkflow"]>> = {}
): NonNullable<GetWorkflowQuery["getWorkflow"]> => ({
  __typename: "Workflow",
  id: "wf-1",
  staffId: "staff-1",
  status: WorkflowStatus.DRAFT,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-02T00:00:00Z",
  category: null,
  overTimeDetails: null,
  approvalSteps: [],
  comments: [],
  ...overrides,
});

describe("deriveWorkflowApproverInfo", () => {
  it("defaults to 管理者全員 when staff missing", () => {
    const info = deriveWorkflowApproverInfo(workflowFixture(), []);
    expect(info).toEqual({ mode: "any", items: ["管理者全員"] });
  });

  it("resolves single approver from staff settings", () => {
    const workflow = workflowFixture({ staffId: "staff-2" });
    const staffs = [
      staffFixture({
        id: "staff-2",
        approverSetting: ApproverSettingMode.SINGLE,
        approverSingle: "staff-1",
      }),
      staffFixture(),
    ];
    const info = deriveWorkflowApproverInfo(workflow, staffs);
    expect(info).toEqual({ mode: "single", items: ["山田 太郎"] });
  });

  it("respects ordered multiple approvers", () => {
    const workflow = workflowFixture({ staffId: "staff-3" });
    const staffs = [
      staffFixture({
        id: "staff-3",
        approverSetting: ApproverSettingMode.MULTIPLE,
        approverMultiple: ["staff-1", "external"],
        approverMultipleMode: ApproverMultipleMode.ORDER,
      }),
      staffFixture(),
    ];

    const info = deriveWorkflowApproverInfo(workflow, staffs);
    expect(info).toEqual({ mode: "order", items: ["山田 太郎", "external"] });
  });
});

describe("buildWorkflowApprovalTimeline", () => {
  const staffs = [
    staffFixture(),
    staffFixture({ id: "staff-2", familyName: "佐藤" }),
  ];
  const applicantName = "申請 太郎";
  const applicationDate = "2024/01/02";

  it("returns applicant-only step when workflow is null", () => {
    const result = buildWorkflowApprovalTimeline({
      workflow: null,
      staffs,
      applicantName,
      applicationDate,
    });
    expect(result).toEqual([
      {
        id: "s0",
        name: applicantName,
        role: "申請者",
        state: "",
        date: applicationDate,
        comment: "",
      },
    ]);
  });

  it("uses existing approval steps when present", () => {
    const workflow = workflowFixture({
      approvalSteps: [
        {
          __typename: "ApprovalStep",
          id: "step-b",
          stepOrder: 2,
          approverStaffId: "staff-2",
          decisionStatus: ApprovalStatus.REJECTED,
          decisionTimestamp: "2024-01-05T00:00:00Z",
          approverComment: "NG",
        },
        {
          __typename: "ApprovalStep",
          id: "step-a",
          stepOrder: 1,
          approverStaffId: "staff-1",
          decisionStatus: ApprovalStatus.APPROVED,
          decisionTimestamp: "2024-01-04T00:00:00Z",
          approverComment: "OK",
        },
      ],
    });

    const result = buildWorkflowApprovalTimeline({
      workflow,
      staffs,
      applicantName,
      applicationDate,
    });

    expect(result).toHaveLength(3);
    expect(result[1]).toMatchObject({
      id: "step-a",
      name: "山田 太郎",
      state: "承認済み",
      comment: "OK",
    });
    expect(result[2]).toMatchObject({
      id: "step-b",
      state: "却下",
      comment: "NG",
    });
  });

  it("falls back to derived approvers when no steps exist", () => {
    const workflow = workflowFixture({
      staffId: "staff-3",
      status: WorkflowStatus.APPROVED,
    });
    const staffsWithSettings = [
      staffFixture({
        id: "staff-3",
        approverSetting: ApproverSettingMode.MULTIPLE,
        approverMultiple: ["staff-1", "staff-2"],
        approverMultipleMode: ApproverMultipleMode.ORDER,
      }),
      ...staffs,
    ];

    const result = buildWorkflowApprovalTimeline({
      workflow,
      staffs: staffsWithSettings,
      applicantName,
      applicationDate,
    });

    expect(result).toHaveLength(3);
    expect(result[1].state).toBe("承認済み");
    expect(result[2].name).toBe("佐藤 太郎");
  });
});
