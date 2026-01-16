import { ComponentProps, ComponentType, ReactNode } from "react";
import type {
  ActionFunction,
  LazyRouteFunction,
  LoaderFunction,
  RouteObject,
  ShouldRevalidateFunction,
} from "react-router-dom";

/**
 * Note: `any` is used here for ComponentType generics as we need maximum flexibility
 * for lazy-loaded components. This is a common pattern in router configurations
 * where component prop types are determined at runtime.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LazyModule<T extends ComponentType<any>> = { default: T };

type LazyRouteOptions = {
  wrap?: (node: ReactNode) => ReactNode;
  loader?: LoaderFunction;
  action?: ActionFunction;
  shouldRevalidate?: ShouldRevalidateFunction;
  errorElement?: ReactNode;
  ErrorBoundary?: ComponentType<{ error: unknown }>;
  hydrateFallback?: ReactNode | ComponentType;
};

/**
 * Note: `any` is used here for ComponentType generics as we need maximum flexibility
 * for lazy-loaded components. This is a common pattern in router configurations.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createLazyRoute<T extends ComponentType<any>>(
  loader: () => Promise<LazyModule<T>>,
  options?: LazyRouteOptions
): LazyRouteFunction<RouteObject> {
  return async () => {
    const { default: Component } = await loader();

    const Wrapped = (props: ComponentProps<T>) => {
      const node = <Component {...props} />;
      return options?.wrap ? <>{options.wrap(node)}</> : node;
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
