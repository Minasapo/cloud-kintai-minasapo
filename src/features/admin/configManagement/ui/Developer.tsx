import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import {
  CreateAppConfigInput,
  UpdateAppConfigInput,
} from "@shared/api/graphql/types";
import React, { useContext, useEffect, useState } from "react";

import { useAppDispatchV2 } from "@/app/hooks";
import { AppConfigContext } from "@/context/AppConfigContext";
import { E14001, S14001, S14002 } from "@/errors";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/shared/lib/store/snackbarSlice";

type DeveloperSettingItem = {
  id: string;
  title: string;
  description: string;
  checked: boolean;
};

export default function Developer() {
  const {
    getWorkflowNotificationEnabled,
    getConfigId,
    saveConfig,
    fetchConfig,
  } = useContext(AppConfigContext);
  const [workflowNotificationEnabled, setWorkflowNotificationEnabled] =
    useState(false);
  const [id, setId] = useState<string | null>(null);
  const dispatch = useAppDispatchV2();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWorkflowNotificationEnabled(getWorkflowNotificationEnabled());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setId(getConfigId());
  }, [getConfigId, getWorkflowNotificationEnabled]);

  const handleChange = (
    _: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => {
    setWorkflowNotificationEnabled(checked);
  };

  const handleSave = async () => {
    try {
      if (id) {
        await saveConfig({
          id,
          workflowNotificationEnabled,
        } as UpdateAppConfigInput);
        dispatch(setSnackbarSuccess(S14002));
      } else {
        await saveConfig({
          name: "default",
          workflowNotificationEnabled,
        } as CreateAppConfigInput);
        dispatch(setSnackbarSuccess(S14001));
      }
      await fetchConfig();
    } catch {
      dispatch(setSnackbarError(E14001));
    }
  };

  const developerSettings: DeveloperSettingItem[] = [
    {
      id: "workflow-notification",
      title: "通知機能(開発中)",
      description:
        "有効にすると、ヘッダーの通知アイコンと通知一覧への導線が表示されます。",
      checked: workflowNotificationEnabled,
    },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 1 }}>
        開発者
      </Typography>
      <Stack spacing={2} sx={{ mb: 2 }}>
        <Typography variant="body2" color="textSecondary">
          実験中または内部向けの設定をまとめて管理します。項目の追加や削除があっても、この画面内で一覧できます。
        </Typography>
        {developerSettings.map((setting) => (
          <Box key={setting.id}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {setting.title}
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={setting.checked}
                  onChange={handleChange}
                  color="primary"
                />
              }
              label={setting.checked ? "有効" : "無効"}
            />
            <Typography variant="body2" color="textSecondary">
              {setting.description}
            </Typography>
          </Box>
        ))}
        <Stack direction="row" justifyContent="flex-end">
          <Button variant="contained" color="primary" onClick={handleSave}>
            保存
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
