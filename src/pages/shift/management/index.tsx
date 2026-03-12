import { ShiftManagementBoard } from "@features/shift/management";
import { useContext } from "react";

import { AppConfigContext } from "@/context/AppConfigContext";
import type { ShiftDisplayMode } from "@/entities/app-config/model/useAppConfig";
import ShiftCollaborativePage from "@/pages/shift/collaborative/ShiftCollaborativePage";

export const resolveShiftManagementMode = (
  defaultMode: ShiftDisplayMode,
): ShiftDisplayMode => {
  return defaultMode;
};

export default function ShiftManagementPage() {
  const { getShiftDefaultMode } = useContext(AppConfigContext);

  const selectedMode = resolveShiftManagementMode(getShiftDefaultMode());

  return selectedMode === "collaborative" ? (
    <ShiftCollaborativePage />
  ) : (
    <ShiftManagementBoard />
  );
}
