import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { OperationLog } from "@shared/api/graphql/types";
import { AppIconButton } from "@shared/ui/button";

import { LogRow } from "./adminLogsTypes";

type AdminLogsDesktopTableProps = {
  logRows: LogRow[];
  onSelectLog: (log: OperationLog) => void;
};

export default function AdminLogsDesktopTable({
  logRows,
  onSelectLog,
}: AdminLogsDesktopTableProps) {
  return (
    <TableContainer>
      <Table
        aria-label="operation-log-table"
        size="small"
        sx={{ tableLayout: "fixed" }}
      >
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: 180 }}>日時</TableCell>
            <TableCell sx={{ width: 120 }}>アクション</TableCell>
            <TableCell sx={{ width: 170 }}>操作者</TableCell>
            <TableCell sx={{ width: 170 }}>対象者</TableCell>
            <TableCell sx={{ width: 240 }}>対象</TableCell>
            <TableCell>概要</TableCell>
            <TableCell align="center" sx={{ width: 72 }}>
              詳細
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {logRows.map((row) => (
            <TableRow key={row.rowKey} hover>
              <TableCell sx={{ verticalAlign: "top" }}>
                <Typography variant="caption" color="text.secondary">
                  {row.timestampDisplay}
                </Typography>
              </TableCell>
              <TableCell sx={{ verticalAlign: "top" }}>
                <Chip size="small" label={row.actionLabel} />
              </TableCell>
              <TableCell sx={{ verticalAlign: "top" }}>
                <Tooltip title={row.actorDisplay}>
                  <Typography variant="body2" noWrap>
                    {row.actorDisplay}
                  </Typography>
                </Tooltip>
              </TableCell>
              <TableCell sx={{ verticalAlign: "top" }}>
                <Tooltip title={row.targetDisplay}>
                  <Typography variant="body2" noWrap>
                    {row.targetDisplay}
                  </Typography>
                </Tooltip>
              </TableCell>
              <TableCell sx={{ verticalAlign: "top" }}>
                <Tooltip title={row.resourceDisplay}>
                  <Typography variant="subtitle2" noWrap>
                    {row.resourceDisplay}
                  </Typography>
                </Tooltip>
              </TableCell>
              <TableCell sx={{ verticalAlign: "top" }}>
                <Tooltip title={row.summaryDisplay}>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {row.summaryDisplay}
                  </Typography>
                </Tooltip>
              </TableCell>
              <TableCell align="center" sx={{ verticalAlign: "top" }}>
                <Tooltip title="詳細を表示">
                  <AppIconButton
                    aria-label="詳細を表示"
                    onClick={() => onSelectLog(row.log)}
                  >
                    <InfoOutlinedIcon fontSize="small" />
                  </AppIconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
