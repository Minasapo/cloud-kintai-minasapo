import { Box, Button, CircularProgress, Paper, Stack, TextField } from "@mui/material";

import { ShiftRequestSummary } from "../model/shiftRequestSummary";

type ShiftRequestNoteFormProps = {
  note: string;
  isMobile: boolean;
  isSaving: boolean;
  interactionDisabled: boolean;
  hasSelection: boolean;
  summary: ShiftRequestSummary;
  onNoteChange: (value: string) => void;
  onSave: (summary: ShiftRequestSummary) => void;
};

export function ShiftRequestNoteForm({
  note,
  isMobile,
  isSaving,
  interactionDisabled,
  hasSelection,
  summary,
  onNoteChange,
  onSave,
}: ShiftRequestNoteFormProps) {
  return (
    <Paper
      sx={{
        p: { xs: 1.5, sm: 2.25 },
        borderRadius: "24px",
        border: "1px solid rgba(226,232,240,0.8)",
        boxShadow: "0 24px 48px -36px rgba(15,23,42,0.35)",
        bgcolor: "#ffffff",
      }}
    >
      <Box component="form" onSubmit={(event) => event.preventDefault()}>
        <Stack spacing={2} alignItems="stretch">
          <TextField
            label="備考"
            multiline
            rows={2}
            value={note}
            disabled={interactionDisabled}
            onChange={(event) => onNoteChange(event.target.value)}
          />

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="contained"
              onClick={() => onSave(summary)}
              disabled={!hasSelection || interactionDisabled}
              fullWidth={isMobile}
              sx={{
                minWidth: 160,
                borderRadius: "9999px",
                border: "1px solid rgba(6,95,70,0.35)",
                backgroundColor: "#19b985",
                color: "#ffffff",
                boxShadow:
                  "inset 0 -2px 0 rgba(0,0,0,0.12), 0 12px 24px -18px rgba(5,150,105,0.55)",
                "&:hover": { backgroundColor: "#17ab7b" },
              }}
            >
              保存
            </Button>
            {isSaving && <CircularProgress size={20} />}
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
}

