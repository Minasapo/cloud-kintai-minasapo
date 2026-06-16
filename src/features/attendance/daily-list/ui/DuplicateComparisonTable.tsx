import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { Attendance } from "@shared/api/graphql/types";
import React, { useCallback } from "react";

import { ConfirmFieldRow } from "../lib/duplicateConfirmFieldRows";
import { DuplicateSelectionMode } from "../model/useDuplicateSelectionModel";

const tableContainerSx = { width: "100%", overflowX: "auto" } as const;
const colItemLabelSx = { width: "16%" } as const;

type DuplicateComparisonTableProps = {
  confirmRecords: Attendance[];
  confirmFieldRows: ConfirmFieldRow[];
  selectionMode: DuplicateSelectionMode;
  selectedRecordIndex: number | null;
  fieldSelections: Record<string, number>;
  onSelectRecord: (index: number) => void;
  onSelectField: (
    label: string,
    index: number,
    rowIndex: number,
    isShift: boolean,
  ) => void;
  renderInlineDiff: (base: string, target: string) => React.ReactNode;
};

export function DuplicateComparisonTable({
  confirmRecords,
  confirmFieldRows,
  selectionMode,
  selectedRecordIndex,
  fieldSelections,
  onSelectRecord,
  onSelectField,
  renderInlineDiff,
}: DuplicateComparisonTableProps) {
  const handleRecordHeaderClick = useCallback(
    (event: React.MouseEvent<HTMLTableCellElement>) => {
      if (selectionMode !== "record") {
        return;
      }
      const idx = Number(event.currentTarget.dataset.recordIndex);
      onSelectRecord(idx);
    },
    [onSelectRecord, selectionMode],
  );

  const handleBodyCellClick = useCallback(
    (event: React.MouseEvent<HTMLTableCellElement>) => {
      const idx = Number(event.currentTarget.dataset.recordIndex);
      const rowIndex = Number(event.currentTarget.dataset.rowIndex);
      const fieldLabel = event.currentTarget.dataset.fieldLabel ?? "";

      if (selectionMode === "record") {
        onSelectRecord(idx);
      } else if (selectionMode === "field") {
        onSelectField(fieldLabel, idx, rowIndex, event.shiftKey);
      }
    },
    [onSelectField, onSelectRecord, selectionMode],
  );

  return (
    <TableContainer sx={tableContainerSx}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={colItemLabelSx}>項目</TableCell>
            {confirmRecords.map((record, idx) => {
              const isSelected =
                selectionMode === "record" && selectedRecordIndex === idx;
              const selectable = selectionMode === "record";
              return (
                <TableCell
                  key={record.id}
                  sx={{
                    minWidth: 140,
                    cursor: selectable ? "pointer" : "default",
                    fontWeight: isSelected ? 700 : 400,
                    border: isSelected
                      ? "2px solid rgba(25,118,210,0.6)"
                      : undefined,
                    backgroundColor: isSelected
                      ? "rgba(25,118,210,0.08)"
                      : undefined,
                  }}
                  data-record-index={idx}
                  onClick={handleRecordHeaderClick}
                >
                  #{idx + 1} ({record.id})
                </TableCell>
              );
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {confirmFieldRows.map((row, rowIndex) => {
            const values = confirmRecords.map((record) => row.value(record));
            const unique = new Set(values);
            const hasDiff = unique.size > 1;
            const diffSx = hasDiff
              ? {
                  backgroundColor: "rgba(255,205,210,0.35)",
                  fontWeight: 700,
                }
              : undefined;
            const base = values[0] ?? "";

            return (
              <TableRow key={row.label}>
                <TableCell sx={{ fontWeight: hasDiff ? 700 : 600, ...diffSx }}>
                  {row.label}
                </TableCell>
                {confirmRecords.map((record, idx) => {
                  const current = values[idx] ?? "";
                  const content = hasDiff
                    ? renderInlineDiff(base, current)
                    : row.render(record);
                  const recordSelected =
                    selectionMode === "record" && selectedRecordIndex === idx;
                  const isFieldSelected =
                    selectionMode === "field" &&
                    fieldSelections[row.label] === idx;
                  const selectable =
                    selectionMode === "field" || selectionMode === "record";

                  return (
                    <TableCell
                      key={`${row.label}-${record.id}`}
                      sx={{
                        ...diffSx,
                        cursor: selectable ? "pointer" : "default",
                        border:
                          isFieldSelected || recordSelected
                            ? "2px solid rgba(25,118,210,0.6)"
                            : undefined,
                        backgroundColor:
                          isFieldSelected || recordSelected
                            ? "rgba(25,118,210,0.08)"
                            : undefined,
                      }}
                      data-record-index={idx}
                      data-row-index={rowIndex}
                      data-field-label={row.label}
                      onClick={handleBodyCellClick}
                    >
                      {content}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
