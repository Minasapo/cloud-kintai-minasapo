import {
  Box,
  Button,
  Grid,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";

import {
  CLOCK_CORRECTION_CHECK_OUT_LABEL,
  CLOCK_CORRECTION_LABEL,
} from "@/features/workflow/application-form/model/workflowFormModel";
import { TimeInput } from "@/shared/ui/TimeInput";

const inlineFieldGroupSx = {
  display: "flex",
  gap: 1,
  alignItems: "flex-start",
  flexWrap: "wrap",
};

const INPUT_SX = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "18px",
    bgcolor: "#f8fffb",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.92)",
    "& fieldset": {
      borderColor: "rgba(16, 185, 129, 0.18)",
    },
    "&:hover fieldset": {
      borderColor: "rgba(16, 185, 129, 0.3)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "rgba(16, 185, 129, 0.55)",
    },
  },
  "& .MuiOutlinedInput-input": {
    py: "10px",
    px: "14px",
    fontSize: "0.92rem",
    color: "#0f172a",
  },
  "& .MuiFormHelperText-root": {
    marginLeft: 0,
  },
} as const;

const SELECT_SX = {
  ...INPUT_SX,
  "& .MuiSelect-select": {
    py: "10px",
    px: "14px",
    fontSize: "0.92rem",
    color: "#0f172a",
  },
} as const;

const OUTLINED_BUTTON_SX = {
  borderRadius: "999px",
  borderColor: "rgba(4, 120, 87, 0.58)",
  color: "#ffffff",
  bgcolor: "#19b985",
  px: 2.5,
  py: 1.15,
  fontWeight: 500,
  boxShadow:
    "inset 0 -2px 0 rgba(0,0,0,0.12), 0 12px 24px -18px rgba(5,150,105,0.55)",
  "&:hover": {
    borderColor: "rgba(4, 120, 87, 0.62)",
    bgcolor: "#17ab7b",
    boxShadow:
      "inset 0 -2px 0 rgba(0,0,0,0.12), 0 14px 28px -18px rgba(5,150,105,0.6)",
  },
} as const;

type Props = {
  category: string;
  disabled?: boolean;
  startDate: string;
  setStartDate: (v: string) => void;
  endDate: string;
  setEndDate: (v: string) => void;
  dateError: string;
  paidReason: string;
  setPaidReason: (v: string) => void;
  absenceDate: string;
  setAbsenceDate: (v: string) => void;
  absenceDateError: string;
  absenceReason: string;
  setAbsenceReason: (v: string) => void;
  overtimeDate: string;
  setOvertimeDate: (v: string) => void;
  overtimeDateError: string;
  overtimeStart: string | null;
  setOvertimeStart: (v: string | null) => void;
  overtimeEnd: string | null;
  setOvertimeEnd: (v: string | null) => void;
  overtimeError: string;
  overtimeReason?: string;
  setOvertimeReason?: (v: string) => void;
  customWorkflowTitle?: string;
  setCustomWorkflowTitle?: (v: string) => void;
  customWorkflowContent?: string;
  setCustomWorkflowContent?: (v: string) => void;
  customWorkflowTitleError?: string;
  customWorkflowContentError?: string;
  templateOptions?: Array<{
    id: string;
    name: string;
  }>;
  selectedTemplateId?: string;
  setSelectedTemplateId?: (v: string) => void;
  onApplyTemplate?: () => void;
  disableTemplateApply?: boolean;
};

