import { ChangeEvent } from "react";

export interface TimeRecorderRemarksViewProps {
  value: string;
  placeholder?: string;
  isChanged: boolean;
  onChange: (value: string) => void;
  onSave: () => void;
  onClear: () => void;
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m4.5 10 3.5 3.5L15.5 6" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M5 5l10 10M15 5 5 15" />
    </svg>
  );
}

const TimeRecorderRemarksView = ({
  value,
  placeholder,
  isChanged,
  onChange,
  onSave,
  onClear,
}: TimeRecorderRemarksViewProps) => {
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className="space-y-2">
      <textarea
        data-testid="remarks-text"
        rows={2}
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
      />
      {isChanged && (
        <div className="flex justify-end gap-1">
          <button
            type="button"
            onClick={onSave}
            data-testid="remarksSave"
            aria-label="備考を保存"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-emerald-600 transition hover:bg-emerald-50"
          >
            <CheckIcon />
          </button>
          <button
            type="button"
            onClick={onClear}
            data-testid="remarksClear"
            aria-label="変更を取り消す"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-rose-600 transition hover:bg-rose-50"
          >
            <ClearIcon />
          </button>
        </div>
      )}
    </div>
  );
};

export default TimeRecorderRemarksView;
