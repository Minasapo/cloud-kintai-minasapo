import { useContext } from "react";

import { AuthContext } from "@/context/AuthContext";
import {
  useStaffs as useStaffsEntity,
  mappingStaffRole,
  roleLabelMap,
  type StaffType,
  StaffRole,
} from "@entities/staff/model/useStaffs/useStaffs";

export { mappingStaffRole, roleLabelMap, StaffRole };
export type { StaffType };

export function useStaffs() {
  const { authStatus } = useContext(AuthContext);
  const isAuthenticated = authStatus === "authenticated";
  return useStaffsEntity({ isAuthenticated });
}
