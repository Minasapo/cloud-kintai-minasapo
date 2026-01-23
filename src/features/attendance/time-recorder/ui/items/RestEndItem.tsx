import { useMemo } from "react";

import RestEndButton from "@/shared/ui/time-recorder/RestEndButton";

import { WorkStatus, WorkStatusCodes } from "../../lib/common";

export default function RestEndItem({
  workStatus,
  onClick,
  disabled = false,
}: {
  workStatus: WorkStatus | null;
  onClick: () => void;
  disabled?: boolean;
}) {
  const isResting = useMemo(
    () => workStatus?.code === WorkStatusCodes.RESTING,
    [workStatus]
  );

  return (
    <RestEndButton
      isResting={Boolean(isResting)}
      onRestEnd={onClick}
      disabled={disabled}
    />
  );
}
