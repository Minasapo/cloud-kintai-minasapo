import { SectionTitle } from "@shared/ui/typography";
import type { RefObject } from "react";

interface DailyReportCarouselDialogHeaderProps {
  onClose: () => void;
  closeButtonRef: RefObject<HTMLButtonElement | null>;
}

export function DailyReportCarouselDialogHeader({
  onClose,
  closeButtonRef,
}: DailyReportCarouselDialogHeaderProps) {
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-3">
      <SectionTitle className="text-base font-bold text-slate-800">
        日報を確認
      </SectionTitle>
      <button
        ref={closeButtonRef}
        type="button"
        onClick={onClose}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
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
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
