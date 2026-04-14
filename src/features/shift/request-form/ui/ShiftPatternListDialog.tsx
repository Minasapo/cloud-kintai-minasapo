import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React from "react";

import { ShiftRequestPattern } from "../model/shiftRequestPattern";
import { normalizeStatus } from "../model/statusMapping";
import { STATUS_LABEL_MAP, STATUS_MOBILE_LABEL_MAP, WEEKDAY_LABELS } from "./constants";

type ShiftPatternListDialogProps = {
  open: boolean;
  isMobile: boolean;
  patternsLoading: boolean;
  patterns: ShiftRequestPattern[];
  onClose: () => void;
  onOpenCreate: () => void;
  onApply: (pattern: ShiftRequestPattern) => void;
  onDelete: (id: string) => void;
};

export function ShiftPatternListDialog({
  open,
  isMobile,
  patternsLoading,
  patterns,
  onClose,
  onOpenCreate,
  onApply,
  onDelete,
}: ShiftPatternListDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>マイパターン一覧</DialogTitle>
      <DialogContent>
        {patternsLoading ? (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress size={24} />
          </Box>
        ) : patterns.length === 0 ? (
          <Typography>登録されたパターンはありません。</Typography>
        ) : (
          <>
            {isMobile && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mb: 1 }}
              >
                凡例: 出=出勤 / 固=固定休 / 希=希望休
              </Typography>
            )}
            <List>
              {patterns.map((pattern, index) => (
                <React.Fragment key={pattern.id}>
                  <ListItem disableGutters sx={{ px: 0 }}>
                    <Paper
                      variant="outlined"
                      sx={{
                        width: "100%",
                        p: 2,
                        backgroundColor: "grey.50",
                      }}
                    >
                      <Typography variant="subtitle1" gutterBottom>
                        {pattern.name}
                      </Typography>
                      <Table size="small" sx={{ tableLayout: "fixed" }}>
                        <TableHead>
                          <TableRow>
                            {WEEKDAY_LABELS.map((label, idx) => (
                              <TableCell
                                key={`${pattern.id}-weekday-${idx}`}
                                align="center"
                                sx={{ py: 0.5, whiteSpace: "nowrap" }}
                              >
                                {label}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            {WEEKDAY_LABELS.map((_, idx) => {
                              const normalized = normalizeStatus(
                                pattern.mapping[idx] as string,
                              );
                              return (
                                <TableCell
                                  key={`${pattern.id}-status-${idx}`}
                                  align="center"
                                  sx={{ py: 0.5, whiteSpace: "nowrap" }}
                                >
                                  {isMobile
                                    ? (STATUS_MOBILE_LABEL_MAP[normalized] ??
                                      STATUS_LABEL_MAP[normalized])
                                    : STATUS_LABEL_MAP[normalized]}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        </TableBody>
                      </Table>
                      <Stack
                        direction="row"
                        justifyContent="flex-end"
                        spacing={1}
                        sx={{ mt: 1 }}
                      >
                        <Button
                          size="small"
                          onClick={() => onApply(pattern)}
                          disabled={patternsLoading}
                        >
                          適用
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => onDelete(pattern.id)}
                          disabled={patternsLoading}
                          startIcon={<DeleteIcon />}
                        >
                          削除
                        </Button>
                      </Stack>
                    </Paper>
                  </ListItem>
                  {index !== patterns.length - 1 && <Divider sx={{ my: 1 }} />}
                </React.Fragment>
              ))}
            </List>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>閉じる</Button>
        <Button
          onClick={onOpenCreate}
          startIcon={<AddIcon />}
          disabled={patternsLoading}
        >
          新規作成
        </Button>
      </DialogActions>
    </Dialog>
  );
}

