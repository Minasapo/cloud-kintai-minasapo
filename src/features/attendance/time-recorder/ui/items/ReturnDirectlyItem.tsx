import { useMemo } from "react";

import ReturnDirectlyButton from "@/shared/ui/time-recorder/ReturnDirectlyButton";

import { WorkStatus, WorkStatusCodes } from "../../lib/common";

export default function ReturnDirectly({
  workStatus,
  onClick,
}: {
  workStatus: WorkStatus | null;
  onClick: () => void;
}) {
  const isWorking = useMemo(
    () => workStatus?.code === WorkStatusCodes.WORKING,
    [workStatus?.code]
  );

  return (
    <ReturnDirectlyButton
      isWorking={Boolean(isWorking)}
      onReturnDirectly={onClick}
    />
  );
}
