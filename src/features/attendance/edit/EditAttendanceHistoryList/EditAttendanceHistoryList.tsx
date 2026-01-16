import HistoryIcon from "@mui/icons-material/History";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { AttendanceEditContext } from "@/pages/attendance/edit/AttendanceEditProvider";

import { AttendanceHistoryRow } from "./AttendanceHistoryRow";

export default function EditAttendanceHistoryList() {
  const { getValues, attendance } = useContext(AttendanceEditContext);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { targetWorkDate, staffId } = useParams();

  const readOnly = searchParams.get("readOnly") === "true";

  useEffect(() => {
    // If we're in readOnly mode, open dialog by default on mount
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (readOnly) setOpen(true);
  }, [readOnly]);

  const handleClickOpen = () => {
    // If already in readOnly mode, open dialog.
    if (readOnly) {
      setOpen(true);
      return;
    }

    // Otherwise navigate to admin edit page with readOnly flag so the full-page
    // attendance editor is shown in read-only mode and the dialog will auto-open.
    const workDate =
      attendance?.workDate || getValues?.("workDate") || targetWorkDate;
    const sid = attendance?.staffId || staffId;
    if (!workDate || !sid) {
      // Fallback: just open dialog if we can't determine route params
      setOpen(true);
      return;
    }

    navigate(`/admin/attendances/history/${workDate}/${sid}`);
  };

  const handleClose = () => {
    setOpen(false);
  };

  if (!getValues) return null;

  return (
    <Box>
      <Button
        variant="outlined"
        size="medium"
        startIcon={<HistoryIcon />}
        onClick={handleClickOpen}
        disabled={
          !attendance ||
          !attendance.histories ||
          attendance.histories.filter((item) => item !== null).length === 0
        }
      >
        変更履歴
      </Button>
      <Dialog
        open={open}
        fullWidth
        maxWidth="lg"
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"変更履歴"}</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            左端のアイコンをクリックすると休憩時間が表示されます
          </Typography>
          <TableContainer>
            <Table size="small" sx={{ width: 1500, overflowY: "auto" }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ whiteSpace: "nowrap" }} />
                  <TableCell sx={{ whiteSpace: "nowrap" }}>勤務日</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>勤務時間</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>直行</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>直帰</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>有給休暇</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>特別休暇</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>振替休日</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>備考</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>作成日時</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    スタッフID
                  </TableCell>
                  <TableCell sx={{ flexGrow: 1 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {attendance?.histories
                  ? attendance.histories
                      .filter(
                        (item): item is NonNullable<typeof item> =>
                          item !== null
                      )
                      .sort((a, b) =>
                        dayjs(b.createdAt).isBefore(dayjs(a.createdAt)) ? -1 : 1
                      )
                      .map((history, index) => (
                        <AttendanceHistoryRow key={index} history={history} />
                      ))
                  : null}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} autoFocus>
            閉じる
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
