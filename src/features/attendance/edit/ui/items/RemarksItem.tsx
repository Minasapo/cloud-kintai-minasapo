import "./RemarksItem.scss";

import { useContext, useState } from "react";

import { AttendanceEditContext } from "@/features/attendance/edit/model/AttendanceEditProvider";
import { RemarksInputField } from "@/features/attendance/edit/ui/items/RemarksInputField";
import { toStringArray } from "@/features/attendance/edit/ui/items/remarksItemUtils";
import { RemarksTags } from "@/features/attendance/edit/ui/items/RemarksTags";

export default function RemarksItem() {
  const { getValues, setValue, control, watch, readOnly } = useContext(
    AttendanceEditContext,
  );
  const [isExpanded, setIsExpanded] = useState(false);

  if (!getValues) return null;

  const tags = watch
    ? toStringArray(watch("remarkTags"))
    : toStringArray(getValues("remarkTags"));
  const remarksValue = watch
    ? ((watch("remarks") as string | null | undefined) ?? "")
    : ((getValues("remarks") as string | null | undefined) ?? "");

  return (
    <>
      <div className="attendance-remarks-item">
        <div className="attendance-remarks-item__content">
          <div className="attendance-remarks-item__panel">
            <div className="attendance-remarks-item__header">
              <RemarksTags tags={tags} />
              <button
                type="button"
                className="attendance-remarks-item__expand-button"
                onClick={() => setIsExpanded(true)}
                aria-label="備考入力を全画面で開く"
              >
                ⤢
              </button>
            </div>

            <div className="attendance-remarks-item__input-wrap">
              <RemarksInputField
                control={control}
                getValues={getValues}
                setValue={setValue}
                readOnly={!!readOnly}
              />
            </div>
          </div>
        </div>
      </div>
      {isExpanded ? (
        <div
          className="attendance-remarks-item__overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="remarks-expanded-title"
          onClick={() => setIsExpanded(false)}
        >
          <div
            className="attendance-remarks-item__overlay-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="attendance-remarks-item__overlay-header">
              <h2 id="remarks-expanded-title" className="attendance-remarks-item__overlay-title">
                備考入力
              </h2>
              <button
                type="button"
                className="attendance-remarks-item__close-button"
                onClick={() => setIsExpanded(false)}
              >
                閉じる
              </button>
            </div>
            <textarea
              value={remarksValue}
              className="attendance-remarks-item__overlay-textarea"
              placeholder="備考を入力してください（タグは上に表示されます）"
              disabled={!!readOnly}
              onChange={(e) =>
                setValue?.("remarks", e.target.value, {
                  shouldDirty: true,
                })
              }
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
