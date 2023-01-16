import { PayloadAction, CaseReducer } from "@reduxjs/toolkit";

export type Matcher = (action: PayloadAction<any, string>) => boolean;

export type Reducer<State, Result, Meta = unknown> = CaseReducer<
  State,
  PayloadAction<Result, string, Meta, any>
>;
