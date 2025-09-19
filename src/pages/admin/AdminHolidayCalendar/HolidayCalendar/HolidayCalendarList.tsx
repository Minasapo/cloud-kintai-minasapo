import {
  Button,
  FormControl,
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
import { useContext } from "react";

import { HolidayCalendar } from "@/API";
import { AppContext } from "@/context/AppContext";

import { useHolidayCalendarList } from "../hooks/useHolidayCalendarList";
import { AddHolidayCalendar } from "./AddHolidayCalendar";
import CreatedAtTableCell from "./components/CreatedAtTableCell";
import HolidayCalendarDelete from "./components/HolidayCalendarDelete";
import HolidayDateTableCell from "./components/HolidayDateTableCell";
import HolidayNameTableCell from "./components/HolidayNameTableCell";
import { CSVFilePicker } from "./CSVFilePicker";
import HolidayCalendarCopy from "./HolidayCalendarCopy";
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
                    <HolidayCalendarCopy
                      holidayCalendar={holidayCalendar}
                      createHolidayCalendar={createHolidayCalendar}
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
                slotProps={{
                  select: {
                    inputProps: {
                      "aria-label": "rows per page",
                    },
                    native: false,
                  },
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
