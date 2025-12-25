import {
  Container,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import { WorkflowCategory, WorkflowStatus } from "@shared/api/graphql/types";
import StatusChip from "@shared/ui/chips/StatusChip";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import useStaffs from "@/hooks/useStaffs/useStaffs";
import useWorkflows from "@/hooks/useWorkflows/useWorkflows";
import {
  CATEGORY_LABELS,
  getWorkflowCategoryLabel,
  STATUS_LABELS,
} from "@/lib/workflowLabels";

const STATUS_ALL_VALUE = "__ALL__";
const STATUS_EXCLUDED_FROM_DEFAULT: WorkflowStatus[] = [
  WorkflowStatus.CANCELLED,
  WorkflowStatus.APPROVED,
];

export default function AdminWorkflow() {
  const { workflows, loading, error } = useWorkflows();
  const { staffs, loading: staffLoading, error: staffError } = useStaffs();
  const navigate = useNavigate();

  // フィルター/ページネーション state
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [statusInitialized, setStatusInitialized] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // 利用可能なカテゴリとステータスをワークフローから抽出
  const categories = Array.from(
    new Set((workflows || []).map((w) => w.category).filter(Boolean))
  ) as Array<WorkflowCategory>;
  const statuses = Array.from(
    new Set((workflows || []).map((w) => w.status).filter(Boolean))
  ) as Array<WorkflowStatus>;

  useEffect(() => {
    if (statusInitialized) return;
    if (statuses.length === 0) return;

    const initialStatuses = statuses.filter(
      (s) => !STATUS_EXCLUDED_FROM_DEFAULT.includes(s)
    );
    setStatusFilter(initialStatuses);
    setStatusInitialized(true);
  }, [statuses, statusInitialized]);

  // フィルタ適用
  const filteredWorkflows = (workflows || []).filter((w) => {
    if (categoryFilter && w.category !== categoryFilter) return false;
    if (statusFilter.length > 0 && !statusFilter.includes(w.status))
      return false;
    return true;
  });

  // 作成日で降順にソートしてからページネーションを適用
  const sortedWorkflows = (filteredWorkflows || []).slice().sort((a, b) => {
    const at = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bt - at; // 降順
  });

  const paginatedWorkflows = sortedWorkflows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // ページングリセット: フィルター変更時にページを先頭に戻す
  useEffect(() => {
    setPage(0);
  }, [categoryFilter, statusFilter]);

  const handleStatusChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    const nextValue = typeof value === "string" ? value.split(",") : value;

    if (nextValue.includes(STATUS_ALL_VALUE)) {
      setStatusFilter([]);
      return;
    }

    setStatusFilter(nextValue);
  };

  if (loading || staffLoading) return <LinearProgress />;
  if (error || staffError)
    return (
      <Typography>
        データ取得中に問題が発生しました。管理者に連絡してください。
      </Typography>
    );

  return (
    <Container maxWidth="xl" sx={{ height: 1, pt: 2 }}>
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          ワークフローの一覧を表示します。管理者用の画面です。
        </Typography>

        {/* フィルター */}
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="category-filter-label">種別</InputLabel>
            <Select
              labelId="category-filter-label"
              value={categoryFilter}
              label="種別"
              onChange={(e) => setCategoryFilter(String(e.target.value))}
            >
              <MenuItem value="">すべて</MenuItem>
              {categories.map((c) => (
                <MenuItem key={String(c)} value={String(c)}>
                  {CATEGORY_LABELS[String(c) as WorkflowCategory] || String(c)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="status-filter-label">ステータス</InputLabel>
            <Select
              labelId="status-filter-label"
              multiple
              value={statusFilter}
              label="ステータス"
              onChange={handleStatusChange}
              renderValue={(selected) =>
                selected.length === 0
                  ? "すべて"
                  : selected
                      .map(
                        (s) =>
                          STATUS_LABELS[String(s) as WorkflowStatus] ||
                          String(s)
                      )
                      .join("、")
              }
            >
              <MenuItem value={STATUS_ALL_VALUE}>すべて</MenuItem>
              {statuses.map((s) => (
                <MenuItem key={String(s)} value={String(s)}>
                  {STATUS_LABELS[String(s) as WorkflowStatus] || String(s)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <Paper sx={{ p: 2 }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>種別</TableCell>
                  <TableCell>申請者</TableCell>
                  <TableCell>ステータス</TableCell>
                  <TableCell>作成日</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedWorkflows.map((w) => {
                  const staff = staffs.find((s) => s.id === w.staffId);
                  const staffName = staff
                    ? `${staff.familyName || ""}${staff.givenName || ""}`
                    : w.staffId || "不明";
                  const categoryLabel = getWorkflowCategoryLabel(w);

                  return (
                    <TableRow
                      key={w.id}
                      hover
                      onClick={() => navigate(`/admin/workflow/${w.id}`)}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell>{categoryLabel}</TableCell>
                      <TableCell>{staffName}</TableCell>
                      <TableCell>
                        <StatusChip status={w.status} />
                      </TableCell>
                      <TableCell>
                        {w.createdAt ? w.createdAt.split("T")[0] : ""}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredWorkflows.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 25, 50]}
          />
        </Paper>
      </Stack>
    </Container>
  );
}
