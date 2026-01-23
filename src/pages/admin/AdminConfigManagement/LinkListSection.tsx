import DeleteIcon from "@mui/icons-material/Delete";
import {
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
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
  <>
    <Typography variant="h6">リンク集</Typography>
    <Typography variant="body2" color="textSecondary">
      ヘッダーのリンク集に表示するリンクを設定してください。
      <br />
      URL内で<code>{"{staffName}"}</code>
      を使用すると、スタッフ名が動的に挿入されます。
    </Typography>
    <Stack spacing={2} sx={{ alignItems: "flex-start" }}>
      {links.map((link, index) => (
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          key={index}
          sx={{ flexWrap: "wrap", rowGap: 1.5 }}
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
                <Stack direction="row" alignItems="center" spacing={1}>
                  {icon.component}
                  <span>{icon.label}</span>
                </Stack>
              </MenuItem>
            ))}
          </Select>
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
            sx={{ minWidth: 88 }}
          />
          <IconButton onClick={() => onRemoveLink(index)} color="error">
            <DeleteIcon />
          </IconButton>
        </Stack>
      ))}
      <Button
        variant="text"
        size="small"
        onClick={onAddLink}
        sx={{ alignSelf: "flex-start" }}
      >
        リンクを追加
      </Button>
    </Stack>
  </>
);

export default LinkListSection;
