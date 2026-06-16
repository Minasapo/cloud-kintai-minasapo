import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

import { AppDispatch, RootState } from "./store";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppDispatchV2 = useAppDispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppSelectorV2 = useAppSelector;
