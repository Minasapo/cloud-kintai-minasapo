import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  useWorkflowListActions,
  useWorkflowListData,
} from "../context/WorkflowListPageContext";
import WorkflowResults from "./WorkflowResults";

jest.mock("../context/WorkflowListPageContext", () => ({
  useWorkflowListActions: jest.fn(),
  useWorkflowListData: jest.fn(),
}));

const mockedUseWorkflowListData = jest.mocked(useWorkflowListData);
const mockedUseWorkflowListActions = jest.mocked(useWorkflowListActions);

describe("WorkflowResults", () => {
  const onCardClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockedUseWorkflowListData.mockReturnValue({
      isCompact: false,
      loading: false,
      filteredItems: [
        {
          id: "wf-1",
          category: "勤怠修正",
          applicationDate: "2026-05-01",
          createdAt: "2026-05-01",
          workflowStatus: "REQUEST",
        },
      ],
    } as never);

    mockedUseWorkflowListActions.mockReturnValue({
      resolveWorkflowKey: () => "wf-1",
      onCardClick,
    } as never);
  });

  it("renders semantic table headers for desktop workflow list", () => {
    render(<WorkflowResults />);

    expect(screen.getAllByRole("columnheader")).toHaveLength(4);
    expect(screen.getByRole("columnheader", { name: "種別" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "申請日" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "ステータス" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "作成日" })).toBeInTheDocument();
  });

  it("opens workflow detail when desktop row is clicked", async () => {
    const user = userEvent.setup();
    render(<WorkflowResults />);

    const rowButton = screen.getByRole("button", {
      name: "勤怠修正 の申請詳細を開く",
    });

    await user.click(rowButton);

    expect(onCardClick).toHaveBeenCalledTimes(1);
  });
});
