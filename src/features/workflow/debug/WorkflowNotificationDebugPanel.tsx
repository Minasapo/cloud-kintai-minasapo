import { useStaffs } from "@entities/staff/model/useStaffs/useStaffs";
import { Box, Paper, Typography } from "@mui/material";
import { useContext, useMemo } from "react";

import { AuthContext } from "@/context/AuthContext";
import { useLocalNotification } from "@/hooks/useLocalNotification";
import { useWorkflowNotification } from "@/hooks/useWorkflowNotification";

/**
 * 開発環境専用: ワークフロー通知のデバッグ情報を表示
 * 本番環境では非表示
 */
export const WorkflowNotificationDebugPanel = () => {
  const { authStatus, cognitoUser } = useContext(AuthContext);
  const isAuthenticated = authStatus === "authenticated";
  const { staffs } = useStaffs({ isAuthenticated });
  const { permission, isSupported, canNotify } = useLocalNotification();
  const { isSubscribed } = useWorkflowNotification();

  const currentStaffInfo = useMemo(() => {
    if (!cognitoUser?.id || !isAuthenticated) {
      return { id: null, role: null };
    }
    const staff = staffs.find((s) => s.cognitoUserId === cognitoUser.id);
    return {
      id: staff?.id ?? null,
      role: staff?.role ?? null,
    };
  }, [cognitoUser, staffs, isAuthenticated]);

  // 本番環境では非表示
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <Paper
      sx={{
        position: "fixed",
        bottom: 16,
        right: 16,
        p: 2,
        maxWidth: 400,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        color: "white",
        zIndex: 9999,
        fontSize: "0.75rem",
      }}
    >
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
        🔔 通知デバッグ情報
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        <Box>
          <strong>認証状態:</strong> {authStatus}
        </Box>
        <Box>
          <strong>Cognito User ID:</strong> {cognitoUser?.id || "なし"}
        </Box>
        <Box>
          <strong>スタッフID:</strong> {currentStaffInfo.id || "なし"}
        </Box>
        <Box>
          <strong>スタッフロール:</strong> {currentStaffInfo.role || "なし"}
        </Box>
        <Box sx={{ mt: 1 }}>
          <strong>通知サポート:</strong> {isSupported ? "✅ はい" : "❌ いいえ"}
        </Box>
        <Box>
          <strong>通知権限:</strong>{" "}
          {permission === "granted"
            ? "✅ 許可済み"
            : permission === "denied"
              ? "❌ 拒否"
              : "⚠️ 未設定"}
        </Box>
        <Box>
          <strong>通知可能:</strong> {canNotify ? "✅ はい" : "❌ いいえ"}
        </Box>
        <Box>
          <strong>購読中:</strong> {isSubscribed ? "✅ はい" : "❌ いいえ"}
        </Box>
      </Box>
      <Typography
        variant="caption"
        sx={{ mt: 1, display: "block", opacity: 0.7 }}
      >
        このパネルは開発環境でのみ表示されます
      </Typography>
    </Paper>
  );
};
