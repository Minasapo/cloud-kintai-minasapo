import { AmplifyUser, AuthEventData, AuthStatus } from "@aws-amplify/ui";
import { createContext } from "react";

import { CognitoUser } from "../hooks/useCognitoUser";
import { StaffRole } from "../hooks/useStaffs/useStaffs";

type AuthContextProps = {
  signOut: (data?: AuthEventData | undefined) => void;
  signIn: () => void;
  isCognitoUserRole: (role: StaffRole) => boolean;
  user?: AmplifyUser;
  authStatus?: AuthStatus;
  cognitoUser?: CognitoUser | null;
};

export const AuthContext = createContext<AuthContextProps>({
  signOut: () => {
    console.log("The process is not implemented.");
  },
  signIn: () => {
    console.log("The process is not implemented.");
  },
  isCognitoUserRole: () => false,
});
