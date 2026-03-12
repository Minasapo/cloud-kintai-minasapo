import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import {
  CreateAppConfigInput,
  UpdateAppConfigInput,
} from "@shared/api/graphql/types";
import Title from "@shared/ui/typography/Title";
import React, { useContext, useEffect, useState } from "react";

import { useAppDispatchV2 } from "@/app/hooks";
import { AppConfigContext } from "@/context/AppConfigContext";
import { E14001, S14001, S14002 } from "@/errors";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/shared/lib/store/snackbarSlice";

import GroupSection from "./GroupSection";

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
    <Stack spacing={2.5} sx={{ maxWidth: 1040, width: "100%" }}>
      <Title>開発者</Title>
      <Typography variant="body2" color="text.secondary">
        実験中または内部向けの設定をまとめて管理します。項目の追加や削除があっても、この画面内で一覧できます。
      </Typography>
      <GroupSection
        title="開発機能"
        description="検証用の機能や、段階的に公開する機能をここで管理します。"
      >
        <Stack
          spacing={2.5}
          divider={<Divider flexItem />}
          sx={{ width: "100%" }}
        >
          {developerSettings.map((setting) => (
            <Box
              key={setting.id}
              sx={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <Box sx={{ flex: "1 1 320px", minWidth: 0 }}>
                <Typography variant="subtitle1">{setting.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {setting.description}
                </Typography>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={setting.checked}
                    onChange={handleChange}
                    color="primary"
                  />
                }
                label={setting.checked ? "有効" : "無効"}
                sx={{ mr: 0, ml: 0, alignSelf: "center" }}
              />
            </Box>
          ))}
        </Stack>
      </GroupSection>
      <Stack direction="row" justifyContent="flex-end">
        <Button variant="contained" color="primary" onClick={handleSave}>
          保存
        </Button>
      </Stack>
    </Stack>
  );
}
