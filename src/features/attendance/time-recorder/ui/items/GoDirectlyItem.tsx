import GoDirectlyButton from "@/shared/ui/time-recorder/GoDirectlyButton";

import { WorkStatus, WorkStatusCodes } from "../../lib/common";

interface GoDirectlyItemProps {
  workStatus: WorkStatus | null;
  onClick: () => void;
  disabled?: boolean;
}

export default function GoDirectlyItem({
  workStatus,
  onClick,
  disabled = false,
}: GoDirectlyItemProps) {
  const isBeforeWork = workStatus?.code === WorkStatusCodes.BEFORE_WORK;

  return (
    <GoDirectlyButton
      key={String(isBeforeWork)}
      isBeforeWork={Boolean(isBeforeWork)}
      onGoDirectly={onClick}
      disabled={disabled}
    />
  );
}
