import "./AttendanceListHeader.scss";

type AttendanceListHeaderProps = {
  rangeLabelForDisplay: string;
};

export default function AttendanceListHeader({
  rangeLabelForDisplay,
}: AttendanceListHeaderProps) {
  return (
    <section className="attendance-list-header">
      <div className="attendance-list-header__inner">
        <div className="attendance-list-header__content">
          <h1 className="attendance-list-header__title">
            勤怠一覧
          </h1>
          <p className="attendance-list-header__description">
            月ごとの勤怠をカレンダーで確認しながら、必要な日付の編集にすぐ移れます。集計期間の勤務時間もこの画面でまとめて確認できます。
          </p>
        </div>
        <div className="attendance-list-header__summary">
          <p className="attendance-list-header__summary-label">
            集計期間
          </p>
          <p className="attendance-list-header__summary-range">
            {rangeLabelForDisplay}
          </p>
        </div>
      </div>
    </section>
  );
}
