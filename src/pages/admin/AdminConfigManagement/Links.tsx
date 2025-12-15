import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
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

import LinkListSection from "./LinkListSection";

export default function Links() {
  const { getLinks, getConfigId, saveConfig, fetchConfig } =
    useContext(AppConfigContext);
  const [links, setLinks] = useState<
    { label: string; url: string; enabled: boolean; icon: string }[]
  >([]);
  const [id, setId] = useState<string | null>(null);
  const dispatch = useAppDispatchV2();

  useEffect(() => {
    setLinks(getLinks());
    setId(getConfigId());
  }, [getLinks, getConfigId]);

  const handleAddLink = () =>
    setLinks([...links, { label: "", url: "", enabled: true, icon: "" }]);

  const handleLinkChange = (
    index: number,
    field: "label" | "url" | "enabled" | "icon",
    value: string | boolean
  ) => {
    const updated = [...links];
    updated[index][field as keyof (typeof updated)[number]] = value as never;
    setLinks(updated);
  };

  const handleRemoveLink = (index: number) =>
    setLinks(links.filter((_, i) => i !== index));

  const handleSave = async () => {
    try {
      if (id) {
        await saveConfig({
          id,
          links: links.map((l) => ({
            label: l.label,
            url: l.url,
            enabled: l.enabled,
            icon: l.icon,
          })),
        } as unknown as UpdateAppConfigInput);
        dispatch(setSnackbarSuccess(S14002));
      } else {
        await saveConfig({
          name: "default",
          links: links.map((l) => ({
            label: l.label,
            url: l.url,
            enabled: l.enabled,
            icon: l.icon,
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
      <Typography variant="h5" sx={{ mb: 1 }}>
        外部リンク
      </Typography>
      <Stack spacing={2} sx={{ mb: 2 }}>
        <LinkListSection
          links={links}
          onAddLink={handleAddLink}
          onLinkChange={handleLinkChange}
          onRemoveLink={handleRemoveLink}
        />
        <Button variant="contained" color="primary" onClick={handleSave}>
          保存
        </Button>
      </Stack>
    </Box>
  );
}
