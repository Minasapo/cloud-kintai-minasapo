import {
  CreateAppConfigInput,
  UpdateAppConfigInput,
} from "@shared/api/graphql/types";
import { useContext, useEffect, useState } from "react";

import { useAppDispatchV2 } from "@/app/hooks";
import { AppConfigContext } from "@/context/AppConfigContext";
import { E14001, S14001, S14002 } from "@/errors";
import { appendItem, removeItemAt, updateItem } from "@/features/admin/configManagement/lib/arrayHelpers";
import AdminSettingsLayout from "@/features/admin/layout/ui/AdminSettingsLayout";
import AdminSettingsSection from "@/features/admin/layout/ui/AdminSettingsSection";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/shared/lib/store/snackbarSlice";

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLinks(getLinks());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setId(getConfigId());
  }, [getLinks, getConfigId]);

  const handleAddLink = () =>
    setLinks(
      appendItem(links, { label: "", url: "", enabled: true, icon: "" })
    );

  const handleLinkChange = (
    index: number,
    field: "label" | "url" | "enabled" | "icon",
    value: string | boolean
  ) => {
    setLinks(
      updateItem(links, index, (l) => ({ ...l, [field]: value } as typeof l))
    );
  };

  const handleRemoveLink = (index: number) =>
    setLinks(removeItemAt(links, index));

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
    <AdminSettingsLayout title="外部リンク">
      <AdminSettingsSection
        actions={
          <button
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
            onClick={handleSave}
          >
            保存
          </button>
        }
      >
        <LinkListSection
          links={links}
          onAddLink={handleAddLink}
          onLinkChange={handleLinkChange}
          onRemoveLink={handleRemoveLink}
        />
      </AdminSettingsSection>
    </AdminSettingsLayout>
  );
}
