import { AppButton } from "@shared/ui/button";

type WorkflowPaginationBarProps = {
  currentPage: number;
  totalPages: number;
  activeRowsPerPage: number;
  rowsPerPageOptions: number[];
  onRowsPerPageChange: (value: number) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
};

export default function WorkflowPaginationBar({
  currentPage,
  totalPages,
  activeRowsPerPage,
  rowsPerPageOptions,
  onRowsPerPageChange,
  onPrevPage,
  onNextPage,
}: WorkflowPaginationBarProps) {
  return (
    <div className="mt-3 flex flex-col gap-2 border-t border-slate-200 pt-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
      <p className="m-0">
        ページ {currentPage + 1} / {totalPages}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <label className="inline-flex items-center gap-2">
          <span>表示件数</span>
          <select
            value={activeRowsPerPage}
            onChange={(event) => onRowsPerPageChange(Number(event.target.value))}
            className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          >
            {rowsPerPageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <AppButton
          variant="outline"
          tone="secondary"
          size="sm"
          onClick={onPrevPage}
          disabled={currentPage <= 0}
          className="min-w-0"
        >
          前へ
        </AppButton>

        <AppButton
          variant="outline"
          tone="secondary"
          size="sm"
          onClick={onNextPage}
          disabled={currentPage >= totalPages - 1}
          className="min-w-0"
        >
          次へ
        </AppButton>
      </div>
    </div>
  );
}
