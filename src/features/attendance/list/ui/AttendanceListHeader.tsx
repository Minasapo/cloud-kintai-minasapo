import "./AttendanceListHeader.scss";

import { useState } from "react";

type AttendanceListHeaderProps = {
  rangeLabelForDisplay: string;
};

export default function AttendanceListHeader({
  rangeLabelForDisplay,
}: AttendanceListHeaderProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  return (
    <section className="attendance-list-header">
      <div className="attendance-list-header__inner">
        <div className="attendance-list-header__content">
          <h1 className="attendance-list-header__title">勤怠一覧</h1>
          <p
            id="attendance-list-header-description"
            className={`attendance-list-header__description${
              isDescriptionExpanded
                ? " attendance-list-header__description--expanded"
                : ""
            }`}
          >
            月ごとの勤怠をカレンダーで確認しながら、必要な日付の編集にすぐ移れます。集計期間の勤務時間もこの画面でまとめて確認できます。
          </p>
          <button
            type="button"
            className="attendance-list-header__description-toggle"
            aria-expanded={isDescriptionExpanded}
            aria-controls="attendance-list-header-description"
            onClick={() => setIsDescriptionExpanded((prev) => !prev)}
          >
            {isDescriptionExpanded ? "閉じる" : "続きを読む"}
          </button>
        </div>
        <div className="attendance-list-header__summary">
          {/* モバイル向け */}
          <p className="attendance-list-header__summary-inline">
            集計期間：{rangeLabelForDisplay}
          </p>
          {/* PC向け */}
          <p className="attendance-list-header__summary-label">集計期間</p>
          <p className="attendance-list-header__summary-range">
            {rangeLabelForDisplay}
          </p>
        </div>
      </div>
    </section>
  );
}
