import { PageTitle } from "@shared/ui/typography";

import WorkflowDetailActions from "./WorkflowDetailActions";
import styles from "./WorkflowDetailHeader.module.scss";

export default function WorkflowDetailHeader() {
  return (
    <div className={styles.header}>
      <div className={styles.inner}>
        <WorkflowDetailActions />
        <div className={styles.titleBlock}>
          <PageTitle className={styles.title}>申請内容</PageTitle>
          <p className={styles.description}>
            申請内容の確認、コメントのやり取り、編集や取り下げをこの画面で行えます。
          </p>
        </div>
      </div>
    </div>
  );
}
