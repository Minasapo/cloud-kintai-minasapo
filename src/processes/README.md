# processes 層

複数ページをまたぐ長めの業務フロー (例: 勤怠申請〜承認) をオーケストレーションするコンポーネントや状態管理を置きます。`pages` から参照し、`features`/`entities` に依存します。
例として `processes/office-access` は オフィス入退館の流れをまたぐ UI と処理を束ねます。
