import { fireEvent,render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  useWorkflowListActions,
  useWorkflowListData,
  useWorkflowListUi,
} from "../context/WorkflowListPageContext";
import WorkflowFiltersArea from "./WorkflowFiltersArea";

jest.mock("../context/WorkflowListPageContext", () => ({
  useWorkflowListActions: jest.fn(),
  useWorkflowListData: jest.fn(),
  useWorkflowListUi: jest.fn(),
}));

jest.mock("./WorkflowListFiltersPanel", () => ({
  __esModule: true,
  default: () => <div>filters panel</div>,
}));

jest.mock("./WorkflowClearFiltersAction", () => ({
  __esModule: true,
  default: ({ onClearFilters }: { onClearFilters: () => void }) => (
    <button type="button" onClick={onClearFilters}>
      クリア
    </button>
  ),
}));

const mockedUseWorkflowListData = jest.mocked(useWorkflowListData);
const mockedUseWorkflowListActions = jest.mocked(useWorkflowListActions);
const mockedUseWorkflowListUi = jest.mocked(useWorkflowListUi);

describe("WorkflowFiltersArea", () => {
  const closeAllPopovers = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockedUseWorkflowListData.mockReturnValue({
      anyFilterActive: false,
      filters: {
        category: "",
        applicationFrom: "",
        applicationTo: "",
        status: [],
        createdFrom: "",
        createdTo: "",
      },
    } as never);

    mockedUseWorkflowListActions.mockReturnValue({
      onClearFilters: jest.fn(),
      setFilter: jest.fn(),
    } as never);

    mockedUseWorkflowListUi.mockReturnValue({
      filterRowRef: { current: { closeAllPopovers } },
    } as never);
  });

  it("moves initial focus into dialog and restores focus to trigger on close", async () => {
    const user = userEvent.setup();
    render(<WorkflowFiltersArea />);

    const trigger = screen.getByRole("button", { name: "フィルター" });
    await user.click(trigger);

    const closeButton = screen.getByRole("button", {
      name: "フィルターダイアログを閉じる",
    });
    expect(closeButton).toHaveFocus();

    await user.click(closeButton);

    expect(trigger).toHaveFocus();
    expect(closeAllPopovers).toHaveBeenCalled();
  });

  it("traps focus within dialog with Tab and Shift+Tab", async () => {
    const user = userEvent.setup();
    const { container } = render(<WorkflowFiltersArea />);

    await user.click(screen.getByRole("button", { name: "フィルター" }));

    const panel = container.querySelector(".workflow-filter-dialog__panel");
    const closeButton = screen.getByRole("button", {
      name: "フィルターダイアログを閉じる",
    });
    const applyButton = screen.getByRole("button", { name: "一覧に反映" });

    expect(panel).toBeTruthy();

    applyButton.focus();
    fireEvent.keyDown(panel as HTMLElement, { key: "Tab" });
    expect(closeButton).toHaveFocus();

    closeButton.focus();
    fireEvent.keyDown(panel as HTMLElement, { key: "Tab", shiftKey: true });
    expect(applyButton).toHaveFocus();
  });
});
