export interface DailyReportFormData {
  date: string;
  author: string;
  title: string;
  content: string;
}

export type DailyReportFormField = keyof DailyReportFormData;

export type DailyReportFormChangeHandler = (
  field: DailyReportFormField,
  value: string
) => void;
