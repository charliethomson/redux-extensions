/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-param-reassign */
import { AsyncThunk, PayloadAction, Draft } from "@reduxjs/toolkit";
import { cloneDeep, merge } from "lodash-es";
import { Matcher, Reducer } from "../common";

import { makePending, makeFulfilled, makeRejected } from "./constructors";
import { isFulfilled } from "./identities";
import {
  FieldOpts,
  isCommonOption,
  MakeLoadingMatcherOpts,
  TransformFunction,
} from "./options";
import { joinLoading, JoinOptions, mapLoading } from "./util";

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

export type LoadingInner<TLoading> = TLoading extends LoadingFulfilled<infer R>
  ? R
  : never;
export type LoadingInnerErr<TLoading> = TLoading extends LoadingRejected<
  infer E
>
  ? E
  : never;

export const makeLoadingMatcher = <
  State = any,
  Result = any,
  Arg = any,
  Meta = { arg: Arg }
>(
  thunk: AsyncThunk<Result, Arg, any>,
  opts: MakeLoadingMatcherOpts<State, Result, Meta>
): [Matcher, Reducer<State, Result, Meta>] => {
  return [
    (action: PayloadAction<any, string>) =>
      action.type.startsWith(thunk.typePrefix),
    (state: Draft<State>, action: PayloadAction<Result, string, Meta, any>) => {
      const reduce = (status: Exclude<LoadingStatus, "idle">) => {
        const getStatus = (): Loading<Result, typeof action.error> => {
          if (status === "pending") return makePending();
          if (status === "rejected") return makeRejected(action.error);
          return makeFulfilled(action.payload);
        };

        const doUpdates = (fields: FieldOpts<State, Result, Meta>) => {
          // eslint-disable-next-line prefer-const
          let fieldUpdates: Partial<State> = { ...(state as State) };

          const originalStatus = getStatus();

          for (const field in fields) {
            if (!isFulfilled(originalStatus)) {
              (fieldUpdates[field] as Loading<any, any>) = originalStatus;
              continue;
            }

            // status is fulfilled<Result>
            let status = cloneDeep<Loading<any>>(originalStatus);
            const opt = fields[field];
            if (typeof opt === "object") {
              if (opt.transform) {
                status = mapLoading(status, (result?: Result) =>
                  result
                    ? opt.transform?.(
                        result,
                        (
                          state[
                            field as keyof Draft<State>
                          ] as LoadingFulfilled<any>
                        )?.data
                      )
                    : null
                );
              }

              if (opt.join) {
                const joinOptions =
                  typeof opt.join === "boolean"
                    ? ({} as JoinOptions<any, any>)
                    : opt.join;

                status = joinLoading(
                  state[field as keyof Draft<State>] as Loading<any>,
                  status as Loading<any>,
                  joinOptions as any
                );
              }
            } else if (typeof opt === "function") {
              // opt == TransformFunction
              status = mapLoading(status, (result) =>
                result
                  ? (opt as TransformFunction<State, Result, keyof State>)(
                      result,
                      (
                        state[
                          field as keyof Draft<State>
                        ] as LoadingFulfilled<any>
                      )?.data
                    )
                  : null
              );
            }

            if (typeof opt === "object" && opt.byId) {
              (fieldUpdates[field] as Record<string, Loading<any, any>>)[
                opt.byId(action).toString()
              ] = status;
            } else {
              (fieldUpdates[field] as Loading<any, any>) = status;
            }
          }

          state = merge(state, fieldUpdates);
        };

        const { onHandler, afterHandler } = {
          pending: {
            onHandler: opts?.onPending,
            afterHandler: opts?.afterPending,
          },
          fulfilled: {
            onHandler: opts?.onFulfilled,
            afterHandler: opts?.afterFulfilled,
          },
          rejected: {
            onHandler: opts?.onRejected,
            afterHandler: opts?.afterRejected,
          },
        }[status];

        const fields = Object.fromEntries(
          Object.entries(opts).filter(([k, _]) => !isCommonOption(k)) as any
        ) as FieldOpts<State, Result, Meta>;

        onHandler?.(state, action);

        doUpdates(fields);

        afterHandler?.(state, action);
      };

      if (action.type.endsWith("pending")) return reduce("pending");
      if (action.type.endsWith("rejected")) return reduce("rejected");
      if (action.type.endsWith("fulfilled")) return reduce("fulfilled");
    },
  ];
};
