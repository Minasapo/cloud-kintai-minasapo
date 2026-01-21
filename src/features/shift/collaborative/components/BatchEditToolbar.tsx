import CheckIcon from "@mui/icons-material/Check";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import { ShiftState } from "../types/collaborative.types";

interface BatchEditToolbarProps {
  selectionCount: number;
  onCopy: () => void;
  onPaste: () => void;
  onClear: () => void;
  onChangeState: (state: ShiftState) => void;
  hasClipboard: boolean;
  canPaste: boolean;
}

const stateOptions: Array<{ state: ShiftState; label: string; color: string }> =
  [
    { state: "work", label: "出勤", color: "#4caf50" },
    { state: "requestedOff", label: "希望休", color: "#ff9800" },
    { state: "fixedOff", label: "固定休", color: "#f44336" },
    { state: "auto", label: "自動調整", color: "#2196f3" },
    { state: "empty", label: "未入力", color: "#9e9e9e" },
  ];

export const BatchEditToolbar = ({
  selectionCount,
  onCopy,
  onPaste,
  onClear,
  onChangeState,
  hasClipboard,
  canPaste,
}: BatchEditToolbarProps) => {
  if (selectionCount === 0) return null;

  return (
    <Paper
      elevation={3}
      sx={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        px: 3,
        py: 2,
        borderRadius: 2,
        minWidth: 600,
        zIndex: 1000,
      }}
    >
      <Stack spacing={2}>
        {/* 選択数表示 */}
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1} alignItems="center">
            <CheckIcon color="primary" />
            <Typography variant="subtitle1" fontWeight={600}>
              {selectionCount}セル選択中
            </Typography>
          </Stack>
          <Button
            size="small"
            onClick={onClear}
            startIcon={<DeleteIcon />}
            color="inherit"
          >
            選択解除
          </Button>
        </Box>

        <Divider />

        {/* 状態変更ボタン */}
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            状態を一括変更:
          </Typography>
          <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
            {stateOptions.map((option) => (
              <Chip
                key={option.state}
                label={option.label}
                onClick={() => onChangeState(option.state)}
                sx={{
                  bgcolor: option.color,
                  color: "white",
                  fontWeight: 600,
                  "&:hover": {
                    bgcolor: option.color,
                    opacity: 0.8,
                  },
                }}
              />
            ))}
          </Stack>
        </Box>

        <Divider />

        {/* コピー＆ペーストボタン */}
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<ContentCopyIcon />}
            onClick={onCopy}
            size="small"
          >
            コピー
          </Button>
          <Button
            variant="outlined"
            startIcon={<ContentPasteIcon />}
            onClick={onPaste}
            disabled={!hasClipboard || !canPaste}
            size="small"
          >
            貼り付け
            {hasClipboard && " (Ctrl+V)"}
          </Button>
        </Stack>

        {/* ヘルプテキスト */}
        <Typography variant="caption" color="text.secondary">
          <strong>ヒント:</strong>{" "}
          Shift+クリックで範囲選択、Ctrl/Cmd+クリックで個別追加選択
        </Typography>
      </Stack>
    </Paper>
  );
};
