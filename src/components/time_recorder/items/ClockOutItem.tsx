import { useMemo } from "react";

import ClockOutButton from "@/shared/ui/time-recorder/ClockOutButton";

import { WorkStatus, WorkStatusCodes } from "../common";

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
  const isWorking = useMemo(
    () => workStatus?.code === WorkStatusCodes.WORKING,
    [workStatus?.code]
  );

  return (
    <ClockOutButton
      isWorking={Boolean(isWorking)}
      onClockOut={onClick}
      disabled={disabled}
    />
  );
}
