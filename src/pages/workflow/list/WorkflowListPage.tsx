import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
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

import { DESIGN_TOKENS } from "@/shared/designSystem";
import { PageSection } from "@/shared/ui/layout";
import {
  useWorkflowListViewModel,
  type WorkflowListViewModel,
} from "@/features/workflow/list/useWorkflowListViewModel";
import type { WorkflowListItem } from "@/features/workflow/list/workflowListModel";
import { STATUS_LABELS } from "@/lib/workflowLabels";

import WorkflowListFilters, {
  type WorkflowListFiltersHandle,
} from "./components/WorkflowListFilters";

const CANCELLED_LABEL = STATUS_LABELS[WorkflowStatus.CANCELLED];

const formatWorkflowDate: GridValueFormatter<
  WorkflowListItem,
  string | undefined,
  string,
  string | undefined
> = (value) => value ?? "-";

export default function WorkflowListPage() {
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

  const handleRowClick = useCallback(
    (params: GridRowParams<WorkflowListItem>) => {
      const key = params.row.rawId
        ? params.row.rawId
        : `${params.row.name}-${params.row.createdAt}`;
      navigate(`/workflow/${encodeURIComponent(key)}`);
    },
    [navigate]
  );

  const getRowClassName = useCallback(
    (params: GridRowClassNameParams<WorkflowListItem>) =>
      params.row.rawStatus === WorkflowStatus.CANCELLED ||
      params.row.status === CANCELLED_LABEL
        ? "status-cancelled"
        : "",
    []
  );

  const getRowId = useCallback((row: WorkflowListItem) => {
    return row.rawId ? row.rawId : `${row.name}-${row.createdAt}`;
  }, []);

  if (!isAuthenticated) {
    return (
      <Page title="ワークフロー" maxWidth="lg">
        <PageSection
          variant="plain"
          sx={{
            minHeight: 240,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </PageSection>
      </Page>
    );
  }

  return (
    <Page title="ワークフロー" maxWidth="lg">
      <PageSection
        sx={{
          boxShadow: DESIGN_TOKENS.component.workflowList.cardShadow,
          borderRadius: DESIGN_TOKENS.component.workflowList.cardRadius,
        }}
      >
        <Stack spacing={2}>
          <Alert severity="warning" variant="standard">
            現在この機能は開発中（ベータ）です。管理者より指示された場合を除き、ご利用はお控えください。
          </Alert>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
          >
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexWrap: "wrap",
                gap: 1.5,
                alignItems: "center",
              }}
            >
              {anyFilterActive && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ClearIcon fontSize="small" />}
                  onClick={() => {
                    clearFilters();
                    filterRowRef.current?.closeAllPopovers();
                  }}
                >
                  すべてのフィルターをクリア
                </Button>
              )}
            </Box>
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate("/workflow/new")}
              >
                新規作成
              </Button>
            </Box>
          </Stack>
        </Stack>

        {currentStaffId ? (
          <Box>
            {error && (
              <Box sx={{ mb: 2 }}>
                <Alert severity="error">{error}</Alert>
              </Box>
            )}
            <Table
              size="small"
              sx={{ mb: 1, tableLayout: "fixed" }}
              aria-hidden
            >
              <TableHead>
                <TableRow>
                  <TableCell>種別</TableCell>
                  <TableCell>申請日</TableCell>
                  <TableCell>ステータス</TableCell>
                  <TableCell>作成日</TableCell>
                </TableRow>
                <WorkflowListFilters
                  ref={filterRowRef}
                  filters={filters}
                  setFilter={setFilter}
                />
              </TableHead>
            </Table>
            <Box sx={{ height: 520, width: "100%" }}>
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
                rowHeight={56}
                columnHeaderHeight={0}
                getRowClassName={getRowClassName}
                sx={{
                  "& .MuiDataGrid-columnHeaders": { display: "none" },
                  "& .status-cancelled .MuiDataGrid-cell": {
                    color: "text.disabled",
                  },
                  "& .MuiDataGrid-row": {
                    cursor: "pointer",
                  },
                  "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within":
                    {
                      outline: "none",
                    },
                }}
              />
            </Box>
          </Box>
        ) : (
          <Box sx={{ my: 4, display: "flex", justifyContent: "center" }}>
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
        )}
      </PageSection>
    </Page>
  );
}
