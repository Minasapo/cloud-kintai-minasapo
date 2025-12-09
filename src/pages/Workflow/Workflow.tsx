import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Popover from "@mui/material/Popover";
import Select from "@mui/material/Select";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import { DatePicker } from "@mui/x-date-pickers";
import StatusChip from "@shared/ui/chips/StatusChip";
import Page from "@shared/ui/page/Page";
import dayjs, { Dayjs } from "dayjs";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { WorkflowCategory, WorkflowStatus } from "@/API";
import { AuthContext } from "@/context/AuthContext";
import useStaffs from "@/hooks/useStaffs/useStaffs";
import useWorkflows from "@/hooks/useWorkflows/useWorkflows";
import { CATEGORY_LABELS, STATUS_LABELS } from "@/lib/workflowLabels";

type WorkflowItem = {
  name: string;
  category: string; // displayed label
  status: string; // displayed label
  rawCategory?: string; // enum value from API
  rawStatus?: string; // enum value from API
  rawId?: string; // API id when available
  rawStaffId?: string;
  createdAt: string; // YYYY-MM-DD
  applicationDate?: string; // 申請日 (YYYY-MM-DD)
};

export default function Workflow() {
  const navigate = useNavigate();

  const { workflows, loading, error } = useWorkflows();
  const { staffs } = useStaffs();
  const { cognitoUser, authStatus } = useContext(AuthContext);
  const isAuthenticated = authStatus === "authenticated";
  const currentStaffId = useMemo(() => {
    if (!cognitoUser?.id) return undefined;
    return staffs.find((s) => s.cognitoUserId === cognitoUser.id)?.id;
  }, [cognitoUser, staffs]);
  const [data, setData] = useState<WorkflowItem[]>([]);
  const [nameFilter, setNameFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");
  const [applicationFrom, setApplicationFrom] = useState("");
  const [applicationTo, setApplicationTo] = useState("");
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [createdAnchorEl, setCreatedAnchorEl] = useState<HTMLElement | null>(
    null
  );
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filtered = useMemo(() => {
    return data.filter((w) => {
      // id removed from mock data
      if (nameFilter && !w.name.includes(nameFilter)) return false;
      // categoryFilter/statusFilter now contain enum values (raw). Compare with raw fields when available,
      // but also allow matching against displayed labels for legacy/mock rows.
      if (categoryFilter) {
        const matchesRaw = w.rawCategory
          ? w.rawCategory === categoryFilter
          : false;
        const matchesLabel =
          w.category === categoryFilter ||
          w.category === CATEGORY_LABELS[categoryFilter as string];
        if (!matchesRaw && !matchesLabel) return false;
      }
      if (statusFilter) {
        const matchesRaw = w.rawStatus ? w.rawStatus === statusFilter : false;
        const matchesLabel =
          w.status === statusFilter ||
          w.status === STATUS_LABELS[statusFilter as string];
        if (!matchesRaw && !matchesLabel) return false;
      }
      if (
        applicationFrom &&
        (!w.applicationDate || w.applicationDate < applicationFrom)
      )
        return false;
      if (
        applicationTo &&
        (!w.applicationDate || w.applicationDate > applicationTo)
      )
        return false;
      if (createdFrom && w.createdAt < createdFrom) return false;
      if (createdTo && w.createdAt > createdTo) return false;
      return true;
    });
  }, [
    data,
    nameFilter,
    categoryFilter,
    statusFilter,
    applicationFrom,
    applicationTo,
    createdFrom,
    createdTo,
  ]);
  // ensure categoryFilter is included in dependencies

  // reset to first page when filters change
  useEffect(() => {
    setPage(0);
  }, [filtered]);

  // map API workflows to local WorkflowItem shape whenever workflows change
  useEffect(() => {
    if (!workflows) return;
    const mapped: WorkflowItem[] = workflows.map((it) => ({
      name: it.id || "",
      rawStaffId: it.staffId || undefined,
      rawId: it.id || undefined,
      rawStatus: it.status || undefined,
      status: it.status ? STATUS_LABELS[it.status] || it.status : "",
      rawCategory: it.category || undefined,
      category: it.category ? CATEGORY_LABELS[it.category] || it.category : "",
      createdAt: it.createdAt ? it.createdAt.split("T")[0] : "",
      applicationDate: it.overTimeDetails ? it.overTimeDetails.date : undefined,
    }));
    // sort by applicationDate desc (YYYY-MM-DD lexicographic sort works),
    // fallback to createdAt desc when applicationDate is missing
    mapped.sort((a, b) => {
      const aApp = a.applicationDate || "";
      const bApp = b.applicationDate || "";
      if (aApp && bApp) return bApp.localeCompare(aApp);
      if (aApp && !bApp) return -1; // a has app date -> comes first
      if (!aApp && bApp) return 1; // b has app date -> comes first
      // both missing applicationDate -> fallback to createdAt desc
      return (b.createdAt || "").localeCompare(a.createdAt || "");
    });
    // show only workflows created by the logged-in staff (if identifiable)
    if (currentStaffId) {
      setData(mapped.filter((m) => m.rawStaffId === currentStaffId));
    } else {
      // if we can't determine current staff, show empty list to avoid leaking others' data
      setData([]);
    }
  }, [workflows, cognitoUser, staffs]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const anyFilterActive = Boolean(
    nameFilter ||
      categoryFilter ||
      statusFilter ||
      createdFrom ||
      createdTo ||
      applicationFrom ||
      applicationTo
  );

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
      <Paper sx={{ p: 3 }}>
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
                  setNameFilter("");
                  setCategoryFilter("");
                  setStatusFilter("");
                  setCreatedFrom("");
                  setCreatedTo("");
                  setApplicationFrom("");
                  setApplicationTo("");
                  setAnchorEl(null);
                  setCreatedAnchorEl(null);
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
          <TableContainer>
            {loading && (
              <Box
                sx={{
                  mb: 2,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <CircularProgress />
              </Box>
            )}
            {error && (
              <Box sx={{ mb: 2 }}>
                <Alert severity="error">{error}</Alert>
              </Box>
            )}
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>種別</TableCell>
                  <TableCell>申請日</TableCell>
                  <TableCell>ステータス</TableCell>
                  <TableCell>作成日</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Select
                      size="small"
                      displayEmpty
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      <MenuItem value="">すべて</MenuItem>
                      <MenuItem value={WorkflowCategory.PAID_LEAVE}>
                        {CATEGORY_LABELS[WorkflowCategory.PAID_LEAVE]}
                      </MenuItem>
                      <MenuItem value={WorkflowCategory.ABSENCE}>
                        {CATEGORY_LABELS[WorkflowCategory.ABSENCE]}
                      </MenuItem>
                      <MenuItem value={WorkflowCategory.OVERTIME}>
                        {CATEGORY_LABELS[WorkflowCategory.OVERTIME]}
                      </MenuItem>
                      {/* 'その他' はフィルタから除外 */}
                    </Select>
                  </TableCell>
                  <TableCell>
                    {/* 申請日のフィルタ：1つのフィールドでレンジ選択（クリックでポップオーバーを開く） */}
                    <TextField
                      size="small"
                      value={
                        applicationFrom && applicationTo
                          ? `${applicationFrom} → ${applicationTo}`
                          : "申請日で絞込"
                      }
                      onClick={(e) =>
                        setAnchorEl(e.currentTarget as HTMLElement)
                      }
                      InputProps={{ readOnly: true }}
                    />
                    <Popover
                      open={Boolean(anchorEl)}
                      anchorEl={anchorEl}
                      onClose={() => setAnchorEl(null)}
                      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                    >
                      <Box sx={{ p: 2, display: "flex", gap: 2 }}>
                        <DatePicker
                          label="From"
                          value={
                            applicationFrom ? dayjs(applicationFrom) : null
                          }
                          onChange={(v: Dayjs | null) => {
                            const str = v ? v.format("YYYY-MM-DD") : "";
                            setApplicationFrom(str);
                          }}
                          slotProps={{ textField: { size: "small" } }}
                        />
                        <DatePicker
                          label="To"
                          value={applicationTo ? dayjs(applicationTo) : null}
                          onChange={(v: Dayjs | null) => {
                            const str = v ? v.format("YYYY-MM-DD") : "";
                            setApplicationTo(str);
                          }}
                          slotProps={{ textField: { size: "small" } }}
                        />
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "flex-end",
                          }}
                        >
                          <Button
                            size="small"
                            onClick={() => {
                              setApplicationFrom("");
                              setApplicationTo("");
                              setAnchorEl(null);
                            }}
                          >
                            クリア
                          </Button>
                        </Box>
                      </Box>
                    </Popover>
                  </TableCell>
                  <TableCell>
                    <Select
                      size="small"
                      displayEmpty
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <MenuItem value="">すべて</MenuItem>
                      <MenuItem value={WorkflowStatus.DRAFT}>
                        {STATUS_LABELS[WorkflowStatus.DRAFT]}
                      </MenuItem>
                      <MenuItem value={WorkflowStatus.SUBMITTED}>
                        {STATUS_LABELS[WorkflowStatus.SUBMITTED]}
                      </MenuItem>
                      <MenuItem value={WorkflowStatus.PENDING}>
                        {STATUS_LABELS[WorkflowStatus.PENDING]}
                      </MenuItem>
                      <MenuItem value={WorkflowStatus.APPROVED}>
                        {STATUS_LABELS[WorkflowStatus.APPROVED]}
                      </MenuItem>
                      <MenuItem value={WorkflowStatus.REJECTED}>
                        {STATUS_LABELS[WorkflowStatus.REJECTED]}
                      </MenuItem>
                      <MenuItem value={WorkflowStatus.CANCELLED}>
                        {STATUS_LABELS[WorkflowStatus.CANCELLED]}
                      </MenuItem>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {/* 作成日のフィルタ：ポップオーバーでレンジ選択 */}
                    <TextField
                      size="small"
                      value={
                        createdFrom && createdTo
                          ? `${createdFrom} → ${createdTo}`
                          : "作成日で絞込"
                      }
                      onClick={(e) =>
                        setCreatedAnchorEl(e.currentTarget as HTMLElement)
                      }
                      InputProps={{ readOnly: true }}
                    />
                    <Popover
                      open={Boolean(createdAnchorEl)}
                      anchorEl={createdAnchorEl}
                      onClose={() => setCreatedAnchorEl(null)}
                      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                    >
                      <Box sx={{ p: 2, display: "flex", gap: 2 }}>
                        <DatePicker
                          label="From"
                          value={createdFrom ? dayjs(createdFrom) : null}
                          onChange={(v: Dayjs | null) => {
                            const str = v ? v.format("YYYY-MM-DD") : "";
                            setCreatedFrom(str);
                          }}
                          slotProps={{ textField: { size: "small" } }}
                        />
                        <DatePicker
                          label="To"
                          value={createdTo ? dayjs(createdTo) : null}
                          onChange={(v: Dayjs | null) => {
                            const str = v ? v.format("YYYY-MM-DD") : "";
                            setCreatedTo(str);
                          }}
                          slotProps={{ textField: { size: "small" } }}
                        />
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "flex-end",
                          }}
                        >
                          <Button
                            size="small"
                            onClick={() => {
                              setCreatedFrom("");
                              setCreatedTo("");
                              setCreatedAnchorEl(null);
                            }}
                          >
                            クリア
                          </Button>
                        </Box>
                      </Box>
                    </Popover>
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((w) => (
                    <TableRow
                      key={w.rawId ? w.rawId : `${w.name}-${w.createdAt}`}
                      onClick={() =>
                        navigate(
                          `/workflow/${encodeURIComponent(
                            w.rawId ? w.rawId : `${w.name}-${w.createdAt}`
                          )}`
                        )
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          navigate(
                            `/workflow/${encodeURIComponent(
                              w.rawId ? w.rawId : `${w.name}-${w.createdAt}`
                            )}`
                          );
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      sx={{
                        cursor: "pointer",
                        "&:hover": { backgroundColor: "action.hover" },
                        ...(w.rawStatus === WorkflowStatus.CANCELLED ||
                        w.status === STATUS_LABELS[WorkflowStatus.CANCELLED]
                          ? { "& td, & th": { color: "text.disabled" } }
                          : {}),
                      }}
                    >
                      <TableCell>{w.category}</TableCell>
                      <TableCell>{w.applicationDate}</TableCell>
                      <TableCell>
                        <StatusChip status={w.rawStatus || w.status} />
                      </TableCell>
                      <TableCell>{w.createdAt}</TableCell>
                      <TableCell />
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
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
        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>
    </Page>
  );
}
