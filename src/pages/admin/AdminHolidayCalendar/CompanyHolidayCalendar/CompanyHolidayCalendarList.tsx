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

import { CompanyHolidayCalendar } from "@/API";
import { AppContext } from "@/context/AppContext";
import { AttendanceDate } from "@/lib/AttendanceDate";
import { CompanyHolidayCalenderMessage } from "@/lib/message/CompanyHolidayCalenderMessage";
import { MessageStatus } from "@/lib/message/Message";

import { useAppDispatchV2 } from "../../../../app/hooks";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "../../../../lib/reducers/snackbarReducer";
import { ExcelFilePicker } from "../HolidayCalendar/ExcelFilePicker";
import { useHolidayCalendarList } from "../hooks/useHolidayCalendarList";
import AddCompanyHolidayCalendar from "./AddCompanyHolidayCalendar";
import CompanyHolidayCalendarEdit from "./CompanyHolidayCalendarEdit";

const YEAR_RANGE = 5;
const YEAR_OFFSET = 4;

export default function CompanyHolidayCalendarList() {
  const dispatch = useAppDispatchV2();

  const {
    companyHolidayCalendars,
    createCompanyHolidayCalendar,
    updateCompanyHolidayCalendar,
    deleteCompanyHolidayCalendar,
    bulkCreateCompanyHolidayCalendar,
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
  } = useHolidayCalendarList(companyHolidayCalendars, {
    initialRowsPerPage: 20,
    yearRange: YEAR_RANGE,
    yearOffset: YEAR_OFFSET,
  });

  const handleDelete = async (
    companyHolidayCalendar: CompanyHolidayCalendar
  ) => {
    // eslint-disable-next-line no-alert
    const beDeleteDate = dayjs(companyHolidayCalendar.holidayDate).format(
      AttendanceDate.DisplayFormat
    );
    const beDeleteName = companyHolidayCalendar.name;
    const message = `「${beDeleteDate}(${beDeleteName})」を削除しますか？\n削除したデータは元に戻せません。`;

    const confirm = window.confirm(message);
    if (!confirm) {
      return;
    }

    const id = companyHolidayCalendar.id;
    const companyHolidayCalenderMessage = new CompanyHolidayCalenderMessage();
    await deleteCompanyHolidayCalendar({ id })
      .then(() =>
        dispatch(
          setSnackbarSuccess(
            companyHolidayCalenderMessage.delete(MessageStatus.SUCCESS)
          )
        )
      )
      .catch(() =>
        dispatch(
          setSnackbarError(
            companyHolidayCalenderMessage.delete(MessageStatus.ERROR)
          )
        )
      );
  };

  return (
    <>
      <Stack direction="column" spacing={1}>
        <Stack direction="row" spacing={1}>
          <AddCompanyHolidayCalendar
            createCompanyHolidayCalendar={createCompanyHolidayCalendar}
          />
          <ExcelFilePicker
            bulkCreateCompanyHolidayCalendar={bulkCreateCompanyHolidayCalendar}
          />
        </Stack>
        <Paper variant="outlined" sx={{ p: 1, width: "100%" }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            フィルター
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 110 }}>
              <InputLabel id="company-select-year-label">年</InputLabel>
              <Select
                labelId="company-select-year-label"
                value={selectedYear}
                label="年"
                onChange={(e) => {
                  const y = e.target.value as number;
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
              <InputLabel id="company-select-month-label">月</InputLabel>
              <Select
                labelId="company-select-month-label"
                value={selectedMonth}
                label="月"
                onChange={(e) => {
                  const m = e.target.value as number;
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
                    <CompanyHolidayCalendarEdit
                      holidayCalendar={holidayCalendar}
                      updateCompanyHolidayCalendar={
                        updateCompanyHolidayCalendar
                      }
                    />
                    <IconButton onClick={() => handleDelete(holidayCalendar)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </TableCell>
                <TableCell>
                  {(() => {
                    const date = dayjs(holidayCalendar.holidayDate);
                    return date.format(AttendanceDate.DisplayFormat);
                  })()}
                </TableCell>
                <TableCell>{holidayCalendar.name}</TableCell>
                <TableCell>
                  {(() => {
                    const date = dayjs(holidayCalendar.createdAt);
                    return date.format(AttendanceDate.DisplayFormat);
                  })()}
                </TableCell>
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
                  inputProps: { "aria-label": "rows per page" },
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
