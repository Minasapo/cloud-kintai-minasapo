import { useCallback, useEffect, useRef, useState } from "react";

import { INPUT_PLACEHOLDER, sanitizeCapacityValue } from "../shiftPlanUtils";

type EditableCapacityCellProps = {
  value: string;
  labelText: string;
  labelColor: string;
  onCommit: (value: string) => void;
  onTabNextDay?: () => void;
};

const EditableCapacityCell: React.FC<EditableCapacityCellProps> = ({
  value,
  labelText,
  labelColor,
  onCommit,
  onTabNextDay,
}: EditableCapacityCellProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const skipBlurCommitRef = useRef(false);

  // Sync draft to value when not editing
  useEffect(() => {
    if (!isEditing) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraft(value);
    }
  }, [value, isEditing]);

  const handleCommit = useCallback(() => {
    const normalized = sanitizeCapacityValue(draft);
    onCommit(normalized);
    setIsEditing(false);
  }, [draft, onCommit]);

  const handleCancel = useCallback(() => {
    setDraft(value);
    setIsEditing(false);
  }, [value]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        skipBlurCommitRef.current = true;
        handleCommit();
      } else if (event.key === "Escape") {
        event.preventDefault();
        handleCancel();
      } else if (event.key === "Tab") {
        event.preventDefault();
        skipBlurCommitRef.current = true;
        handleCommit();
        // 次の日に遷移
        if (onTabNextDay) {
          onTabNextDay();
        }
      }
    },
    [handleCommit, handleCancel, onTabNextDay],
  );

  return (
    <div className="flex flex-col items-center gap-0.5">
      <span
        style={{ fontSize: "0.65rem", color: labelColor, lineHeight: 1.2 }}
      >
        {labelText}
      </span>
      {isEditing ? (
        <input
          autoFocus
          type="number"
          min={0}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => {
            if (skipBlurCommitRef.current) {
              skipBlurCommitRef.current = false;
              return;
            }
            handleCommit();
          }}
          onKeyDown={handleKeyDown}
          style={{
            width: 52,
            textAlign: "center",
            fontSize: "0.75rem",
            padding: "4px 2px",
            border: "1px solid #C3CFC7",
            borderRadius: 4,
            outline: "none",
            boxShadow: "0 0 0 2px rgba(15,168,94,0.25)",
          }}
        />
      ) : (
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          style={{
            width: 52,
            borderRadius: 4,
            border: value ? "1px dashed #C3CFC7" : "1px dashed #57D4A0",
            padding: "2px 4px",
            background: "transparent",
            cursor: "pointer",
            fontSize: "0.75rem",
            color: value ? "#2E3D36" : "#A0B1A7",
          }}
        >
          {value || INPUT_PLACEHOLDER}
        </button>
      )}
    </div>
  );
};

export default EditableCapacityCell;
