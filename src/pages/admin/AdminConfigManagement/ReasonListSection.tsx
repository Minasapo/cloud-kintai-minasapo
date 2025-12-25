import DeleteIcon from "@mui/icons-material/Delete";
import {
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

interface Reason {
  reason: string;
  enabled: boolean;
}

interface ReasonListSectionProps {
  reasons: Reason[];
  onAddReason: () => void;
  onReasonChange: (
    index: number,
    field: "reason" | "enabled",
    value: string | boolean
  ) => void;
  onRemoveReason: (index: number) => void;
}

const ReasonListSection = ({
  reasons,
  onAddReason,
  onReasonChange,
  onRemoveReason,
}: ReasonListSectionProps) => (
  <>
    <Typography variant="h4">修正理由</Typography>
    <Typography variant="body1" color="textSecondary">
      修正理由のテキスト一覧を管理してください。
    </Typography>
    <Stack spacing={2}>
      {reasons.map((reason, index) => (
        <Stack direction="row" spacing={2} alignItems="center" key={index}>
          <TextField
            label={`理由 ${index + 1}`}
            value={reason.reason}
            onChange={(e) => onReasonChange(index, "reason", e.target.value)}
            size="small"
            sx={{ flex: 1 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={reason.enabled}
                onChange={(e) =>
                  onReasonChange(index, "enabled", e.target.checked)
                }
              />
            }
            label="有効"
          />
          <IconButton onClick={() => onRemoveReason(index)} color="error">
            <DeleteIcon />
          </IconButton>
        </Stack>
      ))}
      <Button
        variant="text"
        size="small"
        onClick={onAddReason}
        sx={{ alignSelf: "flex-start" }}
      >
        理由を追加
      </Button>
    </Stack>
  </>
);

export default ReasonListSection;
