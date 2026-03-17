import Link from "@/shared/ui/link/Link";

const AttendanceErrorAlert = () => {
  return (
    <div
      role="alert"
      className="flex items-center justify-between gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-950"
    >
      <div className="min-w-0">
        <p className="m-0 text-sm font-semibold leading-6">勤怠打刻エラー</p>
        <p className="m-0 text-sm leading-6">
          打刻エラーがあります。勤怠一覧を確認してください。
        </p>
      </div>
      <Link
        to="/attendance/list"
        color="inherit"
        underline="none"
        className="inline-flex min-w-fit shrink-0 whitespace-nowrap rounded-md border border-current px-3 py-1.5 text-sm font-medium leading-none transition-colors hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
      >
          確認
      </Link>
    </div>
  );
};

export default AttendanceErrorAlert;
