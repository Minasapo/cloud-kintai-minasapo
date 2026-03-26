import "./AttendanceEditPageHeader.scss";

import AttendanceEditBackNavigation from "../AttendanceEditBackNavigation";

type AttendanceEditPageHeaderProps = {
  title?: string;
  description?: string;
  showBackNavigation?: boolean;
  variant?: "desktop" | "mobile";
};

export function AttendanceEditPageHeader({
  title = "勤怠編集",
  description,
  showBackNavigation = true,
  variant = "desktop",
}: AttendanceEditPageHeaderProps) {
  return (
    <div className={`attendance-edit-page-header attendance-edit-page-header--${variant}`}>
      <div className="attendance-edit-page-header__inner">
        {showBackNavigation ? <AttendanceEditBackNavigation /> : null}
        <h1
          className={`attendance-edit-page-header__title attendance-edit-page-header__title--${variant}`}
        >
          {title}
        </h1>
        {description ? (
          <p
            className={`attendance-edit-page-header__description attendance-edit-page-header__description--${variant}`}
          >
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
