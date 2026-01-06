import { render, screen } from "@testing-library/react";
import React from "react";

import { withSuspense } from "../withSuspense";

describe("withSuspense", () => {
  const Component: React.FC<{ label?: string }> = ({ label = "content" }) => (
    <div data-testid="content">{label}</div>
  );

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("shows PageLoader while lazy component is loading, then renders component", async () => {
    const lazy = React.lazy(
      () =>
        new Promise<{ default: React.FC }>((resolve) =>
          setTimeout(() => resolve({ default: Component }), 10)
        )
    );

    render(<>{withSuspense(lazy)}</>);

    expect(screen.getByRole("status")).toBeInTheDocument();

    jest.runAllTimers();

    expect(await screen.findByTestId("content")).toHaveTextContent("content");
  });

  it("passes props to lazy component", async () => {
    const lazy = React.lazy(
      () =>
        new Promise<{ default: React.FC<{ label?: string }> }>((resolve) =>
          setTimeout(() => resolve({ default: Component }), 10)
        )
    );

    render(<>{withSuspense(lazy, { label: "passed" })}</>);

    jest.runAllTimers();

    expect(await screen.findByTestId("content")).toHaveTextContent("passed");
  });
});
