import RestStartButton from "@/shared/ui/time-recorder/RestStartButton";

import { WorkStatus, WorkStatusCodes } from "../../lib/common";

type RestStartItemProps = {
  workStatus: WorkStatus | null;
  onClick: () => void;
  disabled?: boolean;
};

export default function RestStartItem({
  workStatus,
  onClick,
  disabled = false,
}: RestStartItemProps) {
  const isWorking = workStatus?.code === WorkStatusCodes.WORKING;

  return (
    <RestStartButton
      key={String(isWorking)}
      isWorking={Boolean(isWorking)}
      onRestStart={onClick}
      disabled={disabled}
    />
  );
}
