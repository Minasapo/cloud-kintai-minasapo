import { OfficeLayoutGuard } from "@features/attendance/office-layout";
import NotFound from "@pages/NotFound";
import { Outlet } from "react-router-dom";

export default function OfficeLayoutPage() {
  return (
    <OfficeLayoutGuard fallback={<NotFound />}>
      <Outlet />
    </OfficeLayoutGuard>
  );
}
