import { render, screen } from "@testing-library/react";
import React from "react";

import { createLazyRoute } from "../lazyRoute";

describe("createLazyRoute", () => {
  const Component: React.FC<{ label?: string }> = ({ label = "hello" }) => (
    <div data-testid="content">{label}</div>
  );

  it("returns Component that renders lazy loaded module", async () => {
    const lazy = createLazyRoute(async () => ({ default: Component }));

    const route = await lazy();
    render(<route.Component />);

    expect(screen.getByTestId("content")).toHaveTextContent("hello");
  });

  it("wraps rendered node when wrap option is provided", async () => {
    const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <div data-testid="wrapper">{children}</div>
    );

    const lazy = createLazyRoute(async () => ({ default: Component }), {
      wrap: (node) => <Wrapper>{node}</Wrapper>,
    });

    const route = await lazy();
    render(<route.Component />);

    expect(screen.getByTestId("wrapper")).toBeInTheDocument();
    expect(screen.getByTestId("content")).toHaveTextContent("hello");
  });

  it("attaches loader, action, and shouldRevalidate when provided", async () => {
    const loader = jest.fn();
    const action = jest.fn();
    const shouldRevalidate = jest.fn();

    const lazy = createLazyRoute(async () => ({ default: Component }), {
      loader,
      action,
      shouldRevalidate,
    });

    const route = await lazy();

    expect(route.loader).toBe(loader);
    expect(route.action).toBe(action);
    expect(route.shouldRevalidate).toBe(shouldRevalidate);
  });

  it("uses ErrorBoundary from errorElement when provided", async () => {
    const errorElement = <div data-testid="error">error</div>;
    const lazy = createLazyRoute(async () => ({ default: Component }), {
      errorElement,
    });

    const route = await lazy();
    const ErrorBoundary = route.ErrorBoundary as React.FC<{ error: unknown }>;

    render(<ErrorBoundary error={new Error("boom")} />);

    expect(screen.getByTestId("error")).toHaveTextContent("error");
  });

  it("supports hydrateFallback as element or component", async () => {
    const elementFallback = <div data-testid="fallback-element">fallback</div>;
    const lazyElement = createLazyRoute(async () => ({ default: Component }), {
      hydrateFallback: elementFallback,
    });

    const routeFromElement = await lazyElement();
    const HydrateFallbackElement = routeFromElement.HydrateFallback as React.FC;
    render(<HydrateFallbackElement />);
    expect(screen.getByTestId("fallback-element")).toBeInTheDocument();

    const ComponentFallback: React.FC = () => (
      <div data-testid="fallback-component">component</div>
    );
    const lazyComponent = createLazyRoute(
      async () => ({ default: Component }),
      {
        hydrateFallback: ComponentFallback,
      }
    );
    const routeFromComponent = await lazyComponent();
    const HydrateFallbackComponent =
      routeFromComponent.HydrateFallback as React.FC;
    render(<HydrateFallbackComponent />);
    expect(screen.getByTestId("fallback-component")).toBeInTheDocument();
  });
});
