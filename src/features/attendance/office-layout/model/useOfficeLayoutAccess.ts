import { useContext } from "react";

import { AuthContext } from "@/context/AuthContext";
import { StaffRole } from "@/hooks/useStaffs/useStaffs";

export function useOfficeLayoutAccess() {
  const { isCognitoUserRole } = useContext(AuthContext);

  const isAuthorized =
    isCognitoUserRole(StaffRole.OPERATOR) || isCognitoUserRole(StaffRole.ADMIN);

  return {
    isAuthorized,
  } as const;
}
