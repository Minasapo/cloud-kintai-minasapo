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
  it("staff が見つからない場合、管理者全員を既定値として返すこと", () => {
    const info = deriveWorkflowApproverInfo(workflowFixture(), []);
    expect(info).toEqual({ mode: "any", items: ["管理者全員"] });
  });

  it("スタッフ設定から単一承認者を解決すること", () => {
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

  it("複数承認者の ORDER 設定順を尊重すること", () => {
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

  it("workflow が null の場合、申請者ステップのみを返すこと", () => {
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

  it("approvalSteps がある場合、既存ステップを使用すること", () => {
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

  it("approvalSteps がない場合、導出した承認者へフォールバックすること", () => {
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

describe("mapApprovalStatus coverage (via normalizeApprovalSteps)", () => {
  const staffs: StaffType[] = [];
  const applicantName = "申請者";
  const applicationDate = "2024-01-01";

  const makeWorkflowWithStep = (
    decisionStatus: ApprovalStatus | null
  ): NonNullable<GetWorkflowQuery["getWorkflow"]> => ({
    __typename: "Workflow",
    id: "wf-x",
    staffId: "staff-1",
    status: WorkflowStatus.SUBMITTED,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    category: null,
    overTimeDetails: null,
    comments: [],
    approvalSteps: [
      {
        __typename: "ApprovalStep",
        id: "step-x",
        stepOrder: 1,
        approverStaffId: "ADMINS",
        decisionStatus: decisionStatus as ApprovalStatus,
        decisionTimestamp: null,
        approverComment: null,
      },
    ],
  });

  it("SKIPPED を スキップ にマッピングすること", () => {
    const result = buildWorkflowApprovalTimeline({
      workflow: makeWorkflowWithStep(ApprovalStatus.SKIPPED),
      staffs,
      applicantName,
      applicationDate,
    });
    expect(result[1].state).toBe("スキップ");
  });

  it("PENDING を 未承認 にマッピングすること", () => {
    const result = buildWorkflowApprovalTimeline({
      workflow: makeWorkflowWithStep(ApprovalStatus.PENDING),
      staffs,
      applicantName,
      applicationDate,
    });
    expect(result[1].state).toBe("未承認");
  });

  it("null ステータスを 未承認 にマッピングすること", () => {
    const result = buildWorkflowApprovalTimeline({
      workflow: makeWorkflowWithStep(null),
      staffs,
      applicantName,
      applicationDate,
    });
    expect(result[1].state).toBe("未承認");
  });
});

describe("deriveWorkflowApproverInfo — additional branches", () => {
  const staffFixture2 = (overrides: Partial<StaffType> = {}): StaffType =>
    ({
      id: "staff-a",
      cognitoUserId: "cognito-a",
      familyName: "田中",
      givenName: "一郎",
      mailAddress: "",
      owner: false,
      role: StaffRole.STAFF,
      enabled: true,
      status: "active" as StaffType["status"],
      createdAt: "",
      updatedAt: "",
      ...overrides,
    } as StaffType);

  it("SINGLE 設定で approverSingle がない場合、未設定を返すこと", () => {
    const wf: NonNullable<GetWorkflowQuery["getWorkflow"]> = {
      __typename: "Workflow",
      id: "wf-y",
      staffId: "staff-a",
      status: WorkflowStatus.SUBMITTED,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      category: null,
      overTimeDetails: null,
      comments: [],
      approvalSteps: [],
    };
    const staffs = [
      staffFixture2({
        approverSetting: ApproverSettingMode.SINGLE,
        approverSingle: null,
      }),
    ];
    const result = deriveWorkflowApproverInfo(wf, staffs);
    expect(result).toEqual({ mode: "single", items: ["未設定"] });
  });

  it("MULTIPLE 設定でリストが空の場合、未設定を返すこと", () => {
    const wf: NonNullable<GetWorkflowQuery["getWorkflow"]> = {
      __typename: "Workflow",
      id: "wf-z",
      staffId: "staff-a",
      status: WorkflowStatus.SUBMITTED,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      category: null,
      overTimeDetails: null,
      comments: [],
      approvalSteps: [],
    };
    const staffs = [
      staffFixture2({
        approverSetting: ApproverSettingMode.MULTIPLE,
        approverMultiple: [],
      }),
    ];
    const result = deriveWorkflowApproverInfo(wf, staffs);
    expect(result).toEqual({ mode: "any", items: ["未設定"] });
  });

  it("MULTIPLE で ORDER 以外の場合、mode=any を返すこと", () => {
    const wf: NonNullable<GetWorkflowQuery["getWorkflow"]> = {
      __typename: "Workflow",
      id: "wf-m",
      staffId: "staff-a",
      status: WorkflowStatus.SUBMITTED,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      category: null,
      overTimeDetails: null,
      comments: [],
      approvalSteps: [],
    };
    const staffs = [
      staffFixture2({
        approverSetting: ApproverSettingMode.MULTIPLE,
        approverMultiple: ["staff-b", "staff-c"],
        approverMultipleMode: ApproverMultipleMode.ANY,
      }),
    ];
    const result = deriveWorkflowApproverInfo(wf, staffs);
    expect(result.mode).toBe("any");
    expect(result.items).toHaveLength(2);
  });
});

describe("buildWorkflowApprovalTimeline — fallback mode branches", () => {
  const staffFixture3 = (overrides: Partial<StaffType> = {}): StaffType =>
    ({
      id: "staff-b",
      cognitoUserId: "cognito-b",
      familyName: "鈴木",
      givenName: "次郎",
      mailAddress: "",
      owner: false,
      role: StaffRole.STAFF,
      enabled: true,
      status: "active" as StaffType["status"],
      createdAt: "",
      updatedAt: "",
      ...overrides,
    } as StaffType);

  const applicantName = "申請者";
  const applicationDate = "2024-01-01";

  it("single モードのフォールバック承認者を使用すること", () => {
    const wf: NonNullable<GetWorkflowQuery["getWorkflow"]> = {
      __typename: "Workflow",
      id: "wf-single",
      staffId: "staff-b",
      status: WorkflowStatus.SUBMITTED,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      category: null,
      overTimeDetails: null,
      comments: [],
      approvalSteps: [],
    };
    const staffs = [
      staffFixture3({
        approverSetting: ApproverSettingMode.SINGLE,
        approverSingle: null,
      }),
    ];
    const result = buildWorkflowApprovalTimeline({
      workflow: wf,
      staffs,
      applicantName,
      applicationDate,
    });
    expect(result).toHaveLength(2);
    expect(result[1].name).toBe("未設定");
    expect(result[1].role).toBe("承認者");
  });

  it("複数承認者の order モードフォールバックを使用すること", () => {
    const wf: NonNullable<GetWorkflowQuery["getWorkflow"]> = {
      __typename: "Workflow",
      id: "wf-order",
      staffId: "staff-b",
      status: WorkflowStatus.SUBMITTED,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      category: null,
      overTimeDetails: null,
      comments: [],
      approvalSteps: [],
    };
    const staffs = [
      staffFixture3({
        approverSetting: ApproverSettingMode.MULTIPLE,
        approverMultiple: ["staff-x", "staff-y"],
        approverMultipleMode: ApproverMultipleMode.ORDER,
      }),
    ];
    const result = buildWorkflowApprovalTimeline({
      workflow: wf,
      staffs,
      applicantName,
      applicationDate,
    });
    expect(result).toHaveLength(3);
    expect(result[1].id).toBe("s1");
    expect(result[2].id).toBe("s2");
  });

  it("specific approver 名で any モードフォールバックを使用すること", () => {
    const wf: NonNullable<GetWorkflowQuery["getWorkflow"]> = {
      __typename: "Workflow",
      id: "wf-any",
      staffId: "staff-b",
      status: WorkflowStatus.SUBMITTED,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      category: null,
      overTimeDetails: null,
      comments: [],
      approvalSteps: [],
    };
    const approverStaff = staffFixture3({ id: "staff-approver", familyName: "承認", givenName: "者A" });
    const staffs = [
      staffFixture3({
        approverSetting: ApproverSettingMode.MULTIPLE,
        approverMultiple: ["staff-approver"],
        approverMultipleMode: ApproverMultipleMode.ANY,
      }),
      approverStaff,
    ];
    const result = buildWorkflowApprovalTimeline({
      workflow: wf,
      staffs,
      applicantName,
      applicationDate,
    });
    expect(result).toHaveLength(2);
    expect(result[1].name).toContain("承認");
    expect(result[1].role).toBe("承認者（複数）");
  });
});
