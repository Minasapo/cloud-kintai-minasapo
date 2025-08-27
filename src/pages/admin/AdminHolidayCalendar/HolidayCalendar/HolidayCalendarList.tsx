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
import { ChangeEvent, useContext, useState } from "react";

import { AppContext } from "@/context/AppContext";
import { AttendanceDate } from "@/lib/AttendanceDate";
import { HolidayCalenderMessage } from "@/lib/message/HolidayCalenderMessage";
import { MessageStatus } from "@/lib/message/Message";

import {
  CompanyHolidayCalendar,
  DeleteHolidayCalendarInput,
  HolidayCalendar,
} from "../../../../API";
import { useAppDispatchV2 } from "../../../../app/hooks";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "../../../../lib/reducers/snackbarReducer";
import { AddHolidayCalendar } from "./AddHolidayCalendar";
import { CSVFilePicker } from "./CSVFilePicker";
import HolidayCalendarEdit from "./HolidayCalendarEdit";

export function sortCalendar(
  a: HolidayCalendar | CompanyHolidayCalendar,
  b: HolidayCalendar | CompanyHolidayCalendar
) {
  return dayjs(a.holidayDate).isBefore(dayjs(b.holidayDate)) ? 1 : -1;
}

export default function HolidayCalendarList() {
  const {
    holidayCalendars,
    bulkCreateHolidayCalendar,
    updateHolidayCalendar,
    createHolidayCalendar,
    deleteHolidayCalendar,
  } = useContext(AppContext);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [yearMonthFilter, setYearMonthFilter] = useState<string>("");
  const [nameFilter, setNameFilter] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<number | "">("");
  const [selectedMonth, setSelectedMonth] = useState<number | "">("");

  const YEAR_RANGE = 7;
  const YEAR_OFFSET = 5;
  const currentYear = dayjs().year();
  const years = Array.from({ length: YEAR_RANGE }).map((_, i) => currentYear - YEAR_OFFSET + i);

  const sorted = [...(holidayCalendars || [])].sort(sortCalendar);

  const filtered = sorted.filter((hc) => {
    // filter by year-month if set. input type=month returns YYYY-MM
    if (yearMonthFilter) {
      const ym = dayjs(hc.holidayDate).format("YYYY-MM");
      if (ym !== yearMonthFilter) return false;
    }

    // filter by name (case-insensitive substring)
    if (nameFilter) {
      const name = (hc.name || "").toString().toLowerCase();
      if (!name.includes(nameFilter.toLowerCase())) return false;
    }

    return true;
  });

  const paginated = filtered.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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
                  const y = e.target.value as number;
                  setSelectedYear(y);
                  // if month already selected, set yearMonthFilter
                  if (selectedMonth !== "") {
                    const mm = String(selectedMonth).padStart(2, "0");
                    setYearMonthFilter(`${y}-${mm}`);
                    setPage(0);
                  }
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
                  const m = e.target.value as number;
                  setSelectedMonth(m);
                  if (selectedYear !== "") {
                    const mm = String(m).padStart(2, "0");
                    setYearMonthFilter(`${selectedYear}-${mm}`);
                    setPage(0);
                  }
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
                setPage(0);
              }}
              sx={{ minWidth: 200 }}
            />
            <Button
              size="small"
              onClick={() => {
                setSelectedYear("");
                setSelectedMonth("");
                setYearMonthFilter("");
                setNameFilter("");
                setPage(0);
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
