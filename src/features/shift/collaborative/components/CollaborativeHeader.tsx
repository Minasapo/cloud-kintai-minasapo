import dayjs from "dayjs";
import PropTypes from "prop-types";
import { type FC, memo } from "react";

import { ActiveUsersList } from "./ActiveUsersList";

export type ActiveUser = {
  userId: string;
  userName: string;
  color: string;
  lastActivity: number;
};

export type CollaborativeHeaderProps = {
  currentMonth: dayjs.Dayjs;
  activeUsers: ActiveUser[];
  editingCells: Map<
    string,
    { userId: string; userName: string; startTime: number }
  >;
};

export const CollaborativeHeaderBase: FC<CollaborativeHeaderProps> = ({
  currentMonth,
  activeUsers,
  editingCells,
}) => (
  <div className="mb-2 rounded-[28px] border border-emerald-500/15 bg-[linear-gradient(135deg,rgba(247,252,248,0.98)_0%,rgba(236,253,245,0.92)_58%,rgba(255,255,255,0.98)_100%)] p-4 shadow-[0_28px_60px_-42px_rgba(15,23,42,0.35)] md:p-5">
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <div className="inline-flex rounded-full border border-slate-400/30 bg-white/80 px-4 py-2 font-semibold text-slate-600">
          {currentMonth.format("YYYY年 M月")}
        </div>
      </div>
      <div className="pt-0.5">
        <ActiveUsersList
          activeUsers={activeUsers}
          editingCells={editingCells}
          compact={false}
        />
      </div>
    </div>
  </div>
);

CollaborativeHeaderBase.propTypes = {
  currentMonth: PropTypes.object.isRequired,
  activeUsers: PropTypes.arrayOf(
    PropTypes.shape({
      userId: PropTypes.string.isRequired,
      userName: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
      lastActivity: PropTypes.number.isRequired,
    }).isRequired
  ).isRequired as any,
  editingCells: PropTypes.instanceOf(Map).isRequired,
};

export const CollaborativeHeader = memo(CollaborativeHeaderBase);
