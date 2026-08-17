import { render, screen } from "@testing-library/react";
import React from "react";

import { createLazyRoute } from "../lazyRoute";

describe("createLazyRoute", () => {
  const Component: React.FC<{ label?: string }> = ({ label = "hello" }) => (
    <div data-testid="content">{label}</div>
  );

  it("遅延読み込みモジュールを描画する Component を返すこと", async () => {
    const lazy = createLazyRoute(async () => ({ default: Component }));

    const route = await lazy();
    const RouteComponent = route.Component!;
    render(<RouteComponent />);

    expect(screen.getByTestId("content")).toHaveTextContent("hello");
  });

  it("wrap オプション指定時に描画ノードをラップすること", async () => {
    const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <div data-testid="wrapper">{children}</div>
    );

    const lazy = createLazyRoute(async () => ({ default: Component }), {
      wrap: (node) => <Wrapper>{node}</Wrapper>,
    });

    const route = await lazy();
    const RouteComponent = route.Component!;
    render(<RouteComponent />);

    expect(screen.getByTestId("wrapper")).toBeInTheDocument();
    expect(screen.getByTestId("content")).toHaveTextContent("hello");
  });

  it("loader/action/shouldRevalidate 指定時にそれらを設定すること", async () => {
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

  it("errorElement 指定時にそれを ErrorBoundary として利用すること", async () => {
    const errorElement = <div data-testid="error">error</div>;
    const lazy = createLazyRoute(async () => ({ default: Component }), {
      errorElement,
    });

    const route = await lazy();
    const ErrorBoundary = route.ErrorBoundary as React.FC<{ error: unknown }>;

    render(<ErrorBoundary error={new Error("boom")} />);

    expect(screen.getByTestId("error")).toHaveTextContent("error");
  });

  it("boundary 未指定時にデフォルト ErrorBoundary を設定すること", async () => {
    const lazy = createLazyRoute(async () => ({ default: Component }));
    const route = await lazy();

    expect(route.ErrorBoundary).toBeDefined();
  });

  it("fallback 未指定時にデフォルト HydrateFallback を設定すること", async () => {
    const lazy = createLazyRoute(async () => ({ default: Component }));
    const route = await lazy();

    expect(route.HydrateFallback).toBeDefined();
  });

  it("コンポーネントを feature error boundary でラップすること", async () => {
    const ThrowingComponent: React.FC = () => {
      throw new Error("feature crash");
    };
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const lazy = createLazyRoute(async () => ({ default: ThrowingComponent }));
    const route = await lazy();
    const RouteComponent = route.Component!;

    render(<RouteComponent />);

    expect(
      screen.getByText("画面の一部で問題が発生しました")
    ).toBeInTheDocument();
    expect(screen.getByText("feature crash")).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });

  it("hydrateFallback に element と component の両方を指定できること", async () => {
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
