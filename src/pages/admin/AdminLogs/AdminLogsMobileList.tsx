import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  Box,
  Chip,
  List,
  ListItem,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { OperationLog } from "@shared/api/graphql/types";
import { AppIconButton } from "@shared/ui/button";

import { LogRow } from "./adminLogsTypes";

type AdminLogsMobileListProps = {
  logRows: LogRow[];
  onSelectLog: (log: OperationLog) => void;
};

export default function AdminLogsMobileList({
  logRows,
  onSelectLog,
}: AdminLogsMobileListProps) {
  return (
    <List sx={{ py: 0 }}>
      {logRows.map((row) => (
        <ListItem
          key={row.rowKey}
          divider
          alignItems="flex-start"
          sx={{ px: 0, py: 1.5 }}
        >
          <Stack spacing={1} sx={{ width: "100%" }}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
            >
              <Typography variant="caption" color="text.secondary">
                {row.timestampDisplay}
              </Typography>
              <Chip size="small" label={row.actionLabel} />
            </Stack>

            <Box>
              <Typography variant="caption" color="text.secondary">
                操作者
              </Typography>
              <Typography variant="body2">{row.actorDisplay}</Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                対象者
              </Typography>
              <Typography variant="body2">{row.targetDisplay}</Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                対象
              </Typography>
              <Typography variant="subtitle2" sx={{ wordBreak: "break-word" }}>
                {row.resourceDisplay}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                概要
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {row.summaryDisplay}
              </Typography>
            </Box>

            <Box sx={{ alignSelf: "flex-end" }}>
              <Tooltip title="詳細を表示">
                <AppIconButton
                  aria-label="詳細を表示"
                  onClick={() => onSelectLog(row.log)}
                >
                  <InfoOutlinedIcon fontSize="small" />
                </AppIconButton>
              </Tooltip>
            </Box>
          </Stack>
        </ListItem>
      ))}
    </List>
  );
}
