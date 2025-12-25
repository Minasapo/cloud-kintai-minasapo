import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import {
  Alert,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { ChangeEvent } from "react";

export interface QuickDailyReportCardViewProps {
  date: string;
  reportId: string | null;
  content: string;
  isOpen: boolean;
  isDialogOpen: boolean;
  isLoading: boolean;
  isEditable: boolean;
  isDirty: boolean;
  isSaving: boolean;
  hasStaff: boolean;
  error: string | null;
  contentPanelId: string;
  onToggle: () => void;
  onDialogOpen: () => void;
  onDialogClose: () => void;
  onClear: () => void;
  onSave: () => void;
  onContentChange: (value: string) => void;
}

const QuickDailyReportCardView = ({
  date,
  reportId,
  content,
  isOpen,
  isDialogOpen,
  isLoading,
  isEditable,
  isDirty,
  isSaving,
  hasStaff,
  error,
  contentPanelId,
  onToggle,
  onDialogOpen,
  onDialogClose,
  onClear,
  onSave,
  onContentChange,
}: QuickDailyReportCardViewProps) => {
  const renderSaveIcon = () => {
    if (!isSaving) {
      return <CheckIcon fontSize="small" />;
    }
    return <CircularProgress size={18} />;
  };

  const handleContentChange = (event: ChangeEvent<HTMLInputElement>) => {
    onContentChange(event.target.value);
  };

  return (
    <Card variant="outlined">
      <CardContent sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
          <IconButton
            size="small"
            onClick={onToggle}
            aria-expanded={isOpen}
            aria-controls={contentPanelId}
            sx={{
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
            }}
          >
            <ExpandMoreIcon fontSize="small" />
          </IconButton>
          <Stack
            spacing={0.25}
            flexGrow={1}
            onClick={onToggle}
            sx={{ cursor: "pointer" }}
          >
            <Typography variant="subtitle1">今日の日報メモ</Typography>
            <Typography variant="caption" color="text.secondary">
              {date} / {reportId ? "既存データを更新" : "新規作成"}
            </Typography>
          </Stack>
          <Tooltip title="拡大表示">
            <span>
              <IconButton
                size="small"
                onClick={onDialogOpen}
                disabled={!hasStaff || isLoading}
                aria-label="拡大表示"
              >
                <OpenInFullIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          {isOpen && (
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="入力をキャンセル">
                <span>
                  <IconButton
                    size="small"
                    onClick={onClear}
                    disabled={!isEditable || !isDirty || isSaving}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="保存">
                <span>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={onSave}
                    disabled={!isEditable || !isDirty || isSaving}
                  >
                    {renderSaveIcon()}
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          )}
        </Stack>
        <Collapse in={isOpen} timeout="auto" unmountOnExit>
          <Stack spacing={1} mt={1} id={contentPanelId}>
            {isLoading && <LinearProgress />}
            <TextField
              multiline
              minRows={4}
              fullWidth
              placeholder={
                hasStaff
                  ? "今日の振り返りや共有事項をここに入力できます"
                  : "スタッフ情報を読み込み中です"
              }
              value={content}
              onChange={handleContentChange}
              disabled={!hasStaff || isLoading}
            />
            <Typography variant="caption" color="text.secondary">
              他の日報は、日報ページから編集・閲覧できます。
            </Typography>
            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        </Collapse>
      </CardContent>
      <Dialog
        open={isDialogOpen}
        onClose={onDialogClose}
        fullWidth
        maxWidth="md"
        aria-labelledby={`${contentPanelId}-dialog-title`}
      >
        <DialogTitle id={`${contentPanelId}-dialog-title`}>
          今日の日報メモを拡大表示
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            {isLoading && <LinearProgress />}
            <TextField
              multiline
              minRows={10}
              fullWidth
              autoFocus
              placeholder={
                hasStaff
                  ? "今日の振り返りや共有事項をここに入力できます"
                  : "スタッフ情報を読み込み中です"
              }
              value={content}
              onChange={handleContentChange}
              disabled={!hasStaff || isLoading}
            />
            <Typography variant="caption" color="text.secondary">
              保存すると標準のカードにも内容が反映されます。
            </Typography>
            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onDialogClose}>閉じる</Button>
          <Button
            variant="contained"
            onClick={() => void onSave()}
            disabled={!isEditable || !isDirty || isSaving}
          >
            {isSaving ? "保存中..." : "保存"}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default QuickDailyReportCardView;
