import { Draft } from "@reduxjs/toolkit";
import { Reducer } from "../common";

export type MakeThunkMatcherOptsOrHandler<State, Result, Meta> =
  | MakeThunkMatcherOpts<State, Result, Meta>
  | Reducer<State, Result, Meta>
  | (keyof State & keyof Draft<State>);

type Handlers<State, Result, Meta> = {
  onPending?: Reducer<State, Result, Meta>;
  onRejected?: Reducer<State, Result, Meta>;
  onFulfilled?: Reducer<State, Result, Meta>;
};

export type MakeThunkMatcherOpts<State, Result, Meta> = Handlers<
  State,
  Result,
  Meta
> & {
  [Field in keyof State]?: boolean | ((result: Result) => State[Field]);
};
