import "./styles.scss";

import {
  Box,
  Container,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

import CommonBreadcrumbs from "@/components/common/CommonBreadcrumbs";

import { useAppDispatchV2 } from "../../../app/hooks";
import Title from "../../../components/Title/Title";
import * as MESSAGE_CODE from "../../../errors";
import useStaffs from "../../../hooks/useStaffs/useStaffs";
import { setSnackbarError } from "../../../lib/reducers/snackbarReducer";
import { AccountStatusTableCell } from "./AccountStatusTableCell";
import { CreatedAtTableCell } from "./CreatedAtTableCell";
import CreateStaffDialog from "./CreateStaffDialog";
import { EditButton } from "./EditButton";
import { MoreActionButton } from "./MoreActionButton/MoreActionButton";
import { RoleTableCell } from "./RoleTableCell";
import { StaffNameTableCell } from "./StaffNameTableCell";
import { StatusTableCell } from "./StatusTableCell";
import SyncCognitoUser from "./SyncCognitoUser";
import { UpdatedAtTableCell } from "./UpdatedAtTableCell";
import { WorkTypeTableCell } from "./WorkTypeTableCell";

export default function AdminStaff() {
  const dispatch = useAppDispatchV2();

  const {
    staffs,
    loading: staffLoading,
    error: staffError,
    refreshStaff,
    createStaff,
    updateStaff,
    deleteStaff,
  } = useStaffs();

  const [searchName, setSearchName] = useState("");

  if (staffLoading) {
    return <LinearProgress />;
  }

  if (staffError) {
    dispatch(setSnackbarError(MESSAGE_CODE.E00001));
    return null;
  }

  return (
    <>
      <Container maxWidth="xl" sx={{ height: 1, pt: 2 }}>
        <Stack spacing={2}>
          <Box>
            <CommonBreadcrumbs
              items={[{ label: "TOP", href: "/" }]}
              current="スタッフ一覧"
            />
          </Box>
          <Title>スタッフ一覧</Title>
          <Stack direction="row" spacing={2}>
            <CreateStaffDialog
              staffs={staffs}
              refreshStaff={refreshStaff}
              createStaff={createStaff}
              updateStaff={updateStaff}
            />
            <SyncCognitoUser
              staffs={staffs}
              refreshStaff={refreshStaff}
              createStaff={createStaff}
              updateStaff={updateStaff}
            />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            まれにユーザー情報が同期されない場合があります。その際は適宜同期を行ってください。
          </Typography>
          <TextField
            label="スタッフ名で検索"
            variant="outlined"
            size="small"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>アカウント状態</TableCell>
                  <TableCell>ステータス</TableCell>
                  <TableCell>名前</TableCell>
                  <TableCell>メールアドレス</TableCell>
                  <TableCell>権限</TableCell>
                  <TableCell>勤務形態</TableCell>
                  <TableCell>汎用コード</TableCell>
                  <TableCell>作成日時</TableCell>
                  <TableCell>更新日時</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {staffs
                  .filter((staff) => {
                    const fullName = `${staff.familyName || ""}${
                      staff.givenName || ""
                    }`;
                    return fullName.includes(searchName);
                  })
                  .sort((a, b) => {
                    const aSortKey = a.sortKey || "";
                    const bSortKey = b.sortKey || "";
                    return aSortKey.localeCompare(bSortKey);
                  })
                  .map((staff, index) => (
                    <TableRow key={index} className="table-row">
                      <TableCell>
                        <Stack direction="row" spacing={0}>
                          <EditButton staff={staff} />
                          <MoreActionButton
                            staff={staff}
                            updateStaff={updateStaff}
                            deleteStaff={deleteStaff}
                          />
                        </Stack>
                      </TableCell>
                      <AccountStatusTableCell staff={staff} />
                      <StatusTableCell staff={staff} />
                      <StaffNameTableCell staff={staff} />
                      <TableCell>{staff.mailAddress}</TableCell>
                      <RoleTableCell staff={staff} />
                      <WorkTypeTableCell staff={staff} />
                      <TableCell>{staff.sortKey || ""}</TableCell>
                      <CreatedAtTableCell staff={staff} />
                      <UpdatedAtTableCell staff={staff} />
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </Container>
    </>
  );
}
