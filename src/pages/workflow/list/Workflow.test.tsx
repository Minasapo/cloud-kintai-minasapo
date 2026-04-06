import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

import Workflow from "./Workflow";

const mockUseWorkflowListData = jest.fn();

jest.mock("./context/WorkflowListPageContext", () => ({
  useWorkflowListData: () => mockUseWorkflowListData(),
  WorkflowListPageProvider: function MockWorkflowListPageProvider({
    children,
  }: {
    children: ReactNode;
  }) {
    return <>{children}</>;
  },
}));

jest.mock("./components/WorkflowHero", () => {
  function MockWorkflowHero() {
    return <div>hero</div>;
  }

  return MockWorkflowHero;
});
jest.mock("./components/WorkflowSummaryCards", () => {
  function MockWorkflowSummaryCards() {
    return <div>summary</div>;
  }

  return MockWorkflowSummaryCards;
});
jest.mock("./components/WorkflowListContent", () => {
  function MockWorkflowListContent() {
    return <div>content</div>;
  }

  return MockWorkflowListContent;
});
jest.mock("./components/WorkflowNoStaffState", () => {
  function MockWorkflowNoStaffState() {
    return <div>empty</div>;
  }

  return MockWorkflowNoStaffState;
});
jest.mock("./components/WorkflowAuthLoadingState", () => {
  function MockWorkflowAuthLoadingState() {
    return <div>loading</div>;
  }

  return MockWorkflowAuthLoadingState;
});
jest.mock("./components/WorkflowSharedUi", () => ({
  InfoCard: function MockInfoCard({ children }: { children?: ReactNode }) {
    return <div>{children}</div>;
  },
}));

describe("Workflow page layout", () => {
  it("renders inside the content width preset", () => {
    mockUseWorkflowListData.mockReturnValue({
      isAuthenticated: true,
      currentStaffId: "staff-1",
      error: null,
    });

    const { container } = render(<Workflow />);

    expect(screen.getByText("hero")).toBeInTheDocument();
    expect(
      container.querySelector('div[style*="component-page-widths-content"]'),
    ).toBeTruthy();
  });
});
