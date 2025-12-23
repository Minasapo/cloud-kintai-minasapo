import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
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
import { useCallback, useContext, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { DESIGN_TOKENS } from "@/shared/designSystem";
import { AuthContext } from "@/context/AuthContext";
import { useWorkflowListFilters } from "@/features/workflow/list/useWorkflowListFilters";
import type { WorkflowListItem } from "@/features/workflow/list/workflowListModel";
import useStaffs from "@/hooks/useStaffs/useStaffs";
import useWorkflows from "@/hooks/useWorkflows/useWorkflows";
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

  const { workflows, loading, error } = useWorkflows();
  const { staffs } = useStaffs();
  const { cognitoUser, authStatus } = useContext(AuthContext);
  const isAuthenticated = authStatus === "authenticated";
  const currentStaffId = useMemo(() => {
    if (!cognitoUser?.id) return undefined;
    return staffs.find((s) => s.cognitoUserId === cognitoUser.id)?.id;
  }, [cognitoUser, staffs]);
  const { filteredItems, filters, anyFilterActive, setFilter, clearFilters } =
    useWorkflowListFilters({ workflows, currentStaffId });
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
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 240,
          }}
        >
          <CircularProgress />
        </Box>
      </Page>
    );
  }

  return (
    <Page title="ワークフロー" maxWidth="lg">
      <Paper
        sx={{
          p: 3,
          borderRadius: DESIGN_TOKENS.component.workflowList.cardRadius,
          boxShadow: DESIGN_TOKENS.component.workflowList.cardShadow,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Alert severity="warning" variant="standard" sx={{ mb: 2 }}>
            現在この機能は開発中（ベータ）です。管理者より指示された場合を除き、ご利用はお控えください。
          </Alert>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
          <Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate("/workflow/new")}
            >
              新規作成
            </Button>
          </Box>
        </Box>

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
      </Paper>
    </Page>
  );
}
