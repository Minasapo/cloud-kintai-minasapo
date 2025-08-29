import DeleteIcon from "@mui/icons-material/Delete";
import {
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { useContext } from "react";

import { AppContext } from "@/context/AppContext";
import { AttendanceDate } from "@/lib/AttendanceDate";
import { HolidayCalenderMessage } from "@/lib/message/HolidayCalenderMessage";
import { MessageStatus } from "@/lib/message/Message";

import { DeleteHolidayCalendarInput, HolidayCalendar } from "../../../../API";
import { useAppDispatchV2 } from "../../../../app/hooks";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "../../../../lib/reducers/snackbarReducer";
import { useHolidayCalendarList } from "../hooks/useHolidayCalendarList";
import { AddHolidayCalendar } from "./AddHolidayCalendar";
import { CSVFilePicker } from "./CSVFilePicker";
import HolidayCalendarEdit from "./HolidayCalendarEdit";

export default function HolidayCalendarList() {
  const {
    holidayCalendars,
    bulkCreateHolidayCalendar,
    updateHolidayCalendar,
    createHolidayCalendar,
    deleteHolidayCalendar,
  } = useContext(AppContext);

  const {
    page,
    rowsPerPage,
    years,
    selectedYear,
    selectedMonth,
    setSelectedYear,
    setSelectedMonth,
    nameFilter,
    setNameFilter,
    /* yearMonthFilter intentionally unused */
    applyYearMonthFilter,
    filtered,
    paginated,
    handleChangePage,
    handleChangeRowsPerPage,
    clearFilters,
  } = useHolidayCalendarList<HolidayCalendar>(holidayCalendars, {
    initialRowsPerPage: 20,
    yearRange: 7,
    yearOffset: 5,
  });

  return (
    <>
      <Stack direction="column" spacing={1}>
        <Stack direction="row" spacing={1} alignItems="center">
          <AddHolidayCalendar createHolidayCalendar={createHolidayCalendar} />
          <CSVFilePicker
            bulkCreateHolidayCalendar={bulkCreateHolidayCalendar}
          />
        </Stack>
        <Paper variant="outlined" sx={{ p: 1, width: "100%" }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            フィルター
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 110 }}>
              <InputLabel id="select-year-label">年</InputLabel>
              <Select
                labelId="select-year-label"
                value={selectedYear}
                label="年"
                onChange={(e) => {
                  const y = e.target.value as number | "";
                  setSelectedYear(y);
                  applyYearMonthFilter(y, selectedMonth);
                }}
              >
                <MenuItem value="">-</MenuItem>
                {years.map((y) => (
                  <MenuItem key={y} value={y}>
                    {y}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel id="select-month-label">月</InputLabel>
              <Select
                labelId="select-month-label"
                value={selectedMonth}
                label="月"
                onChange={(e) => {
                  const m = e.target.value as number | "";
                  setSelectedMonth(m);
                  applyYearMonthFilter(selectedYear, m);
                }}
              >
                <MenuItem value="">-</MenuItem>
                {Array.from({ length: 12 }).map((_, i) => (
                  <MenuItem key={i + 1} value={i + 1}>
                    {i + 1}月
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="休日名で検索"
              size="small"
              value={nameFilter}
              onChange={(e) => {
                setNameFilter(e.target.value);
              }}
              sx={{ minWidth: 200 }}
            />
            <Button
              size="small"
              onClick={() => {
                clearFilters();
              }}
            >
              クリア
            </Button>
          </Stack>
        </Paper>
      </Stack>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 50 }} />
              <TableCell sx={{ width: 100 }}>日付</TableCell>
              <TableCell sx={{ width: 200 }}>名前</TableCell>
              <TableCell sx={{ width: 100 }}>作成日</TableCell>
              <TableCell sx={{ flexGrow: 1 }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((holidayCalendar, index) => (
              <TableRow key={holidayCalendar.id ?? index}>
                <TableCell>
                  <Stack direction="row" spacing={0}>
                    <HolidayCalendarEdit
                      holidayCalendar={holidayCalendar}
                      updateHolidayCalendar={updateHolidayCalendar}
                    />
                    <HolidayCalendarDelete
                      holidayCalendar={holidayCalendar}
                      deleteHolidayCalendar={deleteHolidayCalendar}
                    />
                  </Stack>
                </TableCell>
                <HolidayDateTableCell holidayCalendar={holidayCalendar} />
                <HolidayNameTableCell holidayCalendar={holidayCalendar} />
                <CreatedAtTableCell holidayCalendar={holidayCalendar} />
                <TableCell />
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[10, 20, 50, 100]}
                colSpan={5}
                count={filtered.length}
                rowsPerPage={rowsPerPage}
                page={page}
                labelRowsPerPage="表示件数"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} / ${count === -1 ? `以上` : `${count}`} 件`
                }
                SelectProps={{
                  inputProps: {
                    "aria-label": "rows per page",
                  },
                  native: false,
                }}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </>
  );
}

function HolidayCalendarDelete({
  holidayCalendar,
  deleteHolidayCalendar,
}: {
  holidayCalendar: HolidayCalendar;
  deleteHolidayCalendar: (input: DeleteHolidayCalendarInput) => Promise<void>;
}) {
  const dispatch = useAppDispatchV2();

  const onSubmit = async () => {
    const beDeleteDate = dayjs(holidayCalendar.holidayDate).format(
      AttendanceDate.DisplayFormat
    );
    const beDeleteName = holidayCalendar.name;
    const formattedDeleteMessage = `「${beDeleteDate}(${beDeleteName})」を削除しますか？\nこの操作は取り消せません。`;

    const confirmed = window.confirm(formattedDeleteMessage);
    if (!confirmed) {
      return;
    }

    const holidayCalenderMessage = new HolidayCalenderMessage();
    await deleteHolidayCalendar({ id: holidayCalendar.id })
      .then(() => {
        dispatch(
          setSnackbarSuccess(
            holidayCalenderMessage.delete(MessageStatus.SUCCESS)
          )
        );
      })
      .catch(() => {
        dispatch(
          setSnackbarError(holidayCalenderMessage.delete(MessageStatus.ERROR))
        );
      });
  };

  return (
    <IconButton onClick={onSubmit}>
      <DeleteIcon fontSize="small" />
    </IconButton>
  );
}

function HolidayDateTableCell({
  holidayCalendar,
}: {
  holidayCalendar: HolidayCalendar;
}) {
  const date = dayjs(holidayCalendar.holidayDate);
  const holidayDate = date.format(AttendanceDate.DisplayFormat);

  return <TableCell>{holidayDate}</TableCell>;
}

function HolidayNameTableCell({
  holidayCalendar,
}: {
  holidayCalendar: HolidayCalendar;
}) {
  return <TableCell>{holidayCalendar.name}</TableCell>;
}

function CreatedAtTableCell({
  holidayCalendar,
}: {
  holidayCalendar: HolidayCalendar;
}) {
  const date = dayjs(holidayCalendar.createdAt);
  const createdAt = date.format(AttendanceDate.DisplayFormat);

  return <TableCell>{createdAt}</TableCell>;
}
