import { PayloadAction, CaseReducer, Draft } from "@reduxjs/toolkit";
import { Reducer } from "../common";

export type MakeThunkMatcherOptsOrHandler<State, Result, Meta> =
  | MakeThunkMatcherOpts<State, Result, Meta>
  | Reducer<State, Result, Meta>
  | (keyof State & keyof Draft<State>);

export interface MakeThunkMatcherOpts<
  State,
  Result,
  Meta,
  Field extends keyof State & keyof Draft<State> = keyof State &
    keyof Draft<State>
> {
  field?: Field;
  transform?: (result: Result) => Draft<State>[Field];
  onPending?: Reducer<State, Result, Meta>;
  onRejected?: Reducer<State, Result, Meta>;
  onFulfilled?: Reducer<State, Result, Meta>;
}
