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
  const isResting = workStatus?.code === WorkStatusCodes.RESTING;

  return (
    <RestEndButton
      key={String(isResting)}
      isResting={Boolean(isResting)}
      onRestEnd={onClick}
      disabled={disabled}
    />
  );
}
