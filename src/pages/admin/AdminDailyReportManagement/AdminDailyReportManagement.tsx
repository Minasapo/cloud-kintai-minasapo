import {
  Alert,
  Button,
  Chip,
  Container,
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
  TableHead,
  TablePagination,
  TableRow,
  TextField,
} from "@mui/material";
import { listDailyReports } from "@shared/api/graphql/documents/queries";
import type { ListDailyReportsQuery } from "@shared/api/graphql/types";
import type { GraphQLResult } from "aws-amplify/api";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useStaffs } from "@/hooks/useStaffs/useStaffs";
import { graphqlClient } from "@/lib/amplify/graphqlClient";
import { formatDateTimeReadable } from "@/lib/date";

import {
  type AdminDailyReport,
  DISPLAY_STATUSES,
  type DisplayStatus,
  mapDailyReport,
  STATUS_META,
} from "./data";
import DailyReportCarouselDialog from "./DailyReportCarouselDialog";

export default function AdminDailyReportManagement() {
  const navigate = useNavigate();
  const { staffs, loading: isStaffLoading, error: staffError } = useStaffs();
  const [statusFilter, setStatusFilter] = useState<DisplayStatus | "">("");
  const [staffFilter, setStaffFilter] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [reports, setReports] = useState<AdminDailyReport[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<AdminDailyReport | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const buildStaffName = useCallback(
    (staffId: string) => {
      const staff = staffs.find((item) => item.id === staffId);
      if (!staff) return "スタッフ";
      const name = [staff.familyName, staff.givenName]
        .filter((part): part is string => Boolean(part && part.trim()))
        .join(" ");
      return name || "スタッフ";
    },
    [staffs]
  );

  const fetchReports = useCallback(async () => {
    setIsLoadingReports(true);
    setLoadError(null);
    try {
      const aggregated: AdminDailyReport[] = [];
      let nextToken: string | null | undefined = undefined;

      do {
        const response = (await graphqlClient.graphql({
          query: listDailyReports,
          variables: {
            limit: 100,
            nextToken,
          },
          authMode: "userPool",
        })) as GraphQLResult<ListDailyReportsQuery>;

        if (response.errors?.length) {
          const messages = response.errors.map((err) => err.message);
          throw new Error(messages.join("\n"));
        }

        const items = response.data?.listDailyReports?.items ?? [];

        items.forEach((record) => {
          if (!record) return;
          aggregated.push(
            mapDailyReport(record, buildStaffName(record.staffId))
          );
        });

        nextToken = response.data?.listDailyReports?.nextToken;
      } while (nextToken);

      setReports(
        aggregated.sort((a, b) => {
          if (a.date === b.date) {
            return (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "");
          }
          return b.date.localeCompare(a.date);
        })
      );
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "日報の取得に失敗しました。"
      );
    } finally {
      setIsLoadingReports(false);
    }
  }, [buildStaffName]);

  useEffect(() => {
    void fetchReports();
  }, [fetchReports]);

  const visibleReports = useMemo(
    () =>
      reports.filter((report) =>
        DISPLAY_STATUSES.includes(report.status as DisplayStatus)
      ),
    [reports]
  );

  const staffOptions = useMemo(() => {
    const unique = Array.from(
      new Set(visibleReports.map((report) => report.author))
    );
    return unique.sort((a, b) => a.localeCompare(b, "ja"));
  }, [visibleReports]);

  const filteredReports = useMemo(() => {
    return visibleReports.filter((report) => {
      if (statusFilter && report.status !== statusFilter) return false;
      if (staffFilter && report.author !== staffFilter) return false;
      if (startDate && report.date < startDate) return false;
      if (endDate && report.date > endDate) return false;
      return true;
    });
  }, [endDate, staffFilter, startDate, statusFilter, visibleReports]);

  const paginatedReports = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredReports.slice(start, start + rowsPerPage);
  }, [filteredReports, page, rowsPerPage]);

  const statusSummary = useMemo(() => {
    return DISPLAY_STATUSES.map((key) => {
      const count = visibleReports.filter(
        (report) => report.status === key
      ).length;
      return { ...STATUS_META[key], count };
    });
  }, [visibleReports]);

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedReport(null);
  };

  const handleNavigateDetail = (report: AdminDailyReport) => {
    navigate(`/admin/daily-report/${report.id}`, {
      state: { report },
    });
  };

  const handleOpenCarousel = () => {
    if (filteredReports.length > 0) {
      setSelectedReport(filteredReports[0]);
      setIsDialogOpen(true);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Paper sx={{ p: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
            {statusSummary.map((status) => (
              <Chip
                key={status.label}
                label={`${status.label} ${status.count}`}
                color={status.color}
                variant="outlined"
              />
            ))}
            <Chip
              label={`合計 ${visibleReports.length}`}
              color="primary"
              variant="outlined"
            />
          </Stack>
        </Paper>

        {(loadError || staffError) && (
          <Alert severity="error">
            {loadError || staffError?.message || "データの取得に失敗しました。"}
          </Alert>
        )}

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", md: "center" }}
          flexWrap="wrap"
        >
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="status-filter-label">
              ステータスで絞り込む
            </InputLabel>
            <Select
              labelId="status-filter-label"
              value={statusFilter}
              label="ステータスで絞り込む"
              onChange={(event) => {
                setStatusFilter(event.target.value as DisplayStatus | "");
                setPage(0);
              }}
            >
              <MenuItem value="">すべて</MenuItem>
              {DISPLAY_STATUSES.map((key) => (
                <MenuItem key={key} value={key}>
                  {STATUS_META[key].label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="staff-filter-label">スタッフで絞り込む</InputLabel>
            <Select
              labelId="staff-filter-label"
              value={staffFilter}
              label="スタッフで絞り込む"
              onChange={(event) => {
                setStaffFilter(event.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">すべて</MenuItem>
              {staffOptions.map((name) => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            flexGrow={1}
          >
            <TextField
              size="small"
              type="date"
              label="開始日"
              InputLabelProps={{ shrink: true }}
              value={startDate}
              onChange={(event) => {
                setStartDate(event.target.value);
                setPage(0);
              }}
              fullWidth
            />
            <TextField
              size="small"
              type="date"
              label="終了日"
              InputLabelProps={{ shrink: true }}
              value={endDate}
              onChange={(event) => {
                setEndDate(event.target.value);
                setPage(0);
              }}
              fullWidth
            />
          </Stack>
        </Stack>

        <Stack direction="row" justifyContent="flex-end">
          <Button
            variant="contained"
            onClick={handleOpenCarousel}
            disabled={filteredReports.length === 0}
          >
            まとめて確認
          </Button>
        </Stack>

        <Paper>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>日付</TableCell>
                  <TableCell>スタッフ</TableCell>
                  <TableCell>タイトル</TableCell>
                  <TableCell>ステータス</TableCell>
                  <TableCell>最終更新</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoadingReports || isStaffLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      読み込み中...
                    </TableCell>
                  </TableRow>
                ) : paginatedReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      条件に一致する日報がありません。
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedReports.map((report) => (
                    <TableRow
                      key={report.id}
                      hover
                      onClick={() => handleNavigateDetail(report)}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell>{report.date}</TableCell>
                      <TableCell>{report.author}</TableCell>
                      <TableCell>{report.title}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          color={STATUS_META[report.status].color}
                          label={STATUS_META[report.status].label}
                        />
                      </TableCell>
                      <TableCell>
                        {report.updatedAt
                          ? formatDateTimeReadable(report.updatedAt)
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredReports.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 25, 50]}
          />
        </Paper>
      </Stack>

      {selectedReport && (
        <DailyReportCarouselDialog
          open={isDialogOpen}
          onClose={handleCloseDialog}
          selectedReport={selectedReport}
          filteredReports={filteredReports}
        />
      )}
    </Container>
  );
}
