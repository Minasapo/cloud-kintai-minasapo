import { useAppDispatchV2 } from "@app/hooks";
import { AppConfigContext } from "@entities/app-config/model/AppConfigContext";
import {
  CreateAppConfigInput,
  UpdateAppConfigInput,
} from "@shared/api/graphql/types";
import { pushNotification } from "@shared/lib/store/notificationSlice";
import {
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { E14001, E14002, S14001, S14002 } from "@/errors";

export type SavePayload = Record<string, unknown>;
export type SetStateAndQueueSave<TState> = (
  nextState: SetStateAction<TState>,
) => void;

export const AUTO_SAVE_DELAY = 600;

export function useAppConfigSaveAction() {
  const { getConfigId, saveConfig, fetchConfig } = useContext(AppConfigContext);
  const dispatch = useAppDispatchV2();

  const save = async (payload: SavePayload) => {
    try {
      const id = getConfigId();

      if (id) {
        await saveConfig({
          id,
          ...payload,
        } as unknown as UpdateAppConfigInput);
        dispatch(
          pushNotification({
            tone: "success",
            message: S14002,
          }),
        );
      } else {
        await saveConfig({
          name: "default",
          ...payload,
        } as unknown as CreateAppConfigInput);
        dispatch(
          pushNotification({
            tone: "success",
            message: S14001,
          }),
        );
      }

      await fetchConfig();
    } catch {
      dispatch(
        pushNotification({
          tone: "error",
          message: E14001,
        }),
      );
    }
  };

  const notifyValidationError = (message: string = E14002) => {
    dispatch(
      pushNotification({
        tone: "error",
        message,
      }),
    );
  };

  return {
    save,
    notifyValidationError,
  };
}

export function AutoSaveStatus({ saving }: { saving: boolean }) {
  return (
    <p className="text-sm text-slate-500" aria-live="polite">
      {saving ? "変更を保存中..." : "変更は自動で保存されます。"}
    </p>
  );
}

export function useAutoSaveAction({
  enabled = true,
  validate,
  onSave,
  onInvalid,
}: {
  enabled?: boolean;
  validate?: () => boolean;
  onSave: () => Promise<void>;
  onInvalid?: () => void;
}) {
  const [saveToken, setSaveToken] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!enabled || saveToken === 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void (async () => {
        if (validate && !validate()) {
          onInvalid?.();
          return;
        }

        setSaving(true);
        try {
          await onSave();
        } finally {
          setSaving(false);
        }
      })();
    }, AUTO_SAVE_DELAY);

    return () => window.clearTimeout(timeoutId);
  }, [enabled, onInvalid, onSave, saveToken, validate]);

  return {
    saving,
    queueSave: () => setSaveToken((prev) => prev + 1),
  };
}

export function useAutoSaveConfigState<TState>({
  getInitialState,
  createPayload,
  validate,
  onInvalid,
}: {
  getInitialState: () => TState;
  createPayload: (state: TState) => SavePayload;
  validate?: (state: TState) => boolean;
  onInvalid?: () => void;
}) {
  const { save } = useAppConfigSaveAction();
  const [state, setState] = useState<TState>(() => getInitialState());

  useEffect(() => {
    setState(getInitialState());
  }, [getInitialState]);

  const persist = useCallback(async () => {
    await save(createPayload(state));
  }, [createPayload, save, state]);
  const { saving, queueSave } = useAutoSaveAction({
    validate: validate ? () => validate(state) : undefined,
    onSave: persist,
    onInvalid,
  });

  const setStateAndQueueSave = useCallback(
    (nextState: SetStateAction<TState>) => {
      setState(nextState);
      queueSave();
    },
    [queueSave],
  );

  return {
    state,
    setStateAndQueueSave,
    saving,
  };
}

function updateObjectState<TState extends object, TKey extends keyof TState>(
  prev: TState,
  key: TKey,
  value: TState[TKey],
): TState {
  return {
    ...prev,
    [key]: value,
  };
}

export function useAutoSaveObjectState<TState extends object>(
  options: Parameters<typeof useAutoSaveConfigState<TState>>[0],
) {
  const { state, setStateAndQueueSave, saving } =
    useAutoSaveConfigState(options);
  const updateField = useCallback(
    <TKey extends keyof TState>(key: TKey, value: TState[TKey]) => {
      setStateAndQueueSave((prev) => updateObjectState(prev, key, value));
    },
    [setStateAndQueueSave],
  );

  return {
    state,
    updateField,
    saving,
  };
}

export function useToggleSetting(getter: () => boolean, saveKey: string) {
  const getInitialState = useCallback(() => getter(), [getter]);
  const {
    state: enabled,
    setStateAndQueueSave,
    saving,
  } = useAutoSaveConfigState({
    getInitialState,
    createPayload: (state) => ({ [saveKey]: state }),
  });

  return { enabled, setEnabledAndQueueSave: setStateAndQueueSave, saving };
}
