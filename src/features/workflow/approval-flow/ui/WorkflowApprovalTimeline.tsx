import { Box, Paper, Stack, Typography } from "@mui/material";
import StatusChip from "@shared/ui/chips/StatusChip";

import type { WorkflowApprovalStepView } from "../types";

type Props = {
  title?: string;
  steps: WorkflowApprovalStepView[];
};

export default function WorkflowApprovalTimeline({
  title = "承認フロー",
  steps,
}: Props) {
  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Paper variant="outlined" sx={{ p: 2, bgcolor: "background.paper" }}>
        <Stack spacing={2}>
          {steps.map((s, idx) => {
            const isApplicant = s.role === "申請者";
            const active =
              s.state === "承認済み"
                ? "done"
                : s.state === "未承認"
                  ? "pending"
                  : "";
            return (
              <Box
                key={s.id}
                sx={{ display: "flex", alignItems: "center", gap: 2 }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: isApplicant
                        ? "grey.300"
                        : active === "done"
                          ? "success.main"
                          : "primary.main",
                      color: "common.white",
                      fontWeight: 700,
                    }}
                  >
                    {idx === 0 ? "申" : idx}
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 700 }}>{s.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {s.role} {s.date ? `・${s.date}` : ""}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ flexGrow: 1 }} />
                {!isApplicant && (
                  <Box>
                    <StatusChip status={s.state} />
                  </Box>
                )}
              </Box>
            );
          })}
        </Stack>
      </Paper>
    </Box>
  );
}
