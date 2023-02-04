/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-param-reassign */
import { AsyncThunk, PayloadAction, Draft } from "@reduxjs/toolkit";
import { cloneDeep, merge } from "lodash-es";
import { Matcher, Reducer } from "../common";

import { makePending, makeFulfilled, makeRejected } from "./constructors";
import { isFulfilled } from "./identities";
import { FieldOpts, isCommonOption, MakeLoadingMatcherOpts } from "./options";
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

const getStatus = <Data, Error, Meta>(
  status: LoadingStatus,
  action: PayloadAction<Data, string, Meta, any>
): Loading<Data, Error> => {
  if (status === "pending") return makePending();
  if (status === "rejected") return makeRejected(action.error);
  return makeFulfilled(action.payload);
};

const applyTransformOption = <State, Result, Meta, Field extends keyof State>(
  option: FieldOpts<State, Result, Meta>[Field],
  status: Loading<any>,
  state: State,
  field: Field
): Loading<any> => {
  if (typeof option !== "object" || option.transform === undefined)
    return status;

  const currentValue = state[field] as LoadingFulfilled<any>;

  const mapper = (result?: Result) =>
    result ? option.transform?.(result, currentValue.data) : null;

  return mapLoading(status, mapper);
};
const applyTransform = <State, Result, Meta, Field extends keyof State>(
  option: FieldOpts<State, Result, Meta>[Field],
  status: Loading<any>,
  state: State,
  field: Field
): Loading<any> => {
  if (typeof option !== "function") return status;

  const currentValue = state[field] as LoadingFulfilled<any>;

  const mapper = (result?: Result) =>
    result ? option(result, currentValue.data) : null;

  return mapLoading(status, mapper);
};
const applyJoin = <State, Result, Meta, Field extends keyof State>(
  option: FieldOpts<State, Result, Meta>[Field],
  status: Loading<any>,
  state: State,
  field: Field
): Loading<any> => {
  if (typeof option !== "object" || option.join === undefined) return status;

  let joinOptions = option.join as JoinOptions<any, any>;
  if (typeof joinOptions === "boolean")
    joinOptions = {} as JoinOptions<any, any>;

  const currentValue = state[field] as any;

  return joinLoading(currentValue, status, joinOptions);
};
const applyGroupBy = <State, Result, Meta, Field extends keyof State>(
  fieldUpdates: Partial<State>,
  option: FieldOpts<State, Result, Meta>[Field],
  status: Loading<any>,
  action: PayloadAction<Result, string, Meta, any>,
  field: Field
): Partial<State> => {
  if (typeof option === "object" && option.groupBy) {
    (fieldUpdates[field] as any)[option.groupBy(action).toString()] = status;
  } else {
    (fieldUpdates[field] as Loading<any, any>) = status;
  }
  return fieldUpdates;
};

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
        const doUpdates = (fields: FieldOpts<State, Result, Meta>) => {
          // eslint-disable-next-line prefer-const
          let fieldUpdates: Partial<State> = { ...(state as State) };

          const originalStatus = getStatus(status, action);

          for (const field in fields) {
            if (!isFulfilled(originalStatus)) {
              (fieldUpdates[field] as Loading<any, any>) = originalStatus;
              continue;
            }

            const opt = fields[field];
            // status is fulfilled<Result>
            let status = cloneDeep<Loading<any>>(originalStatus);
            status = applyTransformOption(opt, status, state as State, field);
            status = applyJoin(opt, status, state as State, field);
            status = applyTransform(opt, status, state as State, field);
            fieldUpdates = applyGroupBy(
              fieldUpdates,
              opt,
              status,
              action,
              field
            );
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
