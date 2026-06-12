import InfoIcon from "@mui/icons-material/Info";
import {
  Alert,
  Avatar,
  AvatarGroup,
  Box,
  Chip,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import type { MockUser } from "./mockData";

interface PrototypeHeaderProps {
  mockActiveUsers: MockUser[];
  monthLabel: string;
}

export function PrototypeHeader({
  mockActiveUsers,
  monthLabel,
}: PrototypeHeaderProps) {
  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h5" fontWeight="bold">
            シフト調整(共同)
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Chip
              label="接続中"
              color="success"
              size="small"
              variant="outlined"
            />
            <Tooltip
              title={
                <Stack spacing={0.5}>
                  {mockActiveUsers.map((user) => (
                    <Box key={user.id}>
                      <Typography variant="caption">
                        {user.name} -{" "}
                        {user.status === "editing" ? "編集中" : "閲覧中"}
                        {user.editingCell && ` (${user.editingCell})`}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              }
            >
              <AvatarGroup max={4}>
                {mockActiveUsers.map((user) => (
                  <Avatar
                    key={user.id}
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: user.color,
                      fontSize: 14,
                    }}
                  >
                    {user.name.charAt(0)}
                  </Avatar>
                ))}
              </AvatarGroup>
            </Tooltip>
          </Box>
        </Box>

        <Alert severity="info" icon={<InfoIcon />}>
          これはプロトタイプです。実際のデータは使用されていません。
          UIとインタラクションの確認用です。
          <Box component="span" sx={{ display: "none" }}>
            {monthLabel}
          </Box>
        </Alert>
      </Stack>
    </Paper>
  );
}