import { useMemo } from "react";

import GoDirectlyButton from "@/shared/ui/time-recorder/GoDirectlyButton";

import { WorkStatus, WorkStatusCodes } from "../common";

interface GoDirectlyItemProps {
  workStatus: WorkStatus | null;
  onClick: () => void;
}

export default function GoDirectlyItem({
  workStatus,
  onClick,
}: GoDirectlyItemProps) {
  const isBeforeWork = useMemo(
    () => workStatus?.code === WorkStatusCodes.BEFORE_WORK,
    [workStatus]
  );

  return (
    <GoDirectlyButton
      isBeforeWork={Boolean(isBeforeWork)}
      onGoDirectly={onClick}
    />
  );
}
