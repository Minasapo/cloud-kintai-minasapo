import { Box, Paper, Stack, Typography } from "@mui/material";
import { AppButton } from "@shared/ui/button";
import dayjs from "dayjs";

import { shiftStateConfig } from "./mockData";

export function PrototypeFooter() {
  return (
    <Stack spacing={2}>
      <Paper sx={{ p: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            最終保存: {dayjs().format("YYYY/MM/DD HH:mm:ss")}
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <AppButton variant="outline" size="sm" disabled>
              キャンセル
            </AppButton>
            <AppButton variant="solid" size="sm" disabled>
              確定してロック
            </AppButton>
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="caption" fontWeight="bold" gutterBottom>
          凡例:
        </Typography>
        <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
          {Object.entries(shiftStateConfig).map(([key, config]) => (
            <Box
              key={key}
              sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
            >
              <Typography
                variant="body2"
                fontWeight="bold"
                sx={{ color: config.color }}
              >
                {config.label}
              </Typography>
              <Typography variant="caption">: {config.text}</Typography>
            </Box>
          ))}
        </Stack>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          🔔 最近の更新
        </Typography>
        <Stack spacing={1}>
          <Typography variant="caption">
            • 2分前: 管理者が 2/15 を確定
          </Typography>
          <Typography variant="caption">
            • 5分前: 鈴木 花子 が 2/10 を希望休に変更
          </Typography>
          <Typography variant="caption">
            • 10分前: 田中 次郎 が 2/22 を出勤に変更
          </Typography>
        </Stack>
      </Paper>
    </Stack>
  );
}