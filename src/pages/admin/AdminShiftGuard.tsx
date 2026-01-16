import React from "react";
import { Navigate } from "react-router-dom";

export default function AdminShiftGuard({
  children,
}: {
  children?: React.ReactNode;
}) {
  return <>{children ?? <Navigate to="/admin/shift" replace />}</>;
}
