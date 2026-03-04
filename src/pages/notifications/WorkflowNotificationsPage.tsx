import { StaffRole } from "@entities/staff/model/useStaffs/useStaffs";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import Page from "@shared/ui/page/Page";
import dayjs from "dayjs";
import { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "@/context/AuthContext";
import { useWorkflowNotificationInbox } from "@/features/workflow/notification/model/useWorkflowNotificationInbox";
import { dashboardInnerSurfaceSx, PageSection } from "@/shared/ui/layout";

const formatEventAt = (eventAt: string) =>
  dayjs(eventAt).format("YYYY/MM/DD HH:mm");

export default function WorkflowNotificationsPage() {
  const navigate = useNavigate();
  const { isCognitoUserRole } = useContext(AuthContext);
  const [actionError, setActionError] = useState<string | null>(null);
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
  } = useWorkflowNotificationInbox();

  const isAdminUser = useMemo(
    () =>
      isCognitoUserRole(StaffRole.ADMIN) ||
      isCognitoUserRole(StaffRole.STAFF_ADMIN),
    [isCognitoUserRole],
  );

  const workflowDetailBasePath = useMemo(
    () => (isAdminUser ? "/admin/workflow" : "/workflow"),
    [isAdminUser],
  );

  const handleOpenNotification = async (
    notificationId: string,
    workflowId: string,
  ) => {
    setActionError(null);
    try {
      await markAsRead(notificationId);
      navigate(`${workflowDetailBasePath}/${encodeURIComponent(workflowId)}`);
    } catch (markReadError) {
      const message =
        markReadError instanceof Error
          ? markReadError.message
          : String(markReadError);
      setActionError(message);
    }
  };

  const handleMarkAllAsRead = async () => {
    setActionError(null);
    try {
      await markAllAsRead();
    } catch (markReadError) {
      const message =
        markReadError instanceof Error
          ? markReadError.message
          : String(markReadError);
      setActionError(message);
    }
  };

  return (
    <Page title="通知" maxWidth="md" showDefaultHeader={false}>
      <PageSection layoutVariant="dashboard">
        <Box sx={dashboardInnerSurfaceSx}>
          <Stack spacing={2}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", sm: "center" }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h6">通知一覧</Typography>
                <Chip
                  label={`未読 ${unreadCount} 件`}
                  color="primary"
                  variant="outlined"
                />
              </Stack>
              <Button
                variant="outlined"
                startIcon={<MarkEmailReadIcon />}
                disabled={unreadCount === 0 || loading}
                onClick={() => {
                  void handleMarkAllAsRead();
                }}
              >
                すべて既読にする
              </Button>
            </Stack>

            {error && <Alert severity="error">{error}</Alert>}
            {actionError && <Alert severity="error">{actionError}</Alert>}

            {loading ? (
              <Box display="flex" justifyContent="center" py={6}>
                <CircularProgress />
              </Box>
            ) : notifications.length === 0 ? (
              <Box
                sx={{
                  py: 6,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <NotificationsNoneIcon color="disabled" />
                <Typography color="text.secondary">通知はありません</Typography>
              </Box>
            ) : (
              <List disablePadding>
                {notifications.map((notification) => (
                  <ListItemButton
                    key={notification.id}
                    onClick={() => {
                      void handleOpenNotification(
                        notification.id,
                        notification.workflowId,
                      );
                    }}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      backgroundColor: notification.isRead
                        ? "transparent"
                        : "action.hover",
                    }}
                  >
                    <ListItemText
                      primary={notification.title}
                      secondary={
                        <Stack spacing={0.5} mt={0.5}>
                          <Typography variant="body2" color="text.secondary">
                            {notification.body}
                          </Typography>
                          <Typography variant="caption" color="text.disabled">
                            {formatEventAt(notification.eventAt)}
                          </Typography>
                        </Stack>
                      }
                    />
                    {!notification.isRead && (
                      <Chip size="small" label="未読" color="primary" />
                    )}
                  </ListItemButton>
                ))}
              </List>
            )}
          </Stack>
        </Box>
      </PageSection>
    </Page>
  );
}
