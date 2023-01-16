import { AsyncThunk, PayloadAction, Draft } from "@reduxjs/toolkit";
import { makePending, makeFulfilled, makeRejected } from "./constructors";
import { LoadingOptions } from "./options";
import { joinLoading, JoinOptions } from "./util";

export interface LoadingPending {
  status: "pending";
  data?: never;
  error?: never;
}
export interface LoadingIdle {
  status: "idle";
  data?: never;
  error?: never;
}
export interface LoadingRejected<E> {
  status: "rejected";
  error: E;
}
export interface LoadingFulfilled<T> {
  status: "fulfilled";
  data: T;
}

export type Loading<T = unknown, E = any> =
  | LoadingPending
  | LoadingIdle
  | LoadingRejected<E>
  | LoadingFulfilled<T>;

export type LoadingStatus = Loading<never, never>["status"];

export const makeLoadingMatcher = <
  State = any,
  Result = any,
  Arg = any,
  Meta = { arg: Arg }
>(
  thunk: AsyncThunk<Result, Arg, any>,
  opts?: LoadingOptions.MakeLoadingMatcherOpts<State, Result, Meta>
): [
  LoadingOptions.LoadingMatcher,
  LoadingOptions.LoadingReducer<State, Result, Meta>
] => {
  return [
    (action: PayloadAction<any, string>) =>
      action.type.startsWith(thunk.typePrefix),
    (state: Draft<State>, action: PayloadAction<Result, string, Meta, any>) => {
      const reduce = (status: Exclude<LoadingStatus, "idle">) => {
        const { onHandler, afterHandler, loadingStatus } = {
          pending: {
            onHandler: opts?.onPending,
            afterHandler: opts?.afterPending,
            loadingStatus: makePending(),
          },
          fulfilled: {
            onHandler: opts?.onFulfilled,
            afterHandler: opts?.afterFulfilled,
            loadingStatus: makeFulfilled(
              opts?.transform ? opts.transform(action.payload) : action.payload
            ),
          },
          rejected: {
            onHandler: opts?.onRejected,
            afterHandler: opts?.afterRejected,
            loadingStatus: makeRejected(action.error),
          },
        }[status];

        onHandler?.(state, action);
        let newValue = undefined;
        if (typeof opts?.field === "function")
          opts.field(state, action, loadingStatus);
        else if (typeof opts?.field === "string") {
          if (opts.join) {
            newValue = joinLoading(
              state[opts.field] as Loading<any>,
              loadingStatus as Loading<any>,
              typeof opts.join === "boolean"
                ? ({} as JoinOptions<any, any>)
                : opts.join
            );
          } else if (opts.byId) {
            (state[opts.field] as Record<string, any>)[
              opts.byId(action).toString()
            ] = loadingStatus;
          } else newValue = loadingStatus;
        }

        if (newValue && typeof opts?.field === "string")
          (state[opts.field] as Loading<any, any>) = newValue;

        afterHandler?.(state, action);
      };

      if (action.type.endsWith("pending")) reduce("pending");
      else if (action.type.endsWith("rejected")) reduce("rejected");
      else if (action.type.endsWith("fulfilled")) reduce("fulfilled");
    },
  ];
};
