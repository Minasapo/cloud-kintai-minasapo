import { useMemo } from "react";

import ClockInButton from "@/shared/ui/time-recorder/ClockInButton";

import { WorkStatus, WorkStatusCodes } from "../../lib/common";

type ClockInItemProps = {
  workStatus: WorkStatus;
  onClick: () => void;
  disabled?: boolean;
};

export default function ClockInItem({
  workStatus,
  onClick,
  disabled = false,
}: ClockInItemProps) {
  const isBeforeWork = useMemo(
    () => workStatus.code === WorkStatusCodes.BEFORE_WORK,
    [workStatus.code]
  );

  return (
    <ClockInButton
      isBeforeWork={isBeforeWork}
      onClockIn={onClick}
      disabled={disabled}
    />
  );
}
