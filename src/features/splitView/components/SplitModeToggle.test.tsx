import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SplitModeToggle } from "./SplitModeToggle";

describe("SplitModeToggle", () => {
  it("renders with single mode icon", () => {
    const onToggle = jest.fn();
    render(<SplitModeToggle mode="single" onToggle={onToggle} />);

    const button = screen.getByRole("button", {
      name: "スプリットモードに切り替え",
    });
    expect(button).toBeInTheDocument();
  });

  it("renders with split mode icon", () => {
    const onToggle = jest.fn();
    render(<SplitModeToggle mode="split" onToggle={onToggle} />);

    const button = screen.getByRole("button", {
      name: "シングルモードに切り替え",
    });
    expect(button).toBeInTheDocument();
  });

  it("calls onToggle when button is clicked", async () => {
    const user = userEvent.setup();
    const onToggle = jest.fn();
    render(<SplitModeToggle mode="single" onToggle={onToggle} />);

    const button = screen.getByRole("button", {
      name: "スプリットモードに切り替え",
    });
    await user.click(button);

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("is disabled when disabled prop is true", () => {
    const onToggle = jest.fn();
    render(<SplitModeToggle mode="single" onToggle={onToggle} disabled />);

    const button = screen.getByRole("button", {
      name: "スプリットモードに切り替え",
    });
    expect(button).toBeDisabled();
  });

  it("is enabled when disabled prop is false", () => {
    const onToggle = jest.fn();
    render(
      <SplitModeToggle mode="single" onToggle={onToggle} disabled={false} />
    );

    const button = screen.getByRole("button", {
      name: "スプリットモードに切り替え",
    });
    expect(button).not.toBeDisabled();
  });
});
