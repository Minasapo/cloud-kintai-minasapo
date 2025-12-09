import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import { Box, IconButton, Stack, TextField } from "@mui/material";
import { ChangeEvent } from "react";

export interface TimeRecorderRemarksViewProps {
  value: string;
  placeholder?: string;
  isChanged: boolean;
  onChange: (value: string) => void;
  onSave: () => void;
  onClear: () => void;
}

const TimeRecorderRemarksView = ({
  value,
  placeholder,
  isChanged,
  onChange,
  onSave,
  onClear,
}: TimeRecorderRemarksViewProps) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <Stack>
      <Box>
        <TextField
          data-testid="remarks-text"
          multiline
          minRows={2}
          fullWidth
          value={value}
          placeholder={placeholder}
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
              <IconButton onClick={onSave}>
                <CheckIcon color="success" data-testid="remarksSave" />
              </IconButton>
            </Box>
            <Box>
              <IconButton onClick={onClear}>
                <ClearIcon color="error" data-testid="remarksClear" />
              </IconButton>
            </Box>
          </Stack>
        )}
      </Box>
    </Stack>
  );
};

export default TimeRecorderRemarksView;
