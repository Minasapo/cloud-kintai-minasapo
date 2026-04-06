import { render, screen } from "@testing-library/react";
import dayjs from "dayjs";
import type { ReactNode } from "react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

import { AuthContext } from "@/context/AuthContext";

import NewWorkflow from "./NewWorkflow";

jest.mock("@entities/app-config/model/useAppConfig", () => ({
  __esModule: true,
  default: () => ({
    config: {},
    getStartTime: () => dayjs("09:00", "HH:mm"),
    getEndTime: () => dayjs("18:00", "HH:mm"),
    getAbsentEnabled: () => true,
  }),
}));

jest.mock("@entities/staff/model/useStaffs/useStaffs", () => ({
  useStaffs: () => ({
    staffs: [
      {
        id: "staff-1",
        cognitoUserId: "user-1",
        familyName: "山田",
        givenName: "太郎",
      },
    ],
  }),
}));

jest.mock("@entities/workflow/model/useWorkflows", () => ({
  __esModule: true,
  default: () => ({
    create: jest.fn(),
  }),
}));

jest.mock("@entities/workflow-template/model/useWorkflowTemplates", () => ({
  __esModule: true,
  default: () => ({
    templates: [],
  }),
}));

jest.mock("@/hooks/useAppNotification", () => ({
  useAppNotification: () => ({
    notify: jest.fn(),
  }),
}));

jest.mock("@/features/workflow/application-form/model/useNewWorkflowForm", () => ({
  useNewWorkflowForm: () => ({
    draftMode: false,
    handleDraftToggle: jest.fn(),
    category: "有給休暇申請",
    setCategory: jest.fn(),
    applicationDate: "2026-03-31",
    formState: {},
    errors: {
      dateError: "",
      absenceDateError: "",
      overtimeDateError: "",
      overtimeError: "",
      customWorkflowTitleError: "",
      customWorkflowContentError: "",
    },
    applyValidationErrors: jest.fn(),
    startDate: "",
    setStartDate: jest.fn(),
    endDate: "",
    setEndDate: jest.fn(),
    absenceDate: "",
    setAbsenceDate: jest.fn(),
    absenceReason: "",
    setAbsenceReason: jest.fn(),
    paidReason: "",
    setPaidReason: jest.fn(),
    overtimeStart: "",
    setOvertimeStart: jest.fn(),
    overtimeEnd: "",
    setOvertimeEnd: jest.fn(),
    overtimeDate: "",
    setOvertimeDate: jest.fn(),
    overtimeReason: "",
    setOvertimeReason: jest.fn(),
    customWorkflowTitle: "",
    setCustomWorkflowTitle: jest.fn(),
    customWorkflowContent: "",
    setCustomWorkflowContent: jest.fn(),
    selectedTemplateId: "",
    setSelectedTemplateId: jest.fn(),
  }),
}));

jest.mock("@/features/workflow/application-form/model/WorkflowFormContext", () => ({
  WorkflowFormProvider: function MockWorkflowFormProvider({
    children,
  }: {
    children: ReactNode;
  }) {
    return <>{children}</>;
  },
}));

jest.mock("@/features/workflow/application-form/ui/WorkflowTypeFields", () => {
  function MockWorkflowTypeFields() {
    return <div>workflow-type-fields</div>;
  }

  return MockWorkflowTypeFields;
});

jest.mock("@/features/workflow/notifications/sendWorkflowSubmissionNotification", () => ({
  sendWorkflowSubmissionNotification: jest.fn(),
}));

describe("NewWorkflow page layout", () => {
  const renderWithRouter = (ui: React.ReactElement) => {
    const router = createMemoryRouter(
      [
        {
          path: "/",
          element: ui,
        },
      ],
      { initialEntries: ["/"] },
    );

    return render(<RouterProvider router={router} />);
  };

  it("renders inside the form width preset", () => {
    const { container } = renderWithRouter(
      <AuthContext.Provider
        value={{
          signOut: jest.fn(),
          signIn: jest.fn(),
          isCognitoUserRole: () => false,
          authStatus: "authenticated",
          cognitoUser: { id: "user-1" } as never,
        }}
      >
        <NewWorkflow />
      </AuthContext.Provider>,
    );

    expect(screen.getAllByText("新規作成")[0]).toBeInTheDocument();
    expect(screen.getByText("workflow-type-fields")).toBeInTheDocument();
    expect(
      container.querySelector('div[style*="component-page-widths-form"]'),
    ).toBeTruthy();
  });
});
