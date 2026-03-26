import {
  CLOCK_CORRECTION_CHECK_OUT_LABEL,
  CLOCK_CORRECTION_LABEL,
} from "@/features/workflow/application-form/model/workflowFormModel";
import { TimeInput } from "@/shared/ui/TimeInput";

import styles from "./WorkflowTypeFields.module.scss";

type Props = {
  category: string;
  disabled?: boolean;
  startDate: string;
  setStartDate: (v: string) => void;
  endDate: string;
  setEndDate: (v: string) => void;
  dateError: string;
  paidReason: string;
  setPaidReason: (v: string) => void;
  absenceDate: string;
  setAbsenceDate: (v: string) => void;
  absenceDateError: string;
  absenceReason: string;
  setAbsenceReason: (v: string) => void;
  overtimeDate: string;
  setOvertimeDate: (v: string) => void;
  overtimeDateError: string;
  overtimeStart: string | null;
  setOvertimeStart: (v: string | null) => void;
  overtimeEnd: string | null;
  setOvertimeEnd: (v: string | null) => void;
  overtimeError: string;
  overtimeReason?: string;
  setOvertimeReason?: (v: string) => void;
  customWorkflowTitle?: string;
  setCustomWorkflowTitle?: (v: string) => void;
  customWorkflowContent?: string;
  setCustomWorkflowContent?: (v: string) => void;
  customWorkflowTitleError?: string;
  customWorkflowContentError?: string;
  templateOptions?: Array<{
    id: string;
    name: string;
  }>;
  selectedTemplateId?: string;
  setSelectedTemplateId?: (v: string) => void;
  onApplyTemplate?: () => void;
  disableTemplateApply?: boolean;
};

