import type { ChangeEvent, ReactNode } from "react";

import {
  DailyReportFormChangeHandler,
  DailyReportFormData,
} from "../model/types";

export type DailyReportFormFieldsProps = {
  form: DailyReportFormData;
  onChange: DailyReportFormChangeHandler;
  resolvedAuthorName: string;
};

type FieldProps = {
  label: string;
  children: ReactNode;
};

function Field({ label, children }: FieldProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium leading-6 text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}

function handleInputChange(
  onChange: DailyReportFormChangeHandler,
  field: keyof DailyReportFormData,
) {
  return (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    onChange(field, event.target.value);
  };
}

const INPUT_CLASS_NAME =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200";

export function DailyReportFormFields({
  form,
  onChange,
  resolvedAuthorName,
}: DailyReportFormFieldsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field label="日付">
        <input
          type="date"
          value={form.date}
          onChange={handleInputChange(onChange, "date")}
          className={INPUT_CLASS_NAME}
        />
      </Field>
      <Field label="担当者">
        <input
          type="text"
          value={form.author || resolvedAuthorName}
          readOnly
          className={`${INPUT_CLASS_NAME} bg-slate-50 text-slate-600`}
        />
      </Field>
      <div className="sm:col-span-2">
        <Field label="タイトル">
          <input
            type="text"
            value={form.title}
            onChange={handleInputChange(onChange, "title")}
            className={INPUT_CLASS_NAME}
          />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="内容">
          <textarea
            value={form.content}
            onChange={handleInputChange(onChange, "content")}
            rows={6}
            placeholder="例) サマリ/実施タスク/課題などをまとめて記入"
            className={`${INPUT_CLASS_NAME} min-h-[10rem] resize-y`}
          />
        </Field>
      </div>
    </div>
  );
}
