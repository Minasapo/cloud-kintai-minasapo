// cspell:ignore notistack
import CloseIcon from "@mui/icons-material/Close";
import { IconButton, styled } from "@mui/material";
import {
  closeSnackbar,
  enqueueSnackbar,
  MaterialDesignContent,
  type OptionsObject,
  type SnackbarKey,
  SnackbarProvider,
  type VariantType,
} from "notistack";
import { useCallback, useEffect } from "react";

import { useAppDispatchV2, useAppSelectorV2 } from "../../app/hooks";
import {
  selectSnackbar,
  setSnackbarError,
  setSnackbarSuccess,
  setSnackbarWarn,
} from "../../lib/reducers/snackbarReducer";

const SNACKBAR_ANCHOR_ORIGIN: OptionsObject["anchorOrigin"] = {
  vertical: "top",
  horizontal: "right",
};

const StyledMaterialDesignContent = styled(MaterialDesignContent)(() => ({
  "&.notistack-MuiContent-success": {
    backgroundColor: "#7fff7f",
    // 薄い黒
    color: "#333333",
  },
  "&.notistack-MuiContent-error": {
    backgroundColor: "#ff7f7f",
    color: "#333333",
  },
  "&.notistack-MuiContent-warning": {
    backgroundColor: "#ffff7f",
    color: "#333333",
  },
}));

type SnackbarOptions = Omit<Partial<OptionsObject>, "autoHideDuration"> & {
  autoHideDuration?: OptionsObject["autoHideDuration"] | null;
};

export default function SnackbarGroup() {
  const { success, error, warn } = useAppSelectorV2(selectSnackbar);
  const dispatch = useAppDispatchV2();

  const resetSuccess = useCallback(() => {
    dispatch(setSnackbarSuccess(null));
  }, [dispatch]);

  const resetError = useCallback(() => {
    dispatch(setSnackbarError(null));
  }, [dispatch]);

  const resetWarn = useCallback(() => {
    dispatch(setSnackbarWarn(null));
  }, [dispatch]);

  const showSnackbar = useCallback(
    (
      message: string | null,
      variant: VariantType,
      reset: () => void,
      options: SnackbarOptions = {}
    ) => {
      if (!message) {
        return;
      }

      enqueueSnackbar(message, {
        variant,
        anchorOrigin: SNACKBAR_ANCHOR_ORIGIN,
        ...options,
      });

      reset();
    },
    []
  );

  // スナックバーの各フィールドに依存関係を限定し、無関係な状態更新で副作用が発火しないようにする。
  useEffect(() => {
    showSnackbar(success, "success", resetSuccess, {
      className: "snackbar-success",
      autoHideDuration: 6000,
    });

    showSnackbar(error, "error", resetError, {
      className: "snackbar-error",
      // 既存の挙動を維持するため、自動クローズは無効化したままにする。
      autoHideDuration: null,
    });

    showSnackbar(warn, "warning", resetWarn, {
      className: "snackbar-warn",
    });
  }, [success, error, warn, showSnackbar, resetSuccess, resetError, resetWarn]);

  // アイコンボタンが再生成されないよう、アクションのハンドラーを安定化させる。
  const action = useCallback((snackbarKey: SnackbarKey) => {
    return (
      <IconButton color="inherit" onClick={() => closeSnackbar(snackbarKey)}>
        <CloseIcon />
      </IconButton>
    );
  }, []);

  return (
    <SnackbarProvider
      action={action}
      Components={{
        success: StyledMaterialDesignContent,
        error: StyledMaterialDesignContent,
        warning: StyledMaterialDesignContent,
      }}
    />
  );
}
