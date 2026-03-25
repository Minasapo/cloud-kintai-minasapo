import { ReasonItem } from "@/features/attendance/edit/ui/mobileEditor/staffCommentInputUtils";

type ReasonButtonsProps = {
  reasons: ReasonItem[];
  disabled: boolean;
  onSelectReason: (reason: string) => void;
};

export function StaffCommentReasonButtons({
  reasons,
  disabled,
  onSelectReason,
}: ReasonButtonsProps) {
  return (
    <div className="staff-comment-input__quick-inputs">
      {reasons.map((reason, index) => (
        <button
          key={`${reason.reason}-${index}`}
          type="button"
          data-testid={`staff-comment-reason-chip-${index}`}
          className="staff-comment-input__reason-button"
          disabled={disabled}
          onClick={() => onSelectReason(reason.reason)}
        >
          <span className="staff-comment-input__reason-icon" aria-hidden>
            +
          </span>
          <span>{reason.reason}</span>
        </button>
      ))}
    </div>
  );
}
