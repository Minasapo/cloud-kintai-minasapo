import { Stack, Typography } from "@mui/material";
import { ReactNode } from "react";

interface AdminHeaderProps {
  actions?: ReactNode;
}

const AdminHeader = ({ actions }: AdminHeaderProps) => (
  <Stack spacing={2} component="header">
    <Typography variant="h4" component="h1">
      管理メニュー
    </Typography>
    <Typography variant="body2" color="text.secondary">
      各カテゴリを選択して詳細な管理画面に移動してください。
    </Typography>
    {actions}
  </Stack>
);

export default AdminHeader;
