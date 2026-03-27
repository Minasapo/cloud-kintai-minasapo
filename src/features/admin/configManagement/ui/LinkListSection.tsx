import DeleteIcon from "@mui/icons-material/Delete";
import {
  Checkbox,
  FormControlLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";

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
          <TextField
            label="ラベル"
            value={link.label}
            onChange={(e) => onLinkChange(index, "label", e.target.value)}
            size="small"
            sx={{ width: 200 }}
          />
          <TextField
            label="URL"
            value={link.url}
            onChange={(e) => onLinkChange(index, "url", e.target.value)}
            size="small"
            sx={{ minWidth: 260, width: 360, maxWidth: "100%" }}
          />
          <Select
            value={link.icon}
            onChange={(e) => onLinkChange(index, "icon", e.target.value)}
            size="small"
            sx={{ width: 200, minWidth: 160 }}
          >
            {predefinedIcons.map((icon) => (
              <MenuItem key={icon.value} value={icon.value}>
                <div className="flex flex-row items-center gap-2">
                  {icon.component}
                  <span>{icon.label}</span>
                </div>
              </MenuItem>
            ))}
          </Select>
          <div className="min-w-[88px]">
            <FormControlLabel
              control={
                <Checkbox
                  checked={link.enabled}
                  onChange={(e) =>
                    onLinkChange(index, "enabled", e.target.checked)
                  }
                />
              }
              label="有効"
            />
          </div>
          <button
            className="text-red-500 hover:bg-red-50 p-2 rounded-full transition"
            type="button"
            onClick={() => onRemoveLink(index)}
            aria-label="削除"
          >
            <DeleteIcon />
          </button>
        </div>
      ))}
      <button
        className="text-blue-600 hover:text-blue-800 text-sm font-medium self-start transition"
        type="button"
        onClick={onAddLink}
      >
        + リンクを追加
      </button>
    </div>
  </div>
);

export default LinkListSection;
