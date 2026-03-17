export interface RestTimeMessageProps {
  lunchRestStartTime: string;
  lunchRestEndTime: string;
}

const RestTimeMessage = ({
  lunchRestStartTime,
  lunchRestEndTime,
}: RestTimeMessageProps) => {
  return (
    <div
      role="alert"
      className="rounded-md border border-sky-200 bg-sky-50 px-4 py-3 text-sky-950"
    >
      <p className="m-0 text-sm font-semibold leading-6">
        昼休憩は退勤時に自動打刻されます
      </p>
      <div className="mt-1 space-y-0.5">
        <p
          className="m-0 text-sm leading-6"
          data-testid="rest-time-message-autostamp"
        >
          退勤打刻時に{lunchRestStartTime}〜{lunchRestEndTime}
          の昼休憩が自動追加されます。
        </p>
        <p
          className="m-0 text-sm leading-6"
          data-testid="rest-time-message-support"
        >
          修正する際は、変更リクエストまたは管理者へ問い合わせてください。
        </p>
      </div>
    </div>
  );
};

export default RestTimeMessage;
