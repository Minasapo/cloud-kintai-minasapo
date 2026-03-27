import { useAuthenticator } from "@aws-amplify/ui-react";
import { StaffRole } from "@entities/staff/model/useStaffs/useStaffs";
import type { ReactNode } from "react";
import { useMemo } from "react";

import { AuthContext } from "@/context/AuthContext";
import useCognitoUser from "@/hooks/useCognitoUser";

type SessionProviderProps = {
  children: ReactNode;
};

export function SessionProvider({ children }: SessionProviderProps) {
  const { user, signOut, authStatus } = useAuthenticator();
  const {
    cognitoUser,
    isCognitoUserRole,
    loading: cognitoUserLoading,
  } = useCognitoUser();

  const roles = cognitoUser?.roles ?? [];
  const isAuthenticated =
    authStatus === "authenticated" && !cognitoUserLoading && Boolean(cognitoUser);
  const isLoading =
    authStatus === "configuring" ||
    (authStatus === "authenticated" && cognitoUserLoading);

  const value = useMemo(
    () => ({
      session: {
        user,
        authStatus,
        cognitoUser,
        roles,
      },
      signOut,
      signIn: () => {
        window.location.assign("/login");
      },
      hasRole: (role: StaffRole) => isCognitoUserRole(role),
      isCognitoUserRole,
      isAuthenticated,
      isLoading,
      roles,
      user,
      authStatus,
      cognitoUser,
    }),
    [
      authStatus,
      cognitoUser,
      isAuthenticated,
      isLoading,
      isCognitoUserRole,
      roles,
      signOut,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
