export default function ErrorStatusAlert() {
  return (
    <div className="error-status-alert">
      <div role="alert" className="error-status-alert__body">
        <p className="error-status-alert__title">打刻エラー</p>
        カレンダー上で「要確認」が表示されている日付を選択してください。
      </div>
    </div>
  );
}
