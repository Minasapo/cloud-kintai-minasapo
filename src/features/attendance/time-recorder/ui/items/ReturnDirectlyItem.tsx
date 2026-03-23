import ReturnDirectlyButton from "@/shared/ui/time-recorder/ReturnDirectlyButton";

import { WorkStatus, WorkStatusCodes } from "../../lib/common";

export default function ReturnDirectly({
  workStatus,
  onClick,
  disabled = false,
}: {
  workStatus: WorkStatus | null;
  onClick: () => void;
  disabled?: boolean;
}) {
  const isWorking = workStatus?.code === WorkStatusCodes.WORKING;

  return (
    <ReturnDirectlyButton
      key={String(isWorking)}
      isWorking={Boolean(isWorking)}
      onReturnDirectly={onClick}
      disabled={disabled}
    />
  );
}
