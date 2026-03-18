import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import { Badge, IconButton, Tooltip } from "@mui/material";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";

import { AppConfigContext } from "@/context/AppConfigContext";
import { AuthContext } from "@/context/AuthContext";
import { useWorkflowNotificationInbox } from "@/features/workflow/notification/model/useWorkflowNotificationInbox";

export default function WorkflowNotificationButton() {
  const { authStatus } = useContext(AuthContext);
  const { getWorkflowNotificationEnabled } = useContext(AppConfigContext);
  const isAuthenticated = authStatus === "authenticated";
  const workflowNotificationEnabled = getWorkflowNotificationEnabled();
  const navigate = useNavigate();
  const { unreadCount } = useWorkflowNotificationInbox();

  if (!isAuthenticated || !workflowNotificationEnabled) {
    return null;
  }

  return (
    <Tooltip title="通知一覧">
      <IconButton
        aria-label="通知一覧"
        onClick={() => navigate("/notifications")}
        sx={{
          color: "#45574F",
          p: { xs: "4px", md: "8px" },
          "&:hover": {
            backgroundColor: "rgba(15, 168, 94, 0.1)",
          },
        }}
      >
        <Badge
          badgeContent={unreadCount}
          color="error"
          max={99}
          overlap="circular"
          showZero
        >
          <NotificationsNoneIcon />
        </Badge>
      </IconButton>
    </Tooltip>
  );
}
