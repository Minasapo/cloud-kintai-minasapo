import SignInOutButtonView from "@shared/ui/header/SignInOutButton";
import { useContext } from "react";

import { AuthContext } from "@/context/AuthContext";

export function SignInOutButton() {
  const { signOut, signIn, cognitoUser, authStatus } = useContext(AuthContext);

  return (
    <SignInOutButtonView
      isAuthenticated={authStatus === "authenticated"}
      isConfiguring={authStatus === "configuring"}
      staffName={cognitoUser?.familyName}
      onSignIn={signIn}
      onSignOut={signOut}
    />
  );
}
