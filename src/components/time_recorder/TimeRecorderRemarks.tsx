// cspell: ignore testid
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import { Box, IconButton, Stack, TextField } from "@mui/material";
import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Attendance } from "../../API";

export interface TimeRecorderRemarksProps {
  attendance: Attendance | undefined | null;
  onSave: (remarks: Attendance["remarks"]) => void;
}

export default function TimeRecorderRemarks({
  attendance,
  onSave,
}: TimeRecorderRemarksProps) {
  const [formState, setFormState] = useState<Attendance["remarks"]>(
    attendance?.remarks
  );

  useEffect(() => {
    setFormState(attendance?.remarks);
  }, [attendance]);

  const isChanged = useMemo(
    () => attendance?.remarks !== formState,
    [attendance?.remarks, formState]
  );

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setFormState(event.target.value);
  }, []);

  const handleSave = useCallback(() => {
    onSave(formState);
  }, [formState, onSave]);

  const handleClear = useCallback(() => {
    setFormState(attendance?.remarks);
  }, [attendance?.remarks]);

  const textFieldValue = formState ?? "";

  return (
    <Stack>
      <Box>
        <TextField
          data-testid="remarks-text"
          multiline
          minRows={2}
          fullWidth
          value={textFieldValue}
          placeholder="労務担当より指示された時のみ(例：客先名やイベント名など)"
          onChange={handleChange}
        />
      </Box>
      <Box>
        {isChanged && (
          <Stack
            direction="row"
            justifyContent="flex-end"
            alignItems="center"
            spacing={0}
          >
            <Box>
              <IconButton onClick={handleSave}>
                <CheckIcon color="success" data-testid="remarksSave" />
              </IconButton>
            </Box>
            <Box>
              <IconButton onClick={handleClear}>
                <ClearIcon color="error" data-testid="remarksClear" />
              </IconButton>
            </Box>
          </Stack>
        )}
      </Box>
    </Stack>
  );
}
