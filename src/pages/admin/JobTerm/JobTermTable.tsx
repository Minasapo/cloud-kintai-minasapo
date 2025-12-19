import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { DataGrid, GridActionsCellItem, GridRowParams } from "@mui/x-data-grid";
import { CloseDate } from "@shared/api/graphql/types";
import dayjs from "dayjs";

import { AttendanceDate } from "@/lib/AttendanceDate";

type JobTermTableProps = {
  rows: CloseDate[];
  onEdit: (row: CloseDate) => void;
  onDelete: (row: CloseDate) => void;
};

export default function JobTermTable({
  rows,
  onEdit,
  onDelete,
}: JobTermTableProps) {
  return (
    <DataGrid
      rows={rows}
      sortModel={[
        {
          field: "closeDate",
          sort: "desc",
        },
      ]}
      autoHeight
      columns={[
        {
          field: "closeDate",
          headerName: "集計対象月",
          width: 150,
          valueGetter: (_value, row) => {
            const date = dayjs(row.closeDate);
            return date.format("YYYY年M月");
          },
        },
        {
          field: "expirationDate",
          headerName: "有効期間",
          width: 300,
          valueGetter: (_value, row) => {
            const startDate = dayjs(row.startDate);
            const endDate = dayjs(row.endDate);
            return `${startDate.format(
              AttendanceDate.DisplayFormat
            )} 〜 ${endDate.format(AttendanceDate.DisplayFormat)}`;
          },
        },
        {
          field: "createdAt",
          headerName: "作成日",
          width: 150,
          valueGetter: (_value, row) => {
            const date = dayjs(row.createdAt);
            return date.format(AttendanceDate.DisplayFormat);
          },
        },
        {
          field: "actions",
          type: "actions",
          headerName: "操作",
          getActions: (params: GridRowParams<CloseDate>) => [
            <GridActionsCellItem
              key={`${params.row.id}-edit`}
              icon={<EditIcon />}
              label="編集"
              onClick={() => onEdit(params.row)}
            />,
            <GridActionsCellItem
              key={`${params.row.id}-delete`}
              icon={<DeleteIcon />}
              label="削除"
              onClick={() => onDelete(params.row)}
            />,
          ],
        },
      ]}
    />
  );
}

