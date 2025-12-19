import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import CurrencyYenIcon from "@mui/icons-material/CurrencyYen";
import LinkIcon from "@mui/icons-material/Link";
import TrainIcon from "@mui/icons-material/Train";

export const predefinedIcons = [
  { label: "交通費", value: "train", component: <TrainIcon /> },
  { label: "休暇申請", value: "holiday", component: <BeachAccessIcon /> },
  { label: "経費申請", value: "expense", component: <CurrencyYenIcon /> },
  { label: "その他", value: "LinkIcons", component: <LinkIcon /> },
];
