import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import useAuthenticatedUser from "../../hooks/useAuthenticatedUser";
import fetchStaff from "../../hooks/useStaff/fetchStaff";
import NotFound from "../NotFound";

export default function AdminShiftGuard({
  children,
}: {
  children?: React.ReactNode;
}) {
  const { authenticatedUser, loading: authLoading } = useAuthenticatedUser();
  const [loading, setLoading] = useState(true);
  const [isDeveloper, setIsDeveloper] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      if (!authenticatedUser?.cognitoUserId) {
        if (mounted) {
          setIsDeveloper(false);
          setLoading(false);
        }
        return;
      }

      try {
        const staff = await fetchStaff(authenticatedUser.cognitoUserId);
        const developerFlag = (staff as unknown as Record<string, unknown>)
          .developer as boolean | undefined;
        if (mounted) setIsDeveloper(Boolean(developerFlag));
      } catch {
        // If staff not found or error, deny access
        if (mounted) setIsDeveloper(false);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [authenticatedUser]);

  if (authLoading || loading) return null; // or a spinner if desired

  if (!isDeveloper) {
    // Developer flag not present -> show NotFound (same behavior as AdminLayout)
    return <NotFound />;
  }

  return <>{children ?? <Navigate to="/admin/shift" replace />}</>;
}
