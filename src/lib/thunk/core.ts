/* eslint-disable @typescript-eslint/no-explicit-any */
import { AsyncThunk, PayloadAction, Draft } from "@reduxjs/toolkit";
import { Matcher, Reducer } from "../common";
import { isField, isHandler, isOptions } from "./identities";
import { FieldHandlers, MakeThunkMatcherOptsOrHandler } from "./options";

const setField = <
  State = object,
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
      const options = isOptions(opts)
        ? Object.entries(opts).filter(
            ([k, _]) => !["onPending", "onRejected", "onFulfilled"].includes(k)
          )
        : undefined;

      if (action.type.endsWith("fulfilled")) {
        if (isHandler(opts)) return opts(state, action);
        if (isField(opts)) return setField(state, action, opts);
        if (isOptions(opts) && options !== undefined) {
          options.forEach(([field, handler]) => {
            if (typeof handler === "boolean") {
              (state as State)[field as keyof State] = action.payload as any;
            } else if (typeof handler === "function") {
              (state as any)[field as any] = (handler as any)(
                action.payload,
                (state as any)[field as any]
              );
            }
          });

          opts.onFulfilled?.(state, action);
        }
      }

      if (isOptions(opts) && options !== undefined) {
        options
          .filter(([_field, handler]) => typeof handler === "object")
          .forEach(([field, handler]) => {
            const { onFulfilled, onPending, onRejected } =
              handler as FieldHandlers<State, Result, Meta, keyof State>;

            if (action.type.endsWith("fulfilled")) {
              const result = onFulfilled?.(action, state as any);
              if (result !== undefined) (state as any)[field as any] = result;
            }
            if (action.type.endsWith("pending")) {
              const result = onPending?.(action, state as any);
              if (result !== undefined) (state as any)[field as any] = result;
            }
            if (action.type.endsWith("rejected")) {
              const result = onRejected?.(action, state as any);
              if (result !== undefined) (state as any)[field as any] = result;
            }
          });

        if (action.type.endsWith("pending"))
          return opts.onPending?.(state, action);
        if (action.type.endsWith("rejected"))
          return opts.onRejected?.(state, action);
      }
    },
  ];
};
