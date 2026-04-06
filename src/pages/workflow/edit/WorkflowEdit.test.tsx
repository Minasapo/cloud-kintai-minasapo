import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

import WorkflowEdit from "./WorkflowEdit";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: "workflow-1" }),
    useLoaderData: () => ({
      workflow: {
        staffId: "staff-1",
      },
    }),
  };
});

jest.mock("@entities/staff/model/useStaffs/useStaffs", () => ({
  useStaffs: () => ({
    staffs: [],
  }),
}));

jest.mock("@entities/workflow/model/useWorkflows", () => ({
  __esModule: true,
  default: () => ({
    update: jest.fn(),
  }),
}));

jest.mock("@/hooks/useAppNotification", () => ({
  useAppNotification: () => ({
    notify: jest.fn(),
  }),
}));

jest.mock("@/entities/workflow/model/loader", () => ({
  fetchWorkflowById: jest.fn(),
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

jest.mock("@/features/workflow/hooks/useWorkflowEditLoaderState", () => ({
  useWorkflowEditLoaderState: () => ({
    category: "有給休暇申請",
    setCategory: jest.fn(),
    applicationDate: "2026-03-31",
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
    overtimeDate: "",
    setOvertimeDate: jest.fn(),
    overtimeStart: "",
    setOvertimeStart: jest.fn(),
    overtimeEnd: "",
    setOvertimeEnd: jest.fn(),
    overtimeReason: "",
    setOvertimeReason: jest.fn(),
    customWorkflowTitle: "",
    setCustomWorkflowTitle: jest.fn(),
    customWorkflowContent: "",
    setCustomWorkflowContent: jest.fn(),
    draftMode: false,
    setDraftMode: jest.fn(),
    applicant: {
      familyName: "山田",
      givenName: "太郎",
    },
    existingComments: [],
    setExistingComments: jest.fn(),
  }),
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

describe("WorkflowEdit page layout", () => {
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
    const { container } = renderWithRouter(<WorkflowEdit />);

    expect(screen.getByText("申請を編集")).toBeInTheDocument();
    expect(screen.getByText("workflow-type-fields")).toBeInTheDocument();
    expect(
      container.querySelector('div[style*="component-page-widths-form"]'),
    ).toBeTruthy();
  });
});
