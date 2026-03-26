import WorkflowDetailActions from "./WorkflowDetailActions";

export default function WorkflowDetailHeader() {
  return (
    <div className="rounded-[28px] border border-emerald-500/15 bg-[linear-gradient(135deg,rgba(247,252,248,0.98)_0%,rgba(236,253,245,0.92)_58%,rgba(255,255,255,0.98)_100%)] p-4 shadow-[0_28px_60px_-42px_rgba(15,23,42,0.35)] md:p-5">
      <div className="flex flex-col gap-3">
        <WorkflowDetailActions />
        <div className="flex flex-col gap-1.5">
          <h1 className="m-0 text-[1.85rem] font-bold leading-[1.15] tracking-[-0.02em] text-slate-950 md:text-[2.2rem]">
            申請内容
          </h1>
          <p className="max-w-[760px] leading-8 text-slate-500">
            申請内容の確認、コメントのやり取り、編集や取り下げをこの画面で行えます。
          </p>
        </div>
      </div>
    </div>
  );
}
