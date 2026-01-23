import { useStaffs } from "@entities/staff/model/useStaffs/useStaffs";
import CloudDownloadOutlinedIcon from "@mui/icons-material/CloudDownloadOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import {
  Alert,
  Button,
  Chip,
  Container,
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
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
} from "@mui/material";
import { listDailyReports } from "@shared/api/graphql/documents/queries";
import type { ListDailyReportsQuery } from "@shared/api/graphql/types";
import type { GraphQLResult } from "aws-amplify/api";
import dayjs, { type Dayjs } from "dayjs";
import {
  ChangeEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "@/context/AuthContext";
import { useSplitView } from "@/features/splitView";
import { graphqlClient } from "@/shared/api/amplify/graphqlClient";
import { BUTTON_MIN_WIDTH } from "@/shared/config/uiDimensions";
import { formatDateTimeReadable } from "@/shared/lib/date";

import DailyReportCarouselDialog from "./DailyReportCarouselDialog";
import {
  type AdminDailyReport,
  DISPLAY_STATUSES,
  type DisplayStatus,
  mapDailyReport,
  STATUS_META,
} from "./data";

const CSV_HEADER = [
  "日付",
  "スタッフID",
  "スタッフ名",
  "タイトル",
  "内容",
  "作成日時",
  "更新日時",
];

const compareReportByDateDesc = (a: AdminDailyReport, b: AdminDailyReport) => {
  if (a.date === b.date) {
    return (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "");
  }
  return b.date.localeCompare(a.date);
};

const sanitizeCsvValue = (value: string): string => {
  const normalized = value.replace(/\r?\n/g, " ");
  const escaped = normalized.replace(/"/g, '""');
  if (/[",]/.test(escaped)) return `"${escaped}"`;
  return escaped;
};

export const buildDailyReportCsv = (reports: AdminDailyReport[]): string => {
  const sortedReports = [...reports].sort(compareReportByDateDesc);

  const lines = sortedReports.map((report) =>
    [
      report.date,
      report.staffId,
      report.author,
      report.title,
      report.content,
      report.createdAt ?? "",
      report.updatedAt ?? "",
    ]
      .map((value) => sanitizeCsvValue(value ?? ""))
      .join(",")
  );

  return [CSV_HEADER.join(","), ...lines].join("\n");
};

export const formatDailyReportFileName = (timestamp: Dayjs = dayjs()): string =>
  `daily_reports_${timestamp.format("YYYYMMDD_HHmmss")}.csv`;

export default function AdminDailyReportManagement() {
  const { authStatus } = useContext(AuthContext);
  const isAuthenticated = authStatus === "authenticated";
  const navigate = useNavigate();
  const { enableSplitMode, setRightPanel } = useSplitView();
  const { staffs, loading: isStaffLoading, error: staffError } = useStaffs({
    isAuthenticated,
  });
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

      setReports(aggregated.sort(compareReportByDateDesc));
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

  const handleOpenInRightPanel = useCallback(
    (report: AdminDailyReport) => {
      enableSplitMode();
      setRightPanel({
        id: `daily-report-${report.id}`,
        title: `日報詳細 - ${report.date}`,
        route: `/admin/daily-report/${report.id}`,
      });
    },
    [enableSplitMode, setRightPanel]
  );

  const handleOpenCarousel = () => {
    if (filteredReports.length > 0) {
      setSelectedReport(filteredReports[0]);
      setIsDialogOpen(true);
    }
  };

  const handleExportCsv = useCallback(() => {
    if (filteredReports.length === 0) return;

    const exportData = buildDailyReportCsv(filteredReports);
    const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
    const blob = new Blob([bom, exportData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.download = formatDailyReportFileName();
    anchor.href = url;
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(url);
  }, [filteredReports]);

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

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
        >
          <Button
            variant="contained"
            color="secondary"
            startIcon={<CloudDownloadOutlinedIcon />}
            onClick={handleExportCsv}
            disabled={filteredReports.length === 0}
            disableElevation
            sx={{
              minWidth: BUTTON_MIN_WIDTH,
              fontWeight: "bold",
              transition: "transform 150ms ease",
              "&:hover": {
                backgroundColor: "secondary.main",
                boxShadow: "none",
                transform: "translateY(-3px)",
              },
              "&:active": { transform: "translateY(-1px)" },
              "&.Mui-disabled": { transform: "none", opacity: 0.6 },
            }}
          >
            CSV出力
          </Button>
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
                  <TableCell sx={{ width: "50px" }} />
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
                    <TableCell colSpan={6} align="center">
                      読み込み中...
                    </TableCell>
                  </TableRow>
                ) : paginatedReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      条件に一致する日報がありません。
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedReports.map((report) => (
                    <TableRow key={report.id} hover sx={{ cursor: "pointer" }}>
                      <TableCell sx={{ width: "50px", padding: "8px 4px" }}>
                        <Tooltip title="右側で開く">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenInRightPanel(report);
                            }}
                            sx={{
                              padding: "4px",
                              "&:hover": {
                                backgroundColor: "rgba(0, 0, 0, 0.04)",
                              },
                            }}
                          >
                            <OpenInNewOutlinedIcon sx={{ fontSize: "18px" }} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                      <TableCell onClick={() => handleNavigateDetail(report)}>
                        {report.date}
                      </TableCell>
                      <TableCell onClick={() => handleNavigateDetail(report)}>
                        {report.author}
                      </TableCell>
                      <TableCell onClick={() => handleNavigateDetail(report)}>
                        {report.title}
                      </TableCell>
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
