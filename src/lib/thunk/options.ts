import { Draft, PayloadAction } from "@reduxjs/toolkit";
import { Reducer } from "../common";

export type MakeThunkMatcherOptsOrHandler<State, Result, Meta> =
  | MakeThunkMatcherOpts<State, Result, Meta>
  | Reducer<State, Result, Meta>
  | (keyof State & keyof Draft<State>);

export type Handlers<State, Result, Meta> = {
  onPending?: Reducer<State, Result, Meta>;
  onRejected?: Reducer<State, Result, Meta>;
  onFulfilled?: Reducer<State, Result, Meta>;
};

export type FieldReducer<
  State,
  Result,
  Field extends keyof State,
  Meta = unknown
> = (
  state: State,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: PayloadAction<Result, string, Meta, any>
) => State[Field] | undefined;

export type FieldHandlers<State, Result, Meta, Field extends keyof State> = {
  onPending?: FieldReducer<State, Result, Field, Meta>;
  onRejected?: FieldReducer<State, Result, Field, Meta>;
  onFulfilled?: FieldReducer<State, Result, Field, Meta>;
};

export type MakeThunkMatcherOpts<State, Result, Meta> = Handlers<
  State,
  Result,
  Meta
> & {
  [Field in keyof State]?:
    | boolean
    | ((result: Result, previousValue?: State[Field]) => State[Field])
    | FieldHandlers<State, Result, Meta, Field>;
};
