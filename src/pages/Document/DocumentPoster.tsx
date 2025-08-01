// cspell:ignore BlockNote, BlockNoteEditor
import "@blocknote/core/style.css";

import { BlockNoteEditor } from "@blocknote/core";
import { BlockNoteView, useBlockNote } from "@blocknote/react";
import {
  Autocomplete,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
} from "@mui/material";
import { Storage } from "aws-amplify";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import CommonBreadcrumbs from "@/components/common/CommonBreadcrumbs";

import { useAppDispatchV2 } from "../../app/hooks";
import Title from "../../components/Title/Title";
import * as MESSAGE_CODE from "../../errors";
import createDocumentData from "../../hooks/useDocuments/createDocumentData";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "../../lib/reducers/snackbarReducer";

type Inputs = {
  title: string | null | undefined;
  content: string | null | undefined;
  targetRole: string[];
};

const defaultValues: Inputs = {
  title: undefined,
  content: undefined,
  targetRole: [],
};

/**
 * ドキュメントの投稿ページコンポーネント。
 * ドキュメントのタイトル、内容、対象者を入力して投稿する。
 *
 * @deprecated ドキュメントサイトが新設されたため、廃止を検討しています
 */
export default function DocumentPoster() {
  const dispatch = useAppDispatchV2();
  const navigate = useNavigate();

  const {
    register,
    control,
    setValue,
    handleSubmit,
    formState: { isDirty, isValid, isSubmitting },
  } = useForm<Inputs>({
    mode: "onChange",
    defaultValues,
  });

  const onSubmit = (data: Inputs) => {
    if (!data.title || !data.content) {
      return;
    }

    const { title, content, targetRole } = data;
    createDocumentData({ title, content, targetRole })
      .then(() => {
        dispatch(setSnackbarSuccess(MESSAGE_CODE.S13002));
        navigate("/docs");
      })
      .catch(() => dispatch(setSnackbarError(MESSAGE_CODE.E13002)));
  };

  const editor: BlockNoteEditor = useBlockNote({
    onEditorContentChange(e) {
      setValue("content", JSON.stringify(e.topLevelBlocks));
    },
    uploadFile: async (file): Promise<string> => {
      const fileExtension = file.name.split(".").pop();

      if (!fileExtension) {
        throw new Error("ファイルの拡張子が取得できませんでした");
      }

      const fileBuffer = await file.arrayBuffer();
      const hashBuffer = await window.crypto.subtle.digest("SHA-1", fileBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray
        .map((a) => a.toString(16).padStart(2, "0"))
        .join("");
      const fileName = `${hashHex}.${fileExtension}`;
      await Storage.put(fileName, file, {
        contentType: file.type,
      }).catch((err) => {
        throw err;
      });

      return Storage.get(fileName);
    },
  });

  return (
    <>
      <CommonBreadcrumbs
        items={[
          { label: "TOP", href: "/" },
          { label: "ドキュメント一覧", href: "/docs" },
        ]}
        current="作成"
      />
      <Title>ドキュメントの作成</Title>
      <Container maxWidth="md">
        <Stack direction="column" spacing={2}>
          <Box>
            <Button
              variant="contained"
              size="medium"
              onClick={handleSubmit(onSubmit)}
              disabled={!isDirty || !isValid || isSubmitting}
            >
              保存
            </Button>
          </Box>
          <TextField label="タイトル" size="small" {...register("title")} />
          <Controller
            name="targetRole"
            control={control}
            render={({ field }) => (
              <Autocomplete
                value={field.value}
                multiple
                options={["スタッフ", "管理者"]}
                renderInput={(params) => (
                  <TextField {...params} label="対象者" size="small" />
                )}
                onChange={(_, data) => {
                  field.onChange(data);
                }}
              />
            )}
          />
          <Paper elevation={3} sx={{ p: 3 }}>
            <BlockNoteView editor={editor} />
          </Paper>
        </Stack>
      </Container>
    </>
  );
}
