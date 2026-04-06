import SettingsIcon from "@/features/admin/layout/ui/SettingsIcon";
import {
  SettingsCheckbox,
  SettingsSelect,
  SettingsTextField,
} from "@/features/admin/layout/ui/SettingsPrimitives";
import { predefinedIcons } from "@/shared/config/icons";

interface Link {
  label: string;
  url: string;
  enabled: boolean;
  icon: string;
}

interface LinkListSectionProps {
  links: Link[];
  onAddLink: () => void;
  onLinkChange: (
    index: number,
    field: "label" | "url" | "enabled" | "icon",
    value: string | boolean
  ) => void;
  onRemoveLink: (index: number) => void;
}

const LinkListSection = ({
  links,
  onAddLink,
  onLinkChange,
  onRemoveLink,
}: LinkListSectionProps) => (
  <div className="flex flex-col gap-4">
    <div className="flex flex-col gap-1">
      <h3 className="text-base font-semibold text-slate-800">リンク集</h3>
      <p className="text-sm text-slate-500">
        ヘッダーのリンク集に表示するリンクを設定してください。
        <br />
        URL内で<code className="bg-slate-100 px-1 rounded text-pink-600">{"{staffName}"}</code>
        を使用すると、スタッフ名が動的に挿入されます。
      </p>
    </div>
    <div className="flex flex-col gap-4">
      {links.map((link, index) => (
        <div
          className="flex flex-row flex-wrap items-center gap-4"
          key={index}
        >
          <SettingsTextField
            label="ラベル"
            value={link.label}
            onChange={(value) => onLinkChange(index, "label", value)}
            className="w-[200px]"
          />
          <SettingsTextField
            label="URL"
            value={link.url}
            onChange={(value) => onLinkChange(index, "url", value)}
            className="min-w-[260px] w-[360px] max-w-full"
          />
          <SettingsSelect
            label="アイコン"
            value={link.icon}
            onChange={(value) => onLinkChange(index, "icon", value)}
            className="w-[200px] min-w-[160px]"
            options={predefinedIcons.map((icon) => ({
              value: icon.value,
              label: icon.label,
            }))}
          />
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            {(predefinedIcons.find((icon) => icon.value === link.icon) ?? predefinedIcons[0])?.component}
            <span className="text-sm text-slate-600">
              {(predefinedIcons.find((icon) => icon.value === link.icon) ?? predefinedIcons[0])?.label}
            </span>
          </div>
          <div className="min-w-[88px]">
            <SettingsCheckbox
              checked={link.enabled}
              onChange={(checked) => onLinkChange(index, "enabled", checked)}
              label="有効"
            />
          </div>
          <button
            className="text-rose-500 hover:bg-rose-50 p-2 rounded-full transition"
            type="button"
            onClick={() => onRemoveLink(index)}
            aria-label="削除"
          >
            <SettingsIcon name="delete" />
          </button>
        </div>
      ))}
      <button
        className="text-emerald-600 hover:text-emerald-700 text-sm font-medium self-start transition"
        type="button"
        onClick={onAddLink}
      >
        + リンクを追加
      </button>
    </div>
  </div>
);

export default LinkListSection;
