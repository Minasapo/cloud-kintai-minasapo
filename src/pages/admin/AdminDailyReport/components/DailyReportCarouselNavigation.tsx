interface DailyReportCarouselNavigationProps {
  currentIndex: number;
  totalCount: number;
  onPrevious: () => void;
  onNext: () => void;
}

export function DailyReportCarouselNavigation({
  currentIndex,
  totalCount,
  onPrevious,
  onNext,
}: DailyReportCarouselNavigationProps) {
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < totalCount - 1;

  return (
    <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2">
      <button
        type="button"
        onClick={onPrevious}
        disabled={!hasPrevious}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <span className="text-xs text-slate-500">
        {totalCount === 0 ? 0 : currentIndex + 1} / {totalCount}
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={!hasNext}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}
