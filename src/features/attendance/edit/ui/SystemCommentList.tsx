/**
 * システムコメント一覧を表示するコンポーネント。
 * 未確認コメント数のバッジ表示、コメントの確認状態管理、一覧表示ダイアログを提供します。
 *
 * @remarks
 * - コメントの確認状態はAttendanceEditContextで管理されます。
 */
import dayjs from "dayjs";
import { type MouseEvent, useContext, useState } from "react";

import { AttendanceEditContext } from "@/features/attendance/edit/model/AttendanceEditProvider";

function CommentIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="h-[18px] w-[18px]"
    >
      <path
        d="M4.167 5.833A2.5 2.5 0 0 1 6.667 3.333h6.666a2.5 2.5 0 0 1 2.5 2.5v4.584a2.5 2.5 0 0 1-2.5 2.5H9.167L5 16.667v-3.75a2.5 2.5 0 0 1-.833-1.875V5.833Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="h-[18px] w-[18px]"
    >
      <path
        d="M5 10.417L8.333 13.75L15 7.083"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckAllIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="h-[18px] w-[18px]"
    >
      <path
        d="M2.917 10.417L6.25 13.75L8.333 11.667"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.917 10.417L11.25 13.75L17.083 7.917"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * システムコメント一覧ダイアログを表示するReactコンポーネント。
 *
 * @returns JSX.Element
 */
export function SystemCommentList() {
  const { systemCommentFields, systemCommentReplace } = useContext(
    AttendanceEditContext
  );
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  };

  const unconfirmedCount = systemCommentFields.filter(
    (systemComment) => !systemComment.confirmed
  ).length;

  const handleAllConfirmed = () => {
    if (!systemCommentReplace) {
      return;
    }

    const confirmedSystemCommentFields = systemCommentFields.map(
      (systemComment) => ({
        ...systemComment,
        confirmed: true,
      })
    );

    systemCommentReplace(confirmedSystemCommentFields);
  };

  return (
    <div>
      <div className="relative inline-flex">
        <button
          type="button"
          onClick={handleClickOpen}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          <CommentIcon />
          システムコメント
        </button>
        {unconfirmedCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-bold leading-none text-white">
            {unconfirmedCount}
          </span>
        )}
      </div>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="system-comment-dialog-title"
          onClick={handleBackdropClick}
        >
          <div className="flex max-h-[min(90vh,880px)] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_32px_80px_-48px_rgba(15,23,42,0.45)]">
            <div className="border-b border-slate-200 px-6 py-5">
              <h2
                id="system-comment-dialog-title"
                className="m-0 text-lg font-semibold text-slate-900"
              >
                システムコメント
              </h2>
            </div>
            <div className="flex flex-1 flex-col gap-4 overflow-hidden px-6 py-5">
              <div className="flex flex-col gap-3">
                <p className="m-0 text-sm leading-6 text-slate-600">
                  システムからのコメントを表示しています。保存するまで反映されません。
                </p>
                <div>
                  <button
                    type="button"
                    onClick={handleAllConfirmed}
                    className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  >
                    <CheckAllIcon />
                    すべて確認済みにする
                  </button>
                </div>
              </div>
              <div className="overflow-auto rounded-2xl border border-slate-200 bg-white">
                <table className="w-full min-w-[720px] border-collapse">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="w-14 border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold text-slate-500" />
                      <th className="border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold text-slate-500">コメント</th>
                      <th className="whitespace-nowrap border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold text-slate-500">作成日時</th>
                    </tr>
                  </thead>
                  <tbody>
                    {systemCommentFields.map(
                      ({ comment, createdAt, confirmed }, systemCommentIndex) => (
                        <tr
                          key={systemCommentIndex}
                          className="bg-white transition hover:bg-slate-50/70"
                        >
                          <td className="border-b border-slate-200 px-4 py-3 text-sm text-slate-700">
                            {confirmed ? <CheckIcon /> : null}
                          </td>
                          <td className="border-b border-slate-200 px-4 py-3 text-sm text-slate-700">
                            {comment}
                          </td>
                          <td className="whitespace-nowrap border-b border-slate-200 px-4 py-3 text-sm text-slate-700">
                            {dayjs(createdAt).format("YYYY/MM/DD HH:MM")}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-end border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                onClick={handleClose}
                autoFocus
                className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