export default function WorkflowTypeFields({
  category,
  disabled = false,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  dateError,
  paidReason,
  setPaidReason,
  absenceDate,
  setAbsenceDate,
  absenceDateError,
  absenceReason,
  setAbsenceReason,
  overtimeDate,
  setOvertimeDate,
  overtimeDateError,
  overtimeStart,
  setOvertimeStart,
  overtimeEnd,
  setOvertimeEnd,
  overtimeError,
  overtimeReason,
  setOvertimeReason,
  customWorkflowTitle,
  setCustomWorkflowTitle,
  customWorkflowContent,
  setCustomWorkflowContent,
  customWorkflowTitleError,
  customWorkflowContentError,
  templateOptions,
  selectedTemplateId,
  setSelectedTemplateId,
  onApplyTemplate,
  disableTemplateApply,
}: Props) {
  return (
    <>
      {category === "有給休暇申請" && (
        <>
          <div className={styles.formRow}>
            <div className={styles.formLabel}>取得期間</div>
            <div className={styles.formField}>
              <div className={styles.inlineGroup}>
                <input
                  type="date"
                  className={[
                    styles.dateInput,
                    dateError ? styles.inputError : "",
                  ].join(" ")}
                  disabled={disabled}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <span className={styles.dateSeparator}>-</span>
                <input
                  type="date"
                  className={[
                    styles.dateInput,
                    dateError ? styles.inputError : "",
                  ].join(" ")}
                  disabled={disabled}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              {dateError && (
                <p className={styles.errorText}>{dateError}</p>
              )}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formLabel}>申請理由</div>
            <div className={styles.formField}>
              <input
                className={styles.input}
                disabled={disabled}
                value={paidReason}
                onChange={(e) => setPaidReason(e.target.value)}
              />
            </div>
          </div>
        </>
      )}

      {category === "欠勤申請" && (
        <>
          <div className={styles.formRow}>
            <div className={styles.formLabel}>欠勤日</div>
            <div className={styles.formField}>
              <input
                type="date"
                className={[
                  styles.dateInput,
                  absenceDateError ? styles.inputError : "",
                ].join(" ")}
                value={absenceDate}
                onChange={(e) => setAbsenceDate(e.target.value)}
                disabled={disabled}
              />
              {absenceDateError && (
                <p className={styles.errorText}>{absenceDateError}</p>
              )}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formLabel}>欠勤理由</div>
            <div className={styles.formField}>
              <input
                className={styles.input}
                value={absenceReason}
                onChange={(e) => setAbsenceReason(e.target.value)}
                disabled={disabled}
              />
            </div>
          </div>
        </>
      )}

      {category === "残業申請" && (
        <>
          <div className={styles.formRow}>
            <div className={styles.formLabel}>残業予定日</div>
            <div className={styles.formField}>
              <input
                type="date"
                className={[
                  styles.dateInput,
                  overtimeDateError ? styles.inputError : "",
                ].join(" ")}
                value={overtimeDate}
                onChange={(e) => setOvertimeDate(e.target.value)}
                disabled={disabled}
              />
              {overtimeDateError && (
                <p className={styles.errorText}>{overtimeDateError}</p>
              )}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formLabel}>残業予定時間</div>
            <div className={styles.formField}>
              <div className={styles.timeFieldGroup}>
                <div className={styles.timeInputGroup}>
                  <TimeInput
                    value={overtimeStart}
                    onChange={setOvertimeStart}
                    baseDate={
                      overtimeDate || new Date().toISOString().slice(0, 10)
                    }
                    size="small"
                    error={Boolean(overtimeError)}
                    disabled={disabled}
                    sx={{ width: "148px", maxWidth: "100%" }}
                  />
                  <span className={styles.timeSeparator}>〜</span>
                  <TimeInput
                    value={overtimeEnd}
                    onChange={setOvertimeEnd}
                    baseDate={
                      overtimeDate || new Date().toISOString().slice(0, 10)
                    }
                    size="small"
                    error={Boolean(overtimeError)}
                    disabled={disabled}
                    sx={{ width: "148px", maxWidth: "100%" }}
                  />
                </div>
                {overtimeError && (
                  <p className={styles.errorText}>{overtimeError}</p>
                )}
              </div>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formLabel}>残業理由</div>
            <div className={styles.formField}>
              <input
                className={styles.input}
                value={overtimeReason ?? ""}
                onChange={(e) =>
                  setOvertimeReason && setOvertimeReason(e.target.value)
                }
                disabled={disabled}
              />
            </div>
          </div>
        </>
      )}

      {category === CLOCK_CORRECTION_LABEL && (
        <>
          <div className={styles.formRow}>
            <div className={styles.formLabel}>対象日</div>
            <div className={styles.formField}>
              <input
                type="date"
                className={[
                  styles.dateInput,
                  overtimeDateError ? styles.inputError : "",
                ].join(" ")}
                value={overtimeDate}
                onChange={(e) => setOvertimeDate(e.target.value)}
                disabled={disabled}
              />
              {overtimeDateError && (
                <p className={styles.errorText}>{overtimeDateError}</p>
              )}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formLabel}>出勤時間</div>
            <div className={styles.formField}>
              <TimeInput
                value={overtimeStart}
                onChange={setOvertimeStart}
                baseDate={overtimeDate || new Date().toISOString().slice(0, 10)}
                size="small"
                error={Boolean(overtimeError)}
                helperText={overtimeError}
                disabled={disabled}
                sx={{ maxWidth: 160 }}
              />
            </div>
          </div>
        </>
      )}

      {category === CLOCK_CORRECTION_CHECK_OUT_LABEL && (
        <>
          <div className={styles.formRow}>
            <div className={styles.formLabel}>対象日</div>
            <div className={styles.formField}>
              <input
                type="date"
                className={[
                  styles.dateInput,
                  overtimeDateError ? styles.inputError : "",
                ].join(" ")}
                value={overtimeDate}
                onChange={(e) => setOvertimeDate(e.target.value)}
                disabled={disabled}
              />
              {overtimeDateError && (
                <p className={styles.errorText}>{overtimeDateError}</p>
              )}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formLabel}>退勤時間</div>
            <div className={styles.formField}>
              <TimeInput
                value={overtimeEnd}
                onChange={setOvertimeEnd}
                baseDate={overtimeDate || new Date().toISOString().slice(0, 10)}
                size="small"
                error={Boolean(overtimeError)}
                helperText={overtimeError}
                disabled={disabled}
                sx={{ maxWidth: 160 }}
              />
            </div>
          </div>
        </>
      )}

      {category === "その他" && (
        <>
          <div className={styles.formRow}>
            <div className={styles.formLabel}>テンプレート</div>
            <div className={styles.formField}>
              <div className={styles.inlineGroup}>
                <div className={styles.selectWrap}>
                  <select
                    className={styles.select}
                    value={selectedTemplateId ?? ""}
                    onChange={(e) =>
                      setSelectedTemplateId &&
                      setSelectedTemplateId(e.target.value)
                    }
                    disabled={disabled}
                  >
                    <option value="">
                      テンプレートを選択
                    </option>
                    {(templateOptions ?? []).map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                  <span className={styles.selectIcon} aria-hidden="true">
                    ▼
                  </span>
                </div>
                <button
                  type="button"
                  className={styles.applyButton}
                  onClick={() => onApplyTemplate && onApplyTemplate()}
                  disabled={disabled || disableTemplateApply}
                >
                  適用
                </button>
              </div>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formLabel}>タイトル</div>
            <div className={styles.formField}>
              <input
                className={[
                  styles.input,
                  customWorkflowTitleError ? styles.inputError : "",
                ].join(" ")}
                value={customWorkflowTitle ?? ""}
                onChange={(e) =>
                  setCustomWorkflowTitle &&
                  setCustomWorkflowTitle(e.target.value)
                }
                disabled={disabled}
              />
              {customWorkflowTitleError && (
                <p className={styles.errorText}>{customWorkflowTitleError}</p>
              )}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formLabel}>詳細</div>
            <div className={styles.formField}>
              <textarea
                className={[
                  styles.textarea,
                  customWorkflowContentError ? styles.inputError : "",
                ].join(" ")}
                value={customWorkflowContent ?? ""}
                onChange={(e) =>
                  setCustomWorkflowContent &&
                  setCustomWorkflowContent(e.target.value)
                }
                disabled={disabled}
                rows={6}
              />
              {customWorkflowContentError && (
                <p className={styles.errorText}>{customWorkflowContentError}</p>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
