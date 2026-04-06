import { useContext, useMemo } from "react";

import { AuthContext } from "@/context/AuthContext";

export function useAuthSessionSummary() {
  const {
    authStatus,
    isAuthenticated = false,
    isLoading = false,
    roles = [],
    isCognitoUserRole,
  } = useContext(AuthContext);

  return useMemo(
    () => ({
      authStatus,
      isAuthenticated,
      isLoading,
      roles,
      isCognitoUserRole,
    }),
    [authStatus, isAuthenticated, isLoading, isCognitoUserRole, roles],
  );
}
