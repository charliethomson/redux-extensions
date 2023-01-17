import {
  AsyncThunk,
  PayloadAction,
  Draft,
  isFulfilled,
  isPending,
  isRejected,
} from "@reduxjs/toolkit";
import { Matcher, Reducer } from "../common";
import { isField, isHandler, isOptions } from "./identities";
import { MakeThunkMatcherOptsOrHandler } from "./options";

const setField = <
  State = any,
  Arg = any,
  Result = any,
  Meta = { arg: Arg },
  Field extends keyof State = keyof State
>(
  state: State,
  action: PayloadAction<Result, string, Meta, any>,
  field: Field,
  transform?: (result: Result) => State[Field]
) => {
  state[field] = (
    transform ? transform(action.payload) : action.payload
  ) as State[Field];
};
isFulfilled;

export const makeThunkMatcher = <
  State = any,
  Result = any,
  Arg = any,
  Meta = { arg: Arg }
>(
  thunk: AsyncThunk<Result, Arg, any>,
  opts?: MakeThunkMatcherOptsOrHandler<State, Result, Meta>
): [Matcher, Reducer<State, Result, Meta>] => {
  return [
    (action: PayloadAction<any, string>) =>
      action.type.startsWith(thunk.typePrefix),
    (state: Draft<State>, action: PayloadAction<Result, string, Meta, any>) => {
      if (action.type.endsWith("fulfilled")) {
        if (isHandler(opts)) return opts(state, action);
        if (isField(opts)) return setField(state, action, opts);
        if (isOptions(opts)) {
          if (opts?.field !== undefined)
            setField(state, action, opts.field, opts.transform);
          opts.onFulfilled?.(state, action);
        }
      }

      if (isOptions(opts)) {
        if (action.type.endsWith("pending"))
          return opts.onPending?.(state, action);
        if (action.type.endsWith("rejected"))
          return opts.onRejected?.(state, action);
      }
    },
  ];
};