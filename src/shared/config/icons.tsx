import DirectionsTransitOutlinedIcon from "@mui/icons-material/DirectionsTransitOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";

export type PredefinedIconValue = "train" | "holiday" | "expense" | "LinkIcons";

export const predefinedIcons: ReadonlyArray<{
  label: string;
  value: PredefinedIconValue;
  component: JSX.Element;
}> = [
  {
    label: "交通費",
    value: "train",
    component: (
      <DirectionsTransitOutlinedIcon
        fontSize="small"
        className="text-slate-600"
      />
    ),
  },
  {
    label: "休暇申請",
    value: "holiday",
    component: (
      <EventAvailableOutlinedIcon fontSize="small" className="text-slate-600" />
    ),
  },
  {
    label: "経費申請",
    value: "expense",
    component: (
      <ReceiptLongOutlinedIcon fontSize="small" className="text-slate-600" />
    ),
  },
  {
    label: "その他",
    value: "LinkIcons",
    component: <LinkOutlinedIcon fontSize="small" className="text-slate-600" />,
  },
] as const;
