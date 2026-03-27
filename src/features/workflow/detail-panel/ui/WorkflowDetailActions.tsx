import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

import { useWorkflowDetailContext } from "../model/WorkflowDetailContext";
import styles from "./WorkflowDetailActions.module.scss";

export default function WorkflowDetailActions() {
  const { permissions, onBack, onWithdraw, onEdit } = useWorkflowDetailContext();
  const { withdrawDisabled, withdrawTooltip, editDisabled, editTooltip } =
    permissions;
  return (
    <div className={styles.actions}>
      <div>
        <button
          type="button"
          className={styles.backButton}
          onClick={onBack}
        >
          <ArrowBackRoundedIcon sx={{ fontSize: 18, color: "#475569" }} />
          一覧に戻る
        </button>
      </div>
      <div className={styles.actionsRight}>
        <button
          type="button"
          className={styles.dangerPillButton}
          onClick={onWithdraw}
          disabled={withdrawDisabled}
          title={withdrawTooltip}
        >
          取り下げ
        </button>
        <button
          type="button"
          className={styles.pillButton}
          onClick={onEdit}
          disabled={editDisabled}
          title={editTooltip}
        >
          編集
        </button>
      </div>
    </div>
  );
}
