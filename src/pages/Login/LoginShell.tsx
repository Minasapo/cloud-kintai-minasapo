import { useAuthenticator } from "@aws-amplify/ui-react";
import { ThemeProvider } from "@mui/material/styles";
import { ComponentProps, useMemo } from "react";

import { AuthContext } from "@/context/AuthContext";
import { ThemeContextProvider } from "@/context/ThemeContext";
import useCognitoUser from "@/hooks/useCognitoUser";
import { createAppTheme } from "@/shared/lib/theme";

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

  const appTheme = useMemo(() => createAppTheme(), []);

  return (
    <ThemeContextProvider>
      <ThemeProvider theme={appTheme}>
        <AuthContext.Provider value={authContextValue}>
          <Login />
        </AuthContext.Provider>
      </ThemeProvider>
    </ThemeContextProvider>
  );
}
