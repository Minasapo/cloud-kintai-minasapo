export function HeroSection({
  isDescriptionExpanded,
  onToggleDescription,
}: {
  isDescriptionExpanded: boolean;
  onToggleDescription: () => void;
}) {
  return (
    <section className="daily-report-hero">
      <div>
        <h1 className="daily-report-hero-title">日報</h1>
        <p
          className={`daily-report-hero-description ${
            isDescriptionExpanded
              ? "daily-report-hero-description--expanded"
              : "daily-report-hero-description--clamped"
          }`}
        >
          日ごとの作業内容、管理者コメント、提出状況をひとつの画面で確認できます。カレンダーから対象日を選んで、そのまま作成や編集に進めます。
        </p>
        <button
          type="button"
          className="daily-report-hero-toggle"
          onClick={onToggleDescription}
          aria-expanded={isDescriptionExpanded}
        >
          {isDescriptionExpanded ? "閉じる" : "もっと見る"}
        </button>
      </div>
    </section>
  );
}
