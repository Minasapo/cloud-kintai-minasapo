import { FeatureErrorBoundary } from "@shared/ui/feedback";
import { ComponentType, ReactNode } from "react";
import type {
  ActionFunction,
  LazyRouteFunction,
  LoaderFunction,
  RouteObject,
  ShouldRevalidateFunction,
} from "react-router-dom";

import RouteErrorBoundary from "./RouteErrorBoundary";

type LazyModule<TProps extends object> = { default: ComponentType<TProps> };

type LazyRouteOptions = {
  wrap?: (node: ReactNode) => ReactNode;
  loader?: LoaderFunction;
  action?: ActionFunction;
  shouldRevalidate?: ShouldRevalidateFunction;
  errorElement?: ReactNode;
  ErrorBoundary?: ComponentType<{ error: unknown }>;
  hydrateFallback?: ReactNode | ComponentType;
};

export function createLazyRoute<TProps extends object>(
  loader: () => Promise<LazyModule<TProps>>,
  options?: LazyRouteOptions
): LazyRouteFunction<RouteObject> {
  return async () => {
    const { default: Component } = await loader();

    const Wrapped = (props: TProps) => {
      const node = <Component {...props} />;
      const wrappedNode = options?.wrap ? <>{options.wrap(node)}</> : node;
      return <FeatureErrorBoundary>{wrappedNode}</FeatureErrorBoundary>;
    };

    const result: Record<string, unknown> = {
      Component: Wrapped,
    };

    if (options?.loader) {
      result.loader = options.loader;
    }

    if (options?.action) {
      result.action = options.action;
    }

    if (options?.shouldRevalidate) {
      result.shouldRevalidate = options.shouldRevalidate;
    }

    if (options?.ErrorBoundary) {
      result.ErrorBoundary = options.ErrorBoundary;
    } else if (options?.errorElement) {
      result.ErrorBoundary = function LazyRouteErrorBoundary() {
        return <>{options.errorElement}</>;
      };
    } else {
      result.ErrorBoundary = RouteErrorBoundary;
    }

    if (options?.hydrateFallback) {
      if (typeof options.hydrateFallback === "function") {
        result.HydrateFallback = options.hydrateFallback;
      } else {
        result.HydrateFallback = function LazyRouteHydrateFallback() {
          return <>{options.hydrateFallback}</>;
        };
      }
    }

    return result as Awaited<ReturnType<LazyRouteFunction<RouteObject>>>;
  };
}
