import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PanelHeader } from "./PanelHeader";

describe("PanelHeader", () => {
  it("renders title correctly", () => {
    render(<PanelHeader title="Test Panel" />);
    expect(screen.getByText("Test Panel")).toBeInTheDocument();
  });

  it("renders close button when onClose is provided", () => {
    const onClose = jest.fn();
    render(<PanelHeader title="Test Panel" onClose={onClose} />);
    expect(screen.getByLabelText("パネルを閉じる")).toBeInTheDocument();
  });

  it("does not render close button when onClose is not provided", () => {
    render(<PanelHeader title="Test Panel" />);
    expect(screen.queryByLabelText("パネルを閉じる")).not.toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(<PanelHeader title="Test Panel" onClose={onClose} />);

    const closeButton = screen.getByLabelText("パネルを閉じる");
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
