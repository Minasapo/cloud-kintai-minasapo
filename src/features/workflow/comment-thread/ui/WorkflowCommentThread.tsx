import {
  Avatar,
  Box,
  Button,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { PANEL_HEIGHTS } from "@/constants/uiDimensions";
import { StaffType } from "@entities/staff/model/useStaffs/useStaffs";

import { shouldTruncateWorkflowMessage } from "../model/workflowCommentUtils";
import type { WorkflowCommentMessage } from "../types";

type Props = {
  title?: string;
  messages: WorkflowCommentMessage[];
  staffs: StaffType[];
  currentStaff?: StaffType;
  expandedMessages: Record<string, boolean>;
  onToggle: (id: string) => void;
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  sending: boolean;
  formatSender: (sender?: string) => string;
};

export default function WorkflowCommentThread({
  title = "コメント",
  messages,
  staffs,
  currentStaff,
  expandedMessages,
  onToggle,
  input,
  setInput,
  onSend,
  sending,
  formatSender,
}: Props) {
  return (
    <Box sx={{ mt: { xs: 2, sm: 0 } }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Paper
        variant="outlined"
        sx={{ p: 2, maxHeight: PANEL_HEIGHTS.SCROLLABLE_MAX, overflow: "auto" }}
      >
        <Stack spacing={2}>
          {messages.map((m) => {
            const displayName = formatSender(m.sender);
            const staff = m.staffId
              ? staffs.find((s) => s.id === m.staffId)
              : undefined;
            const avatarText = staff
              ? `${(staff.familyName || "").slice(0, 1)}${(
                  staff.givenName || ""
                ).slice(0, 1)}` || displayName.slice(0, 1)
              : displayName.slice(0, 1);
            const isSystem = m.staffId === "system";
            const isMine = Boolean(
              currentStaff && m.staffId === currentStaff.id
            );
            const avatarBg = isSystem
              ? "grey.500"
              : isMine
              ? "primary.main"
              : "secondary.main";
            const expanded = Boolean(expandedMessages[m.id]);
            const long = shouldTruncateWorkflowMessage(m.text, expanded);

            return (
              <Box
                key={m.id}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isMine ? "flex-end" : "flex-start",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 0.5,
                  }}
                >
                  {!isMine && (
                    <Avatar
                      sx={{
                        bgcolor: avatarBg,
                        width: 32,
                        height: 32,
                        fontSize: 12,
                      }}
                    >
                      {avatarText}
                    </Avatar>
                  )}
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {displayName}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ ml: 1 }}
                  >
                    {m.time}
                  </Typography>
                  {isMine && (
                    <Avatar
                      sx={{
                        bgcolor: avatarBg,
                        width: 32,
                        height: 32,
                        fontSize: 12,
                        ml: 1,
                      }}
                    >
                      {avatarText}
                    </Avatar>
                  )}
                </Box>

                <Paper
                  elevation={0}
                  sx={{
                    bgcolor: isMine ? "primary.main" : "grey.100",
                    color: isMine ? "common.white" : "text.primary",
                    p: 1.5,
                    borderRadius: 2,
                    maxWidth: "90%",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  <Typography
                    variant="body2"
                    component="div"
                    sx={{
                      display: long ? "-webkit-box" : "block",
                      WebkitLineClamp: long ? 5 : "none",
                      WebkitBoxOrient: long ? "vertical" : "initial",
                      overflow: long ? "hidden" : "visible",
                    }}
                  >
                    {m.text}
                  </Typography>
                  {long && (
                    <Button
                      size="small"
                      onClick={() => onToggle(m.id)}
                      sx={{ mt: 0.5 }}
                    >
                      {expanded ? "折りたたむ" : "もっと見る"}
                    </Button>
                  )}
                </Paper>
              </Box>
            );
          })}
        </Stack>
      </Paper>

      <Box sx={{ mt: 1, display: "flex", gap: 1, alignItems: "flex-end" }}>
        <TextField
          size="small"
          fullWidth
          multiline
          minRows={2}
          placeholder="メッセージを入力..."
          helperText="Command+Enterで送信"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.metaKey) {
              e.preventDefault();
              onSend();
            }
          }}
          disabled={sending}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Button
                  variant="contained"
                  size="small"
                  onClick={onSend}
                  disabled={sending || !input.trim()}
                  sx={{ textTransform: "none", minWidth: 64 }}
                >
                  送信
                </Button>
              </InputAdornment>
            ),
          }}
        />
      </Box>
    </Box>
  );
}
