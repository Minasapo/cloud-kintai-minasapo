import { Box, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";

import { DESIGN_TOKENS } from "@/constants/designTokens";

import { statusVisualMap } from "../../lib/shiftStateMapping";

const shiftBoardTokens = DESIGN_TOKENS.component.shiftBoard;
const SHORTAGE_BG = DESIGN_TOKENS.color.feedback.danger.surface;
const SHORTAGE_BORDER = alpha(DESIGN_TOKENS.color.feedback.danger.base, 0.5);
const EXCESS_BG = DESIGN_TOKENS.color.feedback.warning.surface;
const EXCESS_BORDER = alpha(DESIGN_TOKENS.color.feedback.warning.base, 0.5);

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
              borderRadius: `${shiftBoardTokens.cellRadius}px`,
              bgcolor: SHORTAGE_BG,
              border: "1px solid",
              borderColor: SHORTAGE_BORDER,
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
              borderRadius: `${shiftBoardTokens.cellRadius}px`,
              bgcolor: EXCESS_BG,
              border: "1px solid",
              borderColor: EXCESS_BORDER,
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
