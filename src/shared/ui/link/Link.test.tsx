import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import Link from "./Link";

const renderWithRouter = (ui: React.ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

describe("Link", () => {
  it("renders default label and href", () => {
    renderWithRouter(<Link />);

    const anchor = screen.getByRole("link", { name: "link" });

    expect(anchor).toBeInTheDocument();
    expect(anchor).toHaveAttribute("href", "/");
  });

  it("prefers children over label", () => {
    renderWithRouter(
      <Link label="fallback">
        <span>custom child</span>
      </Link>,
    );

    expect(screen.queryByText("fallback")).not.toBeInTheDocument();
    expect(screen.getByText("custom child")).toBeInTheDocument();
  });

  it("fires onClick handler when clicked", async () => {
    const onClick = jest.fn();
    const user = userEvent.setup();

    renderWithRouter(
      <Link href="#" label="click me" onClick={onClick} data-testid="link" />,
    );

    await user.click(screen.getByTestId("link"));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders internal href with router link", () => {
    renderWithRouter(<Link href="/attendance/list" label="勤怠一覧" />);

    expect(screen.getByRole("link", { name: "勤怠一覧" })).toHaveAttribute(
      "href",
      "/attendance/list",
    );
  });

  it("renders external href as anchor link", () => {
    renderWithRouter(
      <Link href="https://example.com" label="外部リンク" target="_blank" />,
    );

    expect(screen.getByRole("link", { name: "外部リンク" })).toHaveAttribute(
      "href",
      "https://example.com",
    );
  });
});
