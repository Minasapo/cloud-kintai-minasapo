import {
  type ComponentProps,
  type ComponentType,
  type LazyExoticComponent,
  type ReactNode,
  Suspense,
} from "react";

import PageLoader from "@/shared/ui/feedback/PageLoader";

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
