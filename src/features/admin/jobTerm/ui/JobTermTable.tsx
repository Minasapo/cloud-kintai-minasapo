import { CloseDate } from "@shared/api/graphql/types";
import dayjs from "dayjs";
import { PenLine, Trash2 } from "lucide-react";
import { memo, useMemo } from "react";

import { AttendanceDate } from "@/entities/attendance/lib/AttendanceDate";

type JobTermTableProps = {
  rows: CloseDate[];
  onEdit: (row: CloseDate) => void;
  onDelete: (row: CloseDate) => void;
};

function JobTermTableComponent({
  rows,
  onEdit,
  onDelete,
}: JobTermTableProps) {
  const sortedRows = useMemo(
    () => [
      ...rows,
    ],
    [rows],
  ).toSorted(
    (left, right) =>
      dayjs(right.closeDate).valueOf() - dayjs(left.closeDate).valueOf(),
  );

  return (
    <div className="overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                集計対象月
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                有効期間
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                作成日
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row) => {
              const closeDate = dayjs(row.closeDate);
              const startDate = dayjs(row.startDate);
              const endDate = dayjs(row.endDate);
              const createdAt = dayjs(row.createdAt);

              return (
                <tr key={row.id} className="border-t border-slate-200">
                  <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-900">
                    {closeDate.format("YYYY年M月")}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                    {startDate.format(AttendanceDate.DisplayFormat)} 〜{" "}
                    {endDate.format(AttendanceDate.DisplayFormat)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                    {createdAt.format(AttendanceDate.DisplayFormat)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(row)}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        <PenLine className="h-4 w-4" />
                        編集
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(row)}
                        className="inline-flex items-center gap-2 rounded-lg border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default memo(JobTermTableComponent);
