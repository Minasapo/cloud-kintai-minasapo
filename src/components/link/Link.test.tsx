import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Link from "./Link";

describe("Link", () => {
  it("renders default label and href", () => {
    render(<Link />);

    const anchor = screen.getByRole("link", { name: "link" });

    expect(anchor).toBeInTheDocument();
    expect(anchor).toHaveAttribute("href", "/");
  });

  it("prefers children over label", () => {
    render(
      <Link label="fallback">
        <span>custom child</span>
      </Link>
    );

    expect(screen.queryByText("fallback")).not.toBeInTheDocument();
    expect(screen.getByText("custom child")).toBeInTheDocument();
  });

  it("fires onClick handler when clicked", async () => {
    const onClick = jest.fn();
    const user = userEvent.setup();

    render(
      <Link href="#" label="click me" onClick={onClick} data-testid="link" />
    );

    await user.click(screen.getByTestId("link"));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
