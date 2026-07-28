import { InfoBadge } from "./ui/Badges";
import { InlineAlert } from "./ui/InlineAlert";

export const ShiftConnectionAlerts = ({
  isOnline,
  connectionState,
}: {
  isOnline: boolean;
  connectionState: string;
}) => (
  <>
    {(!isOnline || connectionState === "disconnected") && (
      <InlineAlert tone="warning" icon={<InfoBadge />} className="mb-3">
        通信が切断されています。再接続後に編集を再開してください。
      </InlineAlert>
    )}
  </>
);
