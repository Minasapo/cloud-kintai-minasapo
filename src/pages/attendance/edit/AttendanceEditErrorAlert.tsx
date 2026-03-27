type AttendanceEditErrorAlertProps = {
  messages: string[];
};

export function AttendanceEditErrorAlert({
  messages,
}: AttendanceEditErrorAlertProps) {
  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="attendance-edit-error-alert mb-2" role="alert">
      <p className="attendance-edit-error-alert__title">
        入力内容に誤りがあります。
      </p>
      <ul className="attendance-edit-error-alert__list">
        {messages.map((message) => (
          <li key={message} className="attendance-edit-error-alert__item">
            {message}
          </li>
        ))}
      </ul>
    </div>
  );
}
