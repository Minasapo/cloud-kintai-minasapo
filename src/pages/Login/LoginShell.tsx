import { useAuthenticator } from "@aws-amplify/ui-react";
import { ComponentProps, useMemo } from "react";

import { AuthContext } from "@/context/AuthContext";
import { ThemeContextProvider } from "@/context/ThemeContext";
import useCognitoUser from "@/hooks/useCognitoUser";

import Login from "./Login";

type AuthContextValue = ComponentProps<typeof AuthContext.Provider>["value"];

export default function LoginShell() {
  const { user, signOut, authStatus } = useAuthenticator();
  const { cognitoUser, isCognitoUserRole } = useCognitoUser();

  const authContextValue = useMemo<AuthContextValue>(
    () => ({
      signOut,
      signIn: () => undefined,
      isCognitoUserRole,
      user,
      authStatus,
      cognitoUser,
    }),
    [signOut, isCognitoUserRole, user, authStatus, cognitoUser],
  );
  return (
    <ThemeContextProvider>
      <AuthContext.Provider value={authContextValue}>
        <Login />
      </AuthContext.Provider>
    </ThemeContextProvider>
  );
}
