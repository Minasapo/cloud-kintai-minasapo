import { AuthEventData, AuthStatus } from "@aws-amplify/ui";
import { StaffRole } from "@entities/staff/model/useStaffs/useStaffs";
import type { AuthUser } from "aws-amplify/auth";
import { createContext } from "react";

import { CognitoUser } from "../hooks/useCognitoUser";

type AuthContextProps = {
  signOut: (data?: AuthEventData | undefined) => void;
  signIn: () => void;
  isCognitoUserRole: (role: StaffRole) => boolean;
  user?: AuthUser;
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
