import { CATEGORY_LABELS, STATUS_LABELS } from "@entities/workflow/lib/workflowLabels";
import { WorkflowCategory, WorkflowStatus } from "@shared/api/graphql/types";

type CategoryItem = {
  category: string;
  label: string;
};

type WorkflowFiltersBarProps = {
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  categories: CategoryItem[];
  statuses: WorkflowStatus[];
  statusFilter: WorkflowStatus[];
  onToggleStatus: (status: WorkflowStatus) => void;
  onClearStatus: () => void;
};

export default function WorkflowFiltersBar({
  categoryFilter,
  onCategoryChange,
  categories,
  statuses,
  statusFilter,
  onToggleStatus,
  onClearStatus,
}: WorkflowFiltersBarProps) {
  return (
    <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-2 lg:grid-cols-3">
      <label className="flex min-w-0 flex-col gap-1 text-sm text-slate-600">
        <span className="font-medium">種別</span>
        <select
          value={categoryFilter}
          onChange={(event) => onCategoryChange(event.target.value)}
          className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
        >
          <option value="">すべて</option>
          {categories.map((category) => (
            <option key={category.category} value={category.category}>
              {CATEGORY_LABELS[category.category as WorkflowCategory] ||
                category.label}
            </option>
          ))}
        </select>
      </label>

      <div className="sm:col-span-2 lg:col-span-2">
        <span className="mb-1 block text-sm font-medium text-slate-600">
          ステータス
        </span>
        <div className="flex flex-wrap gap-2">
          <label className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs text-slate-700">
            <input
              type="checkbox"
              checked={statusFilter.length === 0}
              onChange={onClearStatus}
              className="h-3.5 w-3.5 accent-emerald-600"
            />
            すべて
          </label>

          {statuses.map((status) => (
            <label
              key={status}
              className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs text-slate-700"
            >
              <input
                type="checkbox"
                checked={statusFilter.includes(status)}
                onChange={() => onToggleStatus(status)}
                className="h-3.5 w-3.5 accent-emerald-600"
              />
              {STATUS_LABELS[status] || status}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
