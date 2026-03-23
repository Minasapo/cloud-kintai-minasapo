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
  const isBeforeWork = workStatus.code === WorkStatusCodes.BEFORE_WORK;

  return (
    <ClockInButton
      key={String(isBeforeWork)}
      isBeforeWork={isBeforeWork}
      onClockIn={onClick}
      disabled={disabled}
    />
  );
}
