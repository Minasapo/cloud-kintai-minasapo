import RouterFallback from "@shared/ui/feedback/RouterFallback";
import { lazy, type ReactNode, Suspense } from "react";

const LazyMuiXDateProvider = lazy(
  () => import("@shared/providers/MuiXDateProvider"),
);

/**
 * Wraps a route element with the (lazily loaded) MUI X date provider. Use this
 * for routes that mount MUI X date pickers, so the provider only ships with the
 * routes that need it.
 */
export const wrapWithMuiXDateProvider = (node: ReactNode) => (
  <Suspense fallback={<RouterFallback />}>
    <LazyMuiXDateProvider>{node}</LazyMuiXDateProvider>
  </Suspense>
);
