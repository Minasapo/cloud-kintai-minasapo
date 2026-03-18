import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
  type GridRowClassNameParams,
  type GridRowParams,
  type GridValueFormatter,
} from "@mui/x-data-grid";
import { WorkflowStatus } from "@shared/api/graphql/types";
import StatusChip from "@shared/ui/chips/StatusChip";
import Page from "@shared/ui/page/Page";
import { useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { STATUS_LABELS } from "@/entities/workflow/lib/workflowLabels";
import {
  useWorkflowListViewModel,
  type WorkflowListViewModel,
} from "@/features/workflow/list/useWorkflowListViewModel";
import type { WorkflowListItem } from "@/features/workflow/list/workflowListModel";
import { designTokenVar } from "@/shared/designSystem";
import { DashboardInnerSurface, PageSection } from "@/shared/ui/layout";

import WorkflowListFilters, {
  type WorkflowListFiltersHandle,
  WorkflowListFiltersPanel,
} from "./components/WorkflowListFilters";

const CANCELLED_LABEL = STATUS_LABELS[WorkflowStatus.CANCELLED];

const LOADING_SECTION_MIN_HEIGHT = `calc(${designTokenVar(
  "spacing.xxl",
  "32px"
)} * 7.5)`;
const EMPTY_STATE_PADDING_Y = designTokenVar("spacing.lg", "16px");
const DATA_GRID_HEIGHT_SPACING_UNITS = 130;
const DATA_GRID_ROW_HEIGHT_SPACING_UNITS = 14;
const MOBILE_CARD_GAP = designTokenVar("spacing.md", "12px");
const MOBILE_CARD_PADDING = designTokenVar("spacing.lg", "16px");
const MOBILE_CARD_RADIUS = designTokenVar("radius.lg", "16px");
const MOBILE_META_GAP = designTokenVar("spacing.xs", "4px");
const MOBILE_ACTION_GAP = designTokenVar("spacing.sm", "8px");
const MOBILE_EMPTY_PADDING = designTokenVar("spacing.xl", "24px");
const MOBILE_FILTER_PADDING_X = designTokenVar("spacing.md", "12px");
const MOBILE_FILTER_PADDING_Y = designTokenVar("spacing.sm", "8px");
const MOBILE_FILTER_BADGE_PADDING = designTokenVar("spacing.xs", "4px");
const MOBILE_FILTER_BADGE_RADIUS = designTokenVar("radius.md", "12px");

const formatWorkflowDateValue = (value?: string) => value ?? "-";

const formatWorkflowDate: GridValueFormatter<
  WorkflowListItem,
  string | undefined,
  string,
  string | undefined
> = (value) => formatWorkflowDateValue(value);

function Surface({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[1.6rem] border border-emerald-100/80 bg-white/90 p-4 shadow-[0_24px_54px_-40px_rgba(15,23,42,0.35)] sm:p-5 ${className}`.trim()}
    >
      {children}
    </div>
  );
}

export default function WorkflowListPage() {
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down("md"));
  const spacingToNumber = useCallback(
    (units: number) => parseFloat(theme.spacing(units)),
    [theme]
  );
  const dataGridContainerHeight = useMemo(
    () => theme.spacing(DATA_GRID_HEIGHT_SPACING_UNITS),
    [theme]
  );
  const dataGridRowHeight = useMemo(
    () => spacingToNumber(DATA_GRID_ROW_HEIGHT_SPACING_UNITS),
    [spacingToNumber]
  );
  const navigate = useNavigate();

  const {
    isAuthenticated,
    currentStaffId,
    loading,
    error,
    filteredItems,
    filters,
    anyFilterActive,
    setFilter,
    clearFilters,
  }: WorkflowListViewModel = useWorkflowListViewModel();
  const filterRowRef = useRef<WorkflowListFiltersHandle>(null);

  const columns = useMemo<GridColDef<WorkflowListItem>[]>(
    () => [
      {
        field: "category",
        headerName: "種別",
        flex: 1,
        minWidth: 140,
        sortable: false,
      },
      {
        field: "applicationDate",
        headerName: "申請日",
        flex: 1,
        minWidth: 160,
        sortable: false,
        valueFormatter: formatWorkflowDate,
      },
      {
        field: "status",
        headerName: "ステータス",
        flex: 1,
        minWidth: 160,
        sortable: false,
        renderCell: (
          params: GridRenderCellParams<WorkflowListItem, string | undefined>
        ) => <StatusChip status={params.row.rawStatus || params.value || ""} />,
      },
      {
        field: "createdAt",
        headerName: "作成日",
        flex: 1,
        minWidth: 160,
        sortable: false,
      },
    ],
    []
  );

  const resolveWorkflowKey = useCallback((row: WorkflowListItem) => {
    return row.rawId ? row.rawId : `${row.name}-${row.createdAt}`;
  }, []);

  const handleRowClick = useCallback(
    (params: GridRowParams<WorkflowListItem>) => {
      navigate(`/workflow/${encodeURIComponent(resolveWorkflowKey(params.row))}`);
    },
    [navigate, resolveWorkflowKey]
  );

  const handleCardClick = useCallback(
    (row: WorkflowListItem) => {
      navigate(`/workflow/${encodeURIComponent(resolveWorkflowKey(row))}`);
    },
    [navigate, resolveWorkflowKey]
  );

  const getRowClassName = useCallback(
    (params: GridRowClassNameParams<WorkflowListItem>) =>
      params.row.rawStatus === WorkflowStatus.CANCELLED ||
      params.row.status === CANCELLED_LABEL
        ? "status-cancelled"
        : "",
    []
  );

  const getRowId = useCallback(
    (row: WorkflowListItem) => resolveWorkflowKey(row),
    [resolveWorkflowKey]
  );
  const statusSummary = useMemo(() => {
    const counts = new Map<string, number>();
    filteredItems.forEach((item) => {
      const key = item.rawStatus || item.status || "UNKNOWN";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return {
      total: filteredItems.length,
      pending:
        counts.get(WorkflowStatus.SUBMITTED) ??
        counts.get(STATUS_LABELS[WorkflowStatus.SUBMITTED]) ??
        0,
      approved:
        counts.get(WorkflowStatus.APPROVED) ??
        counts.get(STATUS_LABELS[WorkflowStatus.APPROVED]) ??
        0,
    };
  }, [filteredItems]);

  if (!isAuthenticated) {
    return (
      <Page title="ワークフロー" maxWidth="lg" showDefaultHeader={false}>
        <PageSection layoutVariant="dashboard">
          <DashboardInnerSurface
            className="flex items-center justify-center"
            style={{ minHeight: LOADING_SECTION_MIN_HEIGHT }}
          >
            <CircularProgress />
          </DashboardInnerSurface>
        </PageSection>
      </Page>
    );
  }

  return (
    <Page title="ワークフロー" maxWidth="lg" showDefaultHeader={false}>
      <PageSection layoutVariant="dashboard" variant="plain" className="px-0 py-0 md:px-0">
        <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-4 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <section className="rounded-[1.8rem] border border-emerald-100/80 bg-[linear-gradient(135deg,#f7fcf8_0%,#ecfdf5_58%,#ffffff_100%)] p-5 shadow-[0_28px_60px_-42px_rgba(15,23,42,0.35)] sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-2">
                <h1 className="text-[1.85rem] font-semibold tracking-tight text-slate-950 sm:text-[2.2rem]">
                  ワークフロー
                </h1>
                <p className="max-w-3xl text-sm leading-6 text-slate-600 sm:text-[0.95rem]">
                  申請の一覧、状態確認、新規作成をひとつの画面で進められます。現在の申請状況を見ながら、必要な絞り込みや作成にすぐ移れます。
                </p>
              </div>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate("/workflow/new")}
                fullWidth={isCompact}
                sx={{
                  width: { xs: "100%", lg: "auto" },
                  minWidth: { lg: "fit-content" },
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {isCompact ? "新規" : "新規作成"}
              </Button>
            </div>
          </section>

          {currentStaffId ? (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                <Surface className="p-4">
                  <p className="text-xs font-medium tracking-[0.04em] text-slate-500">全件数</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">{statusSummary.total}</p>
                </Surface>
                <Surface className="p-4">
                  <p className="text-xs font-medium tracking-[0.04em] text-slate-500">承認待ち</p>
                  <p className="mt-2 text-2xl font-semibold text-amber-700">{statusSummary.pending}</p>
                </Surface>
                <Surface className="p-4">
                  <p className="text-xs font-medium tracking-[0.04em] text-slate-500">承認済み</p>
                  <p className="mt-2 text-2xl font-semibold text-emerald-700">{statusSummary.approved}</p>
                </Surface>
              </div>

              {error && <Alert severity="error">{error}</Alert>}

              <Surface>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                      <p className="text-base font-semibold text-slate-900">申請一覧</p>
                      <p className="text-sm leading-6 text-slate-500">
                        種別、申請日、ステータス、作成日で確認できます。
                      </p>
                    </div>
                    {anyFilterActive ? (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ClearIcon fontSize="small" />}
                        onClick={() => {
                          clearFilters();
                          filterRowRef.current?.closeAllPopovers();
                        }}
                      >
                        フィルターをクリア
                      </Button>
                    ) : null}
                  </div>

                  {isCompact ? (
                    <Accordion
                      disableGutters
                      elevation={0}
                      sx={{
                        borderRadius: "1.4rem",
                        border: "1px solid rgba(16, 185, 129, 0.14)",
                        bgcolor: "#f7fcf8",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)",
                        "&:before": { display: "none" },
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{
                          px: MOBILE_FILTER_PADDING_X,
                          py: MOBILE_FILTER_PADDING_Y,
                          "& .MuiAccordionSummary-expandIconWrapper": {
                            color: "#64748b",
                          },
                          "& .MuiAccordionSummary-content": { my: 0 },
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          sx={{ width: "100%", justifyContent: "space-between" }}
                        >
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#0f172a" }}>
                            フィルター
                          </Typography>
                          {anyFilterActive && (
                            <Box
                              sx={{
                                px: `calc(${MOBILE_FILTER_BADGE_PADDING} * 2)`,
                                py: "2px",
                                borderRadius: MOBILE_FILTER_BADGE_RADIUS,
                                bgcolor: "rgba(16, 185, 129, 0.1)",
                                color: "#047857",
                                fontSize: 12,
                                fontWeight: 700,
                                lineHeight: 1.6,
                              }}
                            >
                              適用中
                            </Box>
                          )}
                        </Stack>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: MOBILE_FILTER_PADDING_X }}>
                        <WorkflowListFiltersPanel
                          ref={filterRowRef}
                          filters={filters}
                          setFilter={setFilter}
                        />
                      </AccordionDetails>
                    </Accordion>
                  ) : (
                    <Box
                      sx={{
                        borderRadius: "24px",
                        border: "1px solid rgba(16, 185, 129, 0.14)",
                        bgcolor: "#f7fcf8",
                        p: 1.5,
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)",
                      }}
                    >
                      <Table
                        size="small"
                        sx={{
                          tableLayout: "fixed",
                          borderCollapse: "separate",
                          borderSpacing: "0 8px",
                          "& .MuiTableCell-root": {
                            borderBottom: "none",
                          },
                        }}
                        aria-hidden
                      >
                        <TableHead>
                        <TableRow>
                          <TableCell sx={{ px: 1, pb: 0.5, color: "#64748b", fontSize: "0.74rem", fontWeight: 700, letterSpacing: "0.04em" }}>種別</TableCell>
                          <TableCell sx={{ px: 1, pb: 0.5, color: "#64748b", fontSize: "0.74rem", fontWeight: 700, letterSpacing: "0.04em" }}>申請日</TableCell>
                          <TableCell sx={{ px: 1, pb: 0.5, color: "#64748b", fontSize: "0.74rem", fontWeight: 700, letterSpacing: "0.04em" }}>ステータス</TableCell>
                          <TableCell sx={{ px: 1, pb: 0.5, color: "#64748b", fontSize: "0.74rem", fontWeight: 700, letterSpacing: "0.04em" }}>作成日</TableCell>
                        </TableRow>
                        <WorkflowListFilters
                          ref={filterRowRef}
                          filters={filters}
                          setFilter={setFilter}
                        />
                        </TableHead>
                      </Table>
                    </Box>
                  )}

                  {isCompact ? (
                    <Box>
                      {loading ? (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            py: MOBILE_EMPTY_PADDING,
                          }}
                        >
                          <CircularProgress />
                        </Box>
                      ) : filteredItems.length === 0 ? (
                        <Alert severity="info">該当するワークフローがありません。</Alert>
                      ) : (
                        <Stack spacing={MOBILE_CARD_GAP}>
                          {filteredItems.map((item) => {
                            const key = getRowId(item);
                            return (
                              <ButtonBase
                                key={key}
                                onClick={() => handleCardClick(item)}
                                sx={{
                                  width: "100%",
                                  textAlign: "left",
                                  borderRadius: MOBILE_CARD_RADIUS,
                                }}
                              >
                                <Paper
                                  sx={{
                                    width: "100%",
                                    p: MOBILE_CARD_PADDING,
                                    borderRadius: MOBILE_CARD_RADIUS,
                                    border: "1px solid",
                                    borderColor: "divider",
                                    bgcolor: "background.paper",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: MOBILE_ACTION_GAP,
                                  }}
                                >
                                  <Stack
                                    direction={{ xs: "column", sm: "row" }}
                                    spacing={MOBILE_ACTION_GAP}
                                    alignItems={{ xs: "flex-start", sm: "center" }}
                                    justifyContent="space-between"
                                  >
                                    <Typography
                                      variant="subtitle1"
                                      fontWeight={600}
                                      sx={{ minWidth: 0, wordBreak: "break-word" }}
                                    >
                                      {item.category || "-"}
                                    </Typography>
                                    <Box
                                      sx={{
                                        maxWidth: "100%",
                                        alignSelf: { xs: "flex-start", sm: "center" },
                                      }}
                                    >
                                      <StatusChip
                                        status={item.rawStatus || item.status || ""}
                                      />
                                    </Box>
                                  </Stack>
                                  <Stack spacing={MOBILE_META_GAP}>
                                    <Typography variant="caption" color="text.secondary">
                                      申請日
                                    </Typography>
                                    <Typography variant="body2">
                                      {formatWorkflowDateValue(item.applicationDate)}
                                    </Typography>
                                  </Stack>
                                  <Stack
                                    direction={{ xs: "column", sm: "row" }}
                                    spacing={MOBILE_ACTION_GAP}
                                    justifyContent="space-between"
                                  >
                                    <Stack spacing={MOBILE_META_GAP}>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        作成日
                                      </Typography>
                                      <Typography variant="body2">
                                        {item.createdAt || "-"}
                                      </Typography>
                                    </Stack>
                                    <Stack
                                      spacing={MOBILE_META_GAP}
                                      alignItems={{ xs: "flex-start", sm: "flex-end" }}
                                    >
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        ステータス
                                      </Typography>
                                      <Typography variant="body2">
                                        {item.status || "-"}
                                      </Typography>
                                    </Stack>
                                  </Stack>
                                </Paper>
                              </ButtonBase>
                            );
                          })}
                        </Stack>
                      )}
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        height: dataGridContainerHeight,
                        width: "100%",
                        overflow: "hidden",
                        borderRadius: "24px",
                        border: "1px solid rgba(16, 185, 129, 0.14)",
                        bgcolor: "#f8fffb",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)",
                      }}
                    >
                      <DataGrid
                        rows={filteredItems}
                        columns={columns}
                        getRowId={getRowId}
                        disableColumnMenu
                        disableColumnSelector
                        disableDensitySelector
                        disableRowSelectionOnClick
                        hideFooter
                        loading={loading}
                        onRowClick={handleRowClick}
                        rowHeight={dataGridRowHeight}
                        columnHeaderHeight={0}
                        getRowClassName={getRowClassName}
                        sx={{
                          border: "none",
                          bgcolor: "transparent",
                          "& .MuiDataGrid-columnHeaders": { display: "none" },
                          "& .MuiDataGrid-main": {
                            bgcolor: "transparent",
                          },
                          "& .MuiDataGrid-virtualScroller": {
                            bgcolor: "transparent",
                          },
                          "& .MuiDataGrid-row": {
                            cursor: "pointer",
                            bgcolor: "rgba(255,255,255,0.92)",
                            transition: "background-color 0.18s ease, transform 0.18s ease",
                          },
                          "& .MuiDataGrid-row:hover": {
                            bgcolor: "#ecfdf5",
                          },
                          "& .MuiDataGrid-row:not(:last-of-type)": {
                            borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
                          },
                          "& .MuiDataGrid-cell": {
                            borderBottom: "none",
                            px: 2.25,
                            color: "#0f172a",
                          },
                          "& .MuiDataGrid-overlay": {
                            bgcolor: "transparent",
                          },
                          "& .status-cancelled .MuiDataGrid-cell": {
                            color: "text.disabled",
                          },
                          "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within":
                            {
                              outline: "none",
                            },
                        }}
                      />
                    </Box>
                  )}
                </div>
              </Surface>
            </>
          ) : (
            <Surface>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  py: EMPTY_STATE_PADDING_Y,
                }}
              >
                {loading ? (
                  <CircularProgress />
                ) : (
                  <Alert severity="info">
                    ログイン中のアカウントに紐づくスタッフ情報が見つからないため、一覧を表示できません。
                    <br />
                    スタッフアカウントが未登録の場合は管理者にお問い合わせください。
                  </Alert>
                )}
              </Box>
            </Surface>
          )}
        </div>
      </PageSection>
    </Page>
  );
}
