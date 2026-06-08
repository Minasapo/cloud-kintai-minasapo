import LockIcon from "@mui/icons-material/Lock";
import {
  Avatar,
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { Dayjs } from "dayjs";

import type { MockShiftCell, MockUser } from "./mockData";
import {
  calculateDailyCount,
  mockStaffs,
  shiftStateConfig,
} from "./mockData";

interface PrototypeShiftTableProps {
  days: Dayjs[];
  shiftData: Map<string, Map<string, MockShiftCell>>;
  onCellClick: (staffId: string, dayKey: string) => void;
  mockActiveUsers: MockUser[];
}

export function PrototypeShiftTable({
  days,
  shiftData,
  onCellClick,
  mockActiveUsers,
}: PrototypeShiftTableProps) {
  return (
    <TableContainer component={Paper} sx={{ maxHeight: "70vh" }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                bgcolor: "background.paper",
                fontWeight: "bold",
                minWidth: 160,
                position: "sticky",
                left: 0,
                zIndex: 3,
              }}
            >
              スタッフ
            </TableCell>
            {days.map((day) => {
              const dayKey = day.format("DD");
              const count = calculateDailyCount(shiftData, dayKey);
              const isWeekend = day.day() === 0 || day.day() === 6;
              const needsAttention = count.work < 2;

              return (
                <TableCell
                  key={dayKey}
                  align="center"
                  sx={{
                    bgcolor: needsAttention
                      ? alpha("rgb(244 67 54)", 0.1)
                      : isWeekend
                        ? alpha("rgb(33 150 243)", 0.05)
                        : "background.paper",
                    minWidth: 60,
                    borderLeft: day.date() === 1 ? "2px solid" : undefined,
                    borderColor: "divider",
                  }}
                >
                  <Typography variant="caption" fontWeight="bold">
                    {day.format("D")}
                  </Typography>
                  <Typography variant="caption" display="block">
                    ({day.format("dd")})
                  </Typography>
                  {needsAttention && (
                    <Chip
                      label={`${count.work}人`}
                      size="small"
                      color="error"
                      sx={{ height: 16, fontSize: 10, mt: 0.5 }}
                    />
                  )}
                </TableCell>
              );
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {mockStaffs.map((staff) => {
            const staffShiftData = shiftData.get(staff.id);

            return (
              <TableRow key={staff.id} hover>
                <TableCell
                  sx={{
                    fontWeight: "medium",
                    position: "sticky",
                    left: 0,
                    bgcolor: "background.paper",
                    zIndex: 1,
                  }}
                >
                  <Typography variant="body2">{staff.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {staff.group}
                  </Typography>
                </TableCell>
                {days.map((day) => {
                  const dayKey = day.format("DD");
                  const cell = staffShiftData?.get(dayKey);
                  if (!cell) return <TableCell key={dayKey} />;

                  const config = shiftStateConfig[cell.state];
                  const cellKey = `${staff.id}-${dayKey}`;
                  const isBeingEdited = mockActiveUsers.some(
                    (u) => u.editingCell === cellKey,
                  );
                  const editingUser = mockActiveUsers.find(
                    (u) => u.editingCell === cellKey,
                  );

                  return (
                    <Tooltip
                      key={dayKey}
                      title={
                        <Box>
                          <Typography variant="caption" fontWeight="bold" display="block">
                            {day.format("M月D日 (dd)")}
                          </Typography>
                          <Typography variant="caption" display="block">
                            現在: {config.text}
                          </Typography>
                          {cell.lastChangedBy && (
                            <>
                              <Typography
                                variant="caption"
                                display="block"
                                sx={{ mt: 0.5, fontWeight: "bold" }}
                              >
                                変更履歴:
                              </Typography>
                              <Typography variant="caption" display="block">
                                • {cell.lastChangedAt} - {cell.lastChangedBy}
                                が変更
                              </Typography>
                            </>
                          )}
                          {cell.isLocked && (
                            <Typography variant="caption" display="block" color="warning.main">
                              🔒 確定済み
                            </Typography>
                          )}
                        </Box>
                      }
                    >
                      <TableCell
                        onClick={() => onCellClick(staff.id, dayKey)}
                        sx={{
                          textAlign: "center",
                          cursor: cell.isLocked ? "not-allowed" : "pointer",
                          position: "relative",
                          bgcolor: isBeingEdited
                            ? alpha(editingUser!.color, 0.1)
                            : "transparent",
                          "&:hover": {
                            bgcolor: cell.isLocked
                              ? alpha("rgb(102 102 102)", 0.05)
                              : alpha("rgb(25 118 210)", 0.08),
                          },
                        }}
                      >
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          sx={{ color: config.color }}
                        >
                          {config.label}
                        </Typography>
                        {cell.isLocked && (
                          <LockIcon
                            sx={{
                              position: "absolute",
                              top: 2,
                              right: 2,
                              fontSize: 12,
                              color: "text.disabled",
                            }}
                          />
                        )}
                        {isBeingEdited && (
                          <Avatar
                            sx={{
                              position: "absolute",
                              top: 2,
                              right: 2,
                              width: 16,
                              height: 16,
                              fontSize: 10,
                              bgcolor: editingUser!.color,
                            }}
                          >
                            {editingUser!.name.charAt(0)}
                          </Avatar>
                        )}
                      </TableCell>
                    </Tooltip>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}