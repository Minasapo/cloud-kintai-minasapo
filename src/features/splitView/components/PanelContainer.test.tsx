import { render, screen } from "@testing-library/react";

import { PanelContainer } from "./PanelContainer";

describe("PanelContainer", () => {
  it("renders title and children correctly", () => {
    render(
      <PanelContainer title="Test Panel">
        <div>Test Content</div>
      </PanelContainer>
    );

    expect(screen.getByText("Test Panel")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("renders close button when onClose is provided", () => {
    const onClose = jest.fn();
    render(
      <PanelContainer title="Test Panel" onClose={onClose}>
        <div>Test Content</div>
      </PanelContainer>
    );

    expect(screen.getByLabelText("パネルを閉じる")).toBeInTheDocument();
  });

  it("does not render close button when onClose is not provided", () => {
    render(
      <PanelContainer title="Test Panel">
        <div>Test Content</div>
      </PanelContainer>
    );

    expect(screen.queryByLabelText("パネルを閉じる")).not.toBeInTheDocument();
  });
});
