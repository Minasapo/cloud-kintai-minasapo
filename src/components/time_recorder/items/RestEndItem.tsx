import { useMemo } from "react";

import RestEndButton from "@/shared/ui/time-recorder/RestEndButton";

import { WorkStatus, WorkStatusCodes } from "../common";

export default function RestEndItem({
  workStatus,
  onClick,
}: {
  workStatus: WorkStatus | null;
  onClick: () => void;
}) {
  const isResting = useMemo(
    () => workStatus?.code === WorkStatusCodes.RESTING,
    [workStatus]
  );

  return <RestEndButton isResting={Boolean(isResting)} onRestEnd={onClick} />;
}
