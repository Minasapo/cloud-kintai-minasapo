import {
  type ComponentProps,
  type ComponentType,
  type LazyExoticComponent,
  type ReactNode,
  Suspense,
} from "react";

import PageLoader from "@/shared/ui/feedback/PageLoader";

/**
 * Note: `any` is used here for ComponentType generics to allow wrapping
 * any component type with Suspense, regardless of its props.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
