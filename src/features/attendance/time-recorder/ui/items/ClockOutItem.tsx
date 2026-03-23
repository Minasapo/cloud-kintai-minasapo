import ClockOutButton from "@/shared/ui/time-recorder/ClockOutButton";

import { WorkStatus, WorkStatusCodes } from "../../lib/common";

type ClockOutItemProps = {
  workStatus: WorkStatus | null;
  onClick: () => void;
  disabled?: boolean;
};

export default function ClockOutItem({
  workStatus,
  onClick,
  disabled = false,
}: ClockOutItemProps) {
  const isWorking = workStatus?.code === WorkStatusCodes.WORKING;

  return (
    <ClockOutButton
      key={String(isWorking)}
      isWorking={Boolean(isWorking)}
      onClockOut={onClick}
      disabled={disabled}
    />
  );
}
