import { ShiftManagementBoard } from "@features/shift/management";
import { useContext } from "react";

import { AppConfigContext } from "@/context/AppConfigContext";
import type { ShiftDisplayMode } from "@/entities/app-config/model/useAppConfig";
import ShiftCollaborativePage from "@/pages/shift/collaborative/ShiftCollaborativePage";

export const resolveShiftManagementMode = (
  collaborativeEnabled: boolean,
  defaultMode: ShiftDisplayMode,
): ShiftDisplayMode => {
  if (!collaborativeEnabled) {
    return "normal";
  }

  return defaultMode;
};

export default function ShiftManagementPage() {
  const { getShiftCollaborativeEnabled, getShiftDefaultMode } =
    useContext(AppConfigContext);

  const selectedMode = resolveShiftManagementMode(
    getShiftCollaborativeEnabled(),
    getShiftDefaultMode(),
  );

  return selectedMode === "collaborative" ? (
    <ShiftCollaborativePage />
  ) : (
    <ShiftManagementBoard />
  );
}
