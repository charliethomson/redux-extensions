import { PayloadAction, CaseReducer, Draft } from "@reduxjs/toolkit";
import { Reducer } from "../common";
import { Loading } from "./core";
import { JoinOptions } from "./util";

export type FieldSetter<State, Result, Meta> = (
  state: Draft<State>,
  action: PayloadAction<Result, string, Meta, any>,
  status: Loading<any, any>
) => void;

// TODO: Figure out how to have a ts error when field is non-string to disable join
export interface MakeLoadingMatcherOpts<
  State,
  Result,
  Meta,
  K extends keyof Draft<State> = keyof Draft<State>
> {
  field?: K | FieldSetter<State, Result, Meta>;
  // FIXME: Typing on this option
  join?: JoinOptions<any[], any[]>;
  byId?: (action: PayloadAction<Result, string, Meta, any>) => string | number;
  transform?: (result: Result) => Draft<State>[K];
  onPending?: Reducer<State, Result, Meta>;
  onRejected?: Reducer<State, Result, Meta>;
  onFulfilled?: Reducer<State, Result, Meta>;
  afterPending?: Reducer<State, Result, Meta>;
  afterRejected?: Reducer<State, Result, Meta>;
  afterFulfilled?: Reducer<State, Result, Meta>;
}
