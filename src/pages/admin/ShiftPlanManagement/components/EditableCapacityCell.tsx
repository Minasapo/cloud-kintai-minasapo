import { ButtonBase, Stack, TextField, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";

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
        handleCommit();
      } else if (event.key === "Escape") {
        event.preventDefault();
        handleCancel();
      } else if (event.key === "Tab") {
        event.preventDefault();
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
    <Stack spacing={0.25} alignItems="center">
      <Typography
        variant="caption"
        sx={{ fontSize: "0.65rem" }}
        color={labelColor}
      >
        {labelText}
      </Typography>
      {isEditing ? (
        <TextField
          autoFocus
          type="number"
          size="small"
          value={draft}
          inputProps={{ min: 0 }}
          sx={{
            width: 52,
            "& input": {
              textAlign: "center",
              fontSize: "0.75rem",
              padding: "4px",
            },
          }}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={handleCommit}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <ButtonBase
          onClick={() => setIsEditing(true)}
          sx={{
            width: 52,
            borderRadius: 1,
            border: "1px dashed",
            borderColor: value ? "divider" : "primary.light",
            px: 0.5,
            py: 0.5,
          }}
        >
          <Typography
            variant="body2"
            color={value ? "text.primary" : "text.disabled"}
            sx={{ fontSize: "0.75rem" }}
          >
            {value || INPUT_PLACEHOLDER}
          </Typography>
        </ButtonBase>
      )}
    </Stack>
  );
};

export default EditableCapacityCell;
