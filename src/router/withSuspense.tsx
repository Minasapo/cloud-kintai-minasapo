import PageLoader from "@shared/ui/feedback/PageLoader";
import {
  type ComponentType,
  createElement,
  type LazyExoticComponent,
  type ReactNode,
  Suspense,
} from "react";

export function withSuspense<TProps extends object>(
  Component: LazyExoticComponent<ComponentType<TProps>>,
  props?: TProps
): ReactNode {
  return (
    <Suspense fallback={<PageLoader />}>
      {createElement(Component, props)}
    </Suspense>
  );
}
