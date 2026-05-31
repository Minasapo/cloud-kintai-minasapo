import { InfoBadge } from "./ui/Badges";
import { InlineAlert } from "./ui/InlineAlert";

export const ShiftConnectionAlerts = ({
  isOnline,
  connectionState,
  editLockError,
  clearEditLockError,
}: {
  isOnline: boolean;
  connectionState: string;
  editLockError: string | null;
  clearEditLockError: () => void;
}) => (
  <>
    {(!isOnline || connectionState === "disconnected") && (
      <InlineAlert tone="warning" icon={<InfoBadge />} className="mb-3">
        通信が切断されています。再接続後に編集を再開してください。
      </InlineAlert>
    )}
    {editLockError && (
      <InlineAlert
        tone="warning"
        icon={<InfoBadge />}
        className="mb-3"
        onClose={clearEditLockError}
      >
        {editLockError}
      </InlineAlert>
    )}
  </>
);