export default function WorkflowTypeFields({
  category,
  disabled = false,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  dateError,
  paidReason,
  setPaidReason,
  absenceDate,
  setAbsenceDate,
  absenceDateError,
  absenceReason,
  setAbsenceReason,
  overtimeDate,
  setOvertimeDate,
  overtimeDateError,
  overtimeStart,
  setOvertimeStart,
  overtimeEnd,
  setOvertimeEnd,
  overtimeError,
  overtimeReason,
  setOvertimeReason,
  customWorkflowTitle,
  setCustomWorkflowTitle,
  customWorkflowContent,
  setCustomWorkflowContent,
  customWorkflowTitleError,
  customWorkflowContentError,
  templateOptions,
  selectedTemplateId,
  setSelectedTemplateId,
  onApplyTemplate,
  disableTemplateApply,
}: Props) {
  return (
    <>
      {category === "有給休暇申請" && (
        <>
          <Grid item xs={12} sm={3}>
            <Typography variant="body2" color="text.secondary">
              取得期間
            </Typography>
          </Grid>
          <Grid item xs={12} sm={9}>
            <Box sx={inlineFieldGroupSx}>
              <TextField
                type="date"
                size="small"
                disabled={disabled}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                error={Boolean(dateError)}
                helperText={dateError}
                sx={INPUT_SX}
              />
              <Typography>-</Typography>
              <TextField
                type="date"
                size="small"
                disabled={disabled}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                error={Boolean(dateError)}
                sx={INPUT_SX}
              />
            </Box>
          </Grid>

          <Grid item xs={12} sm={3}>
            <Typography variant="body2" color="text.secondary">
              申請理由
            </Typography>
          </Grid>
          <Grid item xs={12} sm={9}>
            <TextField
              size="small"
              fullWidth
              disabled={disabled}
              value={paidReason}
              onChange={(e) => setPaidReason(e.target.value)}
              sx={INPUT_SX}
            />
          </Grid>
        </>
      )}

      {category === "欠勤申請" && (
        <>
          <Grid item xs={12} sm={3}>
            <Typography variant="body2" color="text.secondary">
              欠勤日
            </Typography>
          </Grid>
          <Grid item xs={12} sm={9}>
            <TextField
              type="date"
              size="small"
              fullWidth
              value={absenceDate}
              onChange={(e) => setAbsenceDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              error={Boolean(absenceDateError)}
              helperText={absenceDateError}
              disabled={disabled}
              sx={INPUT_SX}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <Typography variant="body2" color="text.secondary">
              欠勤理由
            </Typography>
          </Grid>
          <Grid item xs={12} sm={9}>
            <TextField
              size="small"
              fullWidth
              sx={INPUT_SX}
              value={absenceReason}
              onChange={(e) => setAbsenceReason(e.target.value)}
              disabled={disabled}
            />
          </Grid>
        </>
      )}

      {category === "残業申請" && (
        <>
          <Grid item xs={12} sm={3}>
            <Typography variant="body2" color="text.secondary">
              残業予定日
            </Typography>
          </Grid>
          <Grid item xs={12} sm={9}>
            <TextField
              type="date"
              size="small"
              value={overtimeDate}
              onChange={(e) => setOvertimeDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              error={Boolean(overtimeDateError)}
              helperText={overtimeDateError}
              sx={{ ...INPUT_SX, maxWidth: 200 }}
              disabled={disabled}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <Typography variant="body2" color="text.secondary">
              残業予定時間
            </Typography>
          </Grid>
          <Grid item xs={12} sm={9}>
            <Box sx={{ display: "grid", gap: 0.75 }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "minmax(0, 1fr)",
                    sm: "148px 48px 148px",
                  },
                  columnGap: 0,
                  rowGap: 1,
                  alignItems: "center",
                }}
              >
                <TimeInput
                  value={overtimeStart}
                  onChange={setOvertimeStart}
                  baseDate={
                    overtimeDate || new Date().toISOString().slice(0, 10)
                  }
                  size="small"
                  error={Boolean(overtimeError)}
                  disabled={disabled}
                  sx={{ width: "148px", maxWidth: "100%" }}
                />
                <Typography
                  sx={{
                    display: { xs: "none", sm: "block" },
                    textAlign: "center",
                    lineHeight: 1,
                    color: "text.secondary",
                    justifySelf: "center",
                    transform: "translateY(-1px)",
                  }}
                >
                  〜
                </Typography>
                <TimeInput
                  value={overtimeEnd}
                  onChange={setOvertimeEnd}
                  baseDate={
                    overtimeDate || new Date().toISOString().slice(0, 10)
                  }
                  size="small"
                  error={Boolean(overtimeError)}
                  disabled={disabled}
                  sx={{ width: "148px", maxWidth: "100%" }}
                />
              </Box>
              {overtimeError && (
                <Typography color="error" variant="caption">
                  {overtimeError}
                </Typography>
              )}
            </Box>
          </Grid>

          <Grid item xs={12} sm={3}>
            <Typography variant="body2" color="text.secondary">
              残業理由
            </Typography>
          </Grid>
          <Grid item xs={12} sm={9}>
            <TextField
              size="small"
              fullWidth
              value={overtimeReason}
              onChange={(e) =>
                setOvertimeReason && setOvertimeReason(e.target.value)
              }
              disabled={disabled}
              sx={INPUT_SX}
            />
          </Grid>
        </>
      )}

      {category === CLOCK_CORRECTION_LABEL && (
        <>
          <Grid item xs={12} sm={3}>
            <Typography variant="body2" color="text.secondary">
              対象日
            </Typography>
          </Grid>
          <Grid item xs={12} sm={9}>
            <TextField
              type="date"
              size="small"
              value={overtimeDate}
              onChange={(e) => setOvertimeDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              error={Boolean(overtimeDateError)}
              helperText={overtimeDateError}
              disabled={disabled}
              sx={{ ...INPUT_SX, maxWidth: 200 }}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <Typography variant="body2" color="text.secondary">
              出勤時間
            </Typography>
          </Grid>
          <Grid item xs={12} sm={9}>
            <TimeInput
              value={overtimeStart}
              onChange={setOvertimeStart}
              baseDate={overtimeDate || new Date().toISOString().slice(0, 10)}
              size="small"
              error={Boolean(overtimeError)}
              helperText={overtimeError}
              disabled={disabled}
              sx={{ maxWidth: 160 }}
            />
          </Grid>
        </>
      )}

      {category === CLOCK_CORRECTION_CHECK_OUT_LABEL && (
        <>
          <Grid item xs={12} sm={3}>
            <Typography variant="body2" color="text.secondary">
              対象日
            </Typography>
          </Grid>
          <Grid item xs={12} sm={9}>
            <TextField
              type="date"
              size="small"
              value={overtimeDate}
              onChange={(e) => setOvertimeDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              error={Boolean(overtimeDateError)}
              helperText={overtimeDateError}
              disabled={disabled}
              sx={{ ...INPUT_SX, maxWidth: 200 }}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <Typography variant="body2" color="text.secondary">
              退勤時間
            </Typography>
          </Grid>
          <Grid item xs={12} sm={9}>
            <TimeInput
              value={overtimeEnd}
              onChange={setOvertimeEnd}
              baseDate={overtimeDate || new Date().toISOString().slice(0, 10)}
              size="small"
              error={Boolean(overtimeError)}
              helperText={overtimeError}
              disabled={disabled}
              sx={{ maxWidth: 160 }}
            />
          </Grid>
        </>
      )}

      {category === "その他" && (
        <>
          <Grid item xs={12} sm={3}>
            <Typography variant="body2" color="text.secondary">
              テンプレート
            </Typography>
          </Grid>
          <Grid item xs={12} sm={9}>
            <Box sx={inlineFieldGroupSx}>
              <Select
                size="small"
                fullWidth
                value={selectedTemplateId ?? ""}
                onChange={(e) =>
                  setSelectedTemplateId && setSelectedTemplateId(e.target.value)
                }
                disabled={disabled}
                displayEmpty
                sx={SELECT_SX}
              >
                <MenuItem value="">
                  <em>テンプレートを選択</em>
                </MenuItem>
                {(templateOptions ?? []).map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.name}
                  </MenuItem>
                ))}
              </Select>
              <Button
                variant="outlined"
                onClick={() => onApplyTemplate && onApplyTemplate()}
                disabled={disabled || disableTemplateApply}
                sx={OUTLINED_BUTTON_SX}
              >
                適用
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12} sm={3}>
            <Typography variant="body2" color="text.secondary">
              タイトル
            </Typography>
          </Grid>
          <Grid item xs={12} sm={9}>
            <TextField
              size="small"
              fullWidth
              value={customWorkflowTitle ?? ""}
              onChange={(e) =>
                setCustomWorkflowTitle && setCustomWorkflowTitle(e.target.value)
              }
              disabled={disabled}
              error={Boolean(customWorkflowTitleError)}
              helperText={customWorkflowTitleError}
              sx={INPUT_SX}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <Typography variant="body2" color="text.secondary">
              詳細
            </Typography>
          </Grid>
          <Grid item xs={12} sm={9}>
            <TextField
              size="small"
              fullWidth
              multiline
              minRows={6}
              value={customWorkflowContent ?? ""}
              onChange={(e) =>
                setCustomWorkflowContent &&
                setCustomWorkflowContent(e.target.value)
              }
              disabled={disabled}
              error={Boolean(customWorkflowContentError)}
              helperText={customWorkflowContentError}
              sx={INPUT_SX}
            />
          </Grid>
        </>
      )}
    </>
  );
}
