import PropTypes from "prop-types";
import { type FC, memo } from "react";

import { ProgressBar } from "./ui/ProgressBar";

export type ProgressPanelProps = {
  progress: {
    confirmedCount: number;
    confirmedPercent: number;
  };
  totalDays: number;
};

export const ProgressPanelBase: FC<ProgressPanelProps> = ({ progress, totalDays }) => (
  <div className="mb-2 rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-[0_24px_48px_-36px_rgba(15,23,42,0.35)] md:p-[18px]">
    <div>
      <div className="mb-2 text-sm font-bold text-slate-900">調整状況</div>
      <ProgressBar value={progress.confirmedPercent} />
      <div className="mt-[3px] block text-xs text-slate-500">
        確定: {progress.confirmedCount} / {totalDays}日 (
        {progress.confirmedPercent.toFixed(0)}%)
      </div>
    </div>
  </div>
);

ProgressPanelBase.propTypes = {
  progress: PropTypes.shape({
    confirmedCount: PropTypes.number.isRequired,
    confirmedPercent: PropTypes.number.isRequired,
  }).isRequired,
  totalDays: PropTypes.number.isRequired,
};

export const ProgressPanel = memo(ProgressPanelBase);
