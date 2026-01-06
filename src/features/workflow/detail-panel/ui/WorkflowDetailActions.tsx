import { Box, Button } from "@mui/material";

type WorkflowDetailActionsProps = {
  onBack: () => void;
  onWithdraw: () => void;
  onEdit: () => void;
  withdrawDisabled?: boolean;
  withdrawTooltip?: string;
  editDisabled?: boolean;
  editTooltip?: string;
};

export default function WorkflowDetailActions({
  onBack,
  onWithdraw,
  onEdit,
  withdrawDisabled,
  withdrawTooltip,
  editDisabled,
  editTooltip,
}: WorkflowDetailActionsProps) {
  "use memo";

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 2,
      }}
    >
      <Box>
        <Button size="small" sx={{ mr: 1 }} onClick={onBack}>
          一覧に戻る
        </Button>
      </Box>
      <Box>
        <Button
          size="small"
          variant="contained"
          color="error"
          sx={{ mr: 1 }}
          onClick={onWithdraw}
          disabled={withdrawDisabled}
          title={withdrawTooltip}
        >
          取り下げ
        </Button>

        <Button
          size="small"
          variant="contained"
          onClick={onEdit}
          disabled={editDisabled}
          title={editTooltip}
        >
          編集
        </Button>
      </Box>
    </Box>
  );
}
