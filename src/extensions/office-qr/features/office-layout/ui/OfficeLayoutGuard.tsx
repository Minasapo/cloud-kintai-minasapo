import { PropsWithChildren, ReactNode } from "react";

import { useOfficeLayoutAccess } from "../model/useOfficeLayoutAccess";

type OfficeLayoutGuardProps = PropsWithChildren<{
  fallback?: ReactNode;
}>;

export function OfficeLayoutGuard({
  children,
  fallback = null,
}: OfficeLayoutGuardProps) {
  const { isAuthorized } = useOfficeLayoutAccess();

  if (!isAuthorized) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
