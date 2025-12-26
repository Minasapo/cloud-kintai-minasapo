import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import {
  CreateAppConfigInput,
  UpdateAppConfigInput,
} from "@shared/api/graphql/types";
import { useContext, useEffect, useState } from "react";

import { useAppDispatchV2 } from "@/app/hooks";
import { AppConfigContext } from "@/context/AppConfigContext";
import { E14001, S14001, S14002 } from "@/errors";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/lib/reducers/snackbarReducer";

import ReasonListSection from "./ReasonListSection";

export default function Reasons() {
  const { getReasons, getConfigId, saveConfig, fetchConfig } =
    useContext(AppConfigContext);
  const [reasons, setReasons] = useState<
    { reason: string; enabled: boolean }[]
  >([]);
  const [id, setId] = useState<string | null>(null);
  const dispatch = useAppDispatchV2();

  useEffect(() => {
    setReasons(getReasons());
    setId(getConfigId());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddReason = () =>
    setReasons([...reasons, { reason: "", enabled: true }]);

  const handleReasonChange = (
    index: number,
    field: "reason" | "enabled",
    value: string | boolean
  ) => {
    const updated = [...reasons];
    updated[index][field as keyof (typeof updated)[number]] = value as never;
    setReasons(updated);
  };

  const handleRemoveReason = (index: number) =>
    setReasons(reasons.filter((_, i) => i !== index));

  const handleSave = async () => {
    try {
      if (id) {
        await saveConfig({
          id,
          reasons: reasons.map((r) => ({
            reason: r.reason,
            enabled: r.enabled,
          })),
        } as unknown as UpdateAppConfigInput);
        dispatch(setSnackbarSuccess(S14002));
      } else {
        await saveConfig({
          name: "default",
          reasons: reasons.map((r) => ({
            reason: r.reason,
            enabled: r.enabled,
          })),
        } as unknown as CreateAppConfigInput);
        dispatch(setSnackbarSuccess(S14001));
      }
      await fetchConfig();
    } catch {
      dispatch(setSnackbarError(E14001));
    }
  };

  return (
    <Box>
      <Stack spacing={2} sx={{ mb: 2 }}>
        <ReasonListSection
          reasons={reasons}
          onAddReason={handleAddReason}
          onReasonChange={handleReasonChange}
          onRemoveReason={handleRemoveReason}
        />
        <Button variant="contained" color="primary" onClick={handleSave}>
          保存
        </Button>
      </Stack>
    </Box>
  );
}
