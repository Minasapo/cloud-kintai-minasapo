import { Paper, Stack, Typography } from "@mui/material";
import { WorkflowCategory } from "@shared/api/graphql/types";

import { formatDateSlash } from "@/lib/date";

type OvertimeDetails = {
  date?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  reason?: string | null;
};

type WorkflowApplicationDetailsProps = {
  category?: WorkflowCategory | null;
  categoryLabel: string;
  overTimeDetails?: OvertimeDetails | null;
};

export default function WorkflowApplicationDetails({
  category,
  categoryLabel,
  overTimeDetails,
}: WorkflowApplicationDetailsProps) {
  const isOvertime = category === WorkflowCategory.OVERTIME;
  const hasOvertimeDetails = Boolean(
    overTimeDetails?.date ||
      overTimeDetails?.startTime ||
      overTimeDetails?.endTime ||
      overTimeDetails?.reason
  );

  const renderOvertime = () => {
    if (!overTimeDetails) return null;
    const dateLabel = formatDateSlash(overTimeDetails.date);
    const timeRange = overTimeDetails.startTime
      ? `${overTimeDetails.startTime} - ${overTimeDetails.endTime ?? ""}`
      : "-";

    return (
      <Stack spacing={1.5}>
        <DetailRow label="残業予定日" value={dateLabel || "-"} />
        <DetailRow label="残業予定時間" value={timeRange} />
        <DetailRow
          label="残業理由"
          value={overTimeDetails.reason || "（未入力）"}
        />
      </Stack>
    );
  };

  const renderFallback = () => (
    <Typography variant="body2" color="text.secondary">
      {categoryLabel}
      {categoryLabel
        ? " の個別入力項目は未設定です。"
        : "に関する詳細情報はありません。"}
    </Typography>
  );

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 1.5 }}>
        申請詳細
      </Typography>
      {isOvertime && hasOvertimeDetails ? renderOvertime() : renderFallback()}
    </Paper>
  );
}

type DetailRowProps = {
  label: string;
  value: string;
};

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <Stack direction="row" spacing={2} alignItems="flex-start">
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ flexBasis: 120, flexShrink: 0 }}
      >
        {label}
      </Typography>
      <Typography variant="body1" sx={{ flexGrow: 1 }}>
        {value}
      </Typography>
    </Stack>
  );
}
