import {
  Suspense,
  type ComponentProps,
  type ComponentType,
  type LazyExoticComponent,
  type ReactNode,
} from "react";

import PageLoader from "../components/common/PageLoader";

export function withSuspense<T extends ComponentType<any>>(
  Component: LazyExoticComponent<T>,
  props?: ComponentProps<T>
): ReactNode {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component {...(props ?? ({} as ComponentProps<T>))} />
    </Suspense>
  );
}

