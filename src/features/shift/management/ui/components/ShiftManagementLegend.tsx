import { Box, Typography } from "@mui/material";

import { statusVisualMap } from "../../lib/shiftStateMapping";

export default function ShiftManagementLegend() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 0.5,
        mb: 1.5,
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        凡例
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          alignItems: "center",
        }}
      >
        {[
          { key: "work", label: "出勤" },
          { key: "fixedOff", label: "固定休" },
          { key: "requestedOff", label: "希望休" },
          { key: "auto", label: "自動調整枠" },
        ].map((item) => (
          <Box
            key={item.key}
            sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
          >
            <Typography
              sx={{
                color:
                  statusVisualMap[item.key as keyof typeof statusVisualMap]
                    .color,
                fontWeight: 700,
              }}
            >
              {statusVisualMap[item.key as keyof typeof statusVisualMap].label}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {item.label}
            </Typography>
          </Box>
        ))}
      </Box>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <Box
            sx={{
              width: 16,
              height: 16,
              borderRadius: 0.5,
              bgcolor: "rgba(244, 67, 54, 0.18)",
              border: "1px solid",
              borderColor: "rgba(244, 67, 54, 0.32)",
            }}
          />
          <Typography variant="caption" color="text.secondary">
            下限未達／固定人数不足
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <Box
            sx={{
              width: 16,
              height: 16,
              borderRadius: 0.5,
              bgcolor: "rgba(255, 193, 7, 0.18)",
              border: "1px solid",
              borderColor: "rgba(255, 193, 7, 0.4)",
            }}
          />
          <Typography variant="caption" color="text.secondary">
            上限超過／固定人数超過
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">
          数値は日別の出勤人数を示します。
        </Typography>
      </Box>
    </Box>
  );
}
