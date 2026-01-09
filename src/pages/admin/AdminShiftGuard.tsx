import React from "react";
import { Navigate } from "react-router-dom";

import useAuthenticatedUser from "../../hooks/useAuthenticatedUser";
import { useDeveloperFlag } from "../../hooks/useStaff/useDeveloperFlag";
import NotFound from "../NotFound";

export default function AdminShiftGuard({
  children,
}: {
  children?: React.ReactNode;
}) {
  const { authenticatedUser, loading: authLoading } = useAuthenticatedUser();
  const { isDeveloper, loading } = useDeveloperFlag(
    authenticatedUser?.cognitoUserId
  );

  if (authLoading || loading) return null; // or a spinner if desired

  if (!isDeveloper) {
    // Developer flag not present -> show NotFound (same behavior as AdminLayout)
    return <NotFound />;
  }

  return <>{children ?? <Navigate to="/admin/shift" replace />}</>;
}
