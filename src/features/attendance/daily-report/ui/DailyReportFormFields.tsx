import { Grid, TextField } from "@mui/material";

import { DailyReportFormChangeHandler, DailyReportFormData } from "../model/types";

export type DailyReportFormFieldsProps = {
  form: DailyReportFormData;
  onChange: DailyReportFormChangeHandler;
  resolvedAuthorName: string;
};

export function DailyReportFormFields({
  form,
  onChange,
  resolvedAuthorName,
}: DailyReportFormFieldsProps) {
  return (
    <Grid spacing={2} container>
      <Grid item xs={12} sm={6}>
        <TextField
          label="日付"
          type="date"
          value={form.date}
          onChange={(event) => onChange("date", event.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="担当者"
          value={form.author || resolvedAuthorName}
          InputProps={{ readOnly: true }}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="タイトル"
          value={form.title}
          onChange={(event) => onChange("title", event.target.value)}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="内容"
          value={form.content}
          onChange={(event) => onChange("content", event.target.value)}
          multiline
          minRows={6}
          fullWidth
          placeholder={"例) サマリ/実施タスク/課題などをまとめて記入"}
        />
      </Grid>
    </Grid>
  );
}
