import { useContext } from "react";
import { Outlet } from "react-router-dom";

import { AuthContext } from "../../context/AuthContext";
import { StaffRole } from "@entities/staff/model/useStaffs/useStaffs";
import NotFound from "../NotFound";

export default function AdminLayout() {
  const { isCognitoUserRole } = useContext(AuthContext);

  if (!isCognitoUserRole(StaffRole.ADMIN)) {
    return <NotFound />;
  }

  return <Outlet />;
}
