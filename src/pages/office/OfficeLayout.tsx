import { OfficeLayoutGuard } from "@features/attendance/office-layout";
import { Outlet } from "react-router-dom";

import NotFound from "../NotFound";

export default function OfficeLayout() {
  return (
    <OfficeLayoutGuard fallback={<NotFound />}>
      <Outlet />
    </OfficeLayoutGuard>
  );
}
