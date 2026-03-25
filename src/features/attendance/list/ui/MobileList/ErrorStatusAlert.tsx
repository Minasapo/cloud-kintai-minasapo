export default function ErrorStatusAlert() {
  return (
    <div className="pb-2">
      <div
        role="alert"
        className="rounded-[20px] border border-amber-500/20 bg-amber-50/90 px-4 py-3 text-sm text-amber-950"
      >
        <p className="mb-1 font-bold">打刻エラー</p>
        カレンダー上で赤色の日付をタップして確認してください
      </div>
    </div>
  );
}
