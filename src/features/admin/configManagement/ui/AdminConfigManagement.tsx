import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import Title from "@shared/ui/typography/Title";

import GroupSection from "@/features/admin/configManagement/ui/GroupSection";

import { useAdminConfigForm } from "../model/useAdminConfigForm";

export default function AdminConfigManagement() {
  const {
    sectionSpacing,
    workflowNotificationEnabled,
    handleWorkflowNotificationEnabledChange,
    handleSave,
  } = useAdminConfigForm();

  return (
    <Stack
      spacing={0}
      sx={{
        pb: 2,
        gap: sectionSpacing,
        alignItems: "flex-start",
        maxWidth: 1040,
        width: "100%",
      }}
    >
      <Title>設定</Title>
      <Typography variant="body2" color="text.secondary">
        勤務時間や残業確認、特別休暇などの個別設定は、各専用ページから変更してください。
      </Typography>
      <GroupSection
        title="通知機能(開発中)"
        description="ヘッダーの通知アイコンと通知一覧への導線を表示するか切り替えます。"
      >
        <Stack spacing={1}>
          <FormControlLabel
            control={
              <Switch
                checked={workflowNotificationEnabled}
                onChange={handleWorkflowNotificationEnabledChange}
                color="primary"
              />
            }
            label={workflowNotificationEnabled ? "有効" : "無効"}
            sx={{ mb: 1 }}
          />
        </Stack>
      </GroupSection>
      <Typography variant="body2" color="textSecondary">
        スタッフ側への設定反映には数分程度かかる場合があります。
      </Typography>
      <Button variant="contained" color="primary" onClick={handleSave}>
        保存
      </Button>
    </Stack>
  );
}
