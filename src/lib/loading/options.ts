import { PayloadAction, CaseReducer, Draft } from "@reduxjs/toolkit";
import { Loading } from "./core";
import { JoinOptions } from "./util";

export namespace LoadingOptions {
  export type LoadingMatcher = (action: PayloadAction<any, string>) => boolean;
  export type LoadingReducer<State, Result, Meta = unknown> = CaseReducer<
    State,
    PayloadAction<Result, string, Meta, any>
  >;
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
    join?: K extends string
      ? boolean | JoinOptions<Draft<State>[K], Draft<State>[K]>
      : never;
    byId?: (
      action: PayloadAction<Result, string, Meta, any>
    ) => string | number;
    transform?: (result: Result) => Draft<State>[K];
    onPending?: LoadingReducer<State, Result, Meta>;
    onRejected?: LoadingReducer<State, Result, Meta>;
    onFulfilled?: LoadingReducer<State, Result, Meta>;
    afterPending?: LoadingReducer<State, Result, Meta>;
    afterRejected?: LoadingReducer<State, Result, Meta>;
    afterFulfilled?: LoadingReducer<State, Result, Meta>;
  }
}
