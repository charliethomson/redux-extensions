import { PayloadAction, CaseReducer } from "@reduxjs/toolkit";

export type Matcher = (action: PayloadAction<unknown, string>) => boolean;

export type Reducer<State, Result, Meta = unknown> = CaseReducer<
  State,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  PayloadAction<Result, string, Meta, any>
>;
