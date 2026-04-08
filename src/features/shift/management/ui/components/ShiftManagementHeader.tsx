import { Badge, Box, Button, Chip, CircularProgress } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import React from "react";

type Props = {
  monthStart: Dayjs;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  scenario: string;
  isAutoSaving: boolean;
  isAutoSavePending: boolean;
  lastChangedAt: Date | null;
  lastSavedAt: Date | null;
  hasBulkSelection: boolean;
  selectedCellCount: number;
  onOpenBulkEditDialog: () => void;
};

export const ShiftManagementHeader: React.FC<Props> = ({
  monthStart,
  onPrevMonth,
  onNextMonth,
  scenario,
  isAutoSaving,
  isAutoSavePending,
  lastChangedAt,
  lastSavedAt,
  hasBulkSelection,
  selectedCellCount,
  onOpenBulkEditDialog,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        mb: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Chip label="前月" onClick={onPrevMonth} sx={{ mr: 1 }} clickable />
        <Chip label={monthStart.format("YYYY年 M月")} sx={{ mr: 1 }} />
        <Chip label="翌月" onClick={onNextMonth} clickable />

        {scenario === "actual" && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, ml: 2 }}>
            {isAutoSaving && (
              <Chip
                icon={<CircularProgress size={16} />}
                label="保存中..."
                size="small"
                color="default"
              />
            )}
            {isAutoSavePending && !isAutoSaving && (
              <Chip
                label={`保存待ち${
                  lastChangedAt
                    ? ` (${dayjs(lastChangedAt).format("M/D HH:mm:ss")})`
                    : ""
                }`}
                size="small"
                color="default"
                variant="outlined"
              />
            )}
            {!isAutoSaving && !isAutoSavePending && lastSavedAt && (
              <Chip
                label={`最終保存: ${dayjs(lastSavedAt).format("M/D HH:mm:ss")}`}
                size="small"
                color="success"
                variant="outlined"
              />
            )}
          </Box>
        )}
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {hasBulkSelection ? (
          <Badge
            badgeContent={selectedCellCount}
            color="primary"
            sx={{
              "& .MuiBadge-badge": {
                right: 0,
                top: 0,
                border: `2px solid`,
              },
            }}
          >
            <Button
              variant="contained"
              color="primary"
              disabled={!hasBulkSelection}
              onClick={onOpenBulkEditDialog}
            >
              選択した項目を変更
            </Button>
          </Badge>
        ) : (
          <Button
            variant="contained"
            color="primary"
            disabled
            onClick={onOpenBulkEditDialog}
          >
            選択した項目を変更
          </Button>
        )}
      </Box>
    </Box>
  );
};
