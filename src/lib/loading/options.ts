import { PayloadAction, CaseReducer, Draft } from "@reduxjs/toolkit";
import { M, R, S } from "vitest/dist/types-5617096e";
import { Reducer } from "../common";
import { Loading, LoadingInner } from "./core";
import { JoinOptions } from "./util";

export type FieldSetter<State, Result, Meta> = (
  state: Draft<State>,
  action: PayloadAction<Result, string, Meta, any>,
  status: Loading<any, any>
) => void;

type CommonOpts<State, Result, Meta> = {
  onPending?: Reducer<State, Result, Meta>;
  onRejected?: Reducer<State, Result, Meta>;
  onFulfilled?: Reducer<State, Result, Meta>;
  afterPending?: Reducer<State, Result, Meta>;
  afterRejected?: Reducer<State, Result, Meta>;
  afterFulfilled?: Reducer<State, Result, Meta>;
};

export type TransformFunction<State, Result, Field extends keyof State> = (
  result: Result
) => LoadingInner<State[Field]>;

export type FieldSettings<State, Result, Meta, Field extends keyof State> = {
  transform?: TransformFunction<State, Result, Field>;
  join?: State[Field] extends Loading<any>
    ?
        | boolean
        | JoinOptions<
            LoadingInner<State[Field]>,
            Result extends any[] ? Result : never[]
          >
    : never;
  byId?: State[Field] extends Record<infer R, any>
    ? (action: PayloadAction<Result, string, Meta, any>) => R
    : never;
};

export type FieldOpt<State, Result, Meta, Field extends keyof State> =
  | boolean
  | TransformFunction<State, Result, Field>
  | FieldSettings<State, Result, Meta, Field>;

export type FieldOpts<State, Result, Meta> = {
  [Field in keyof State]?: State[Field] extends Loading<any>
    ? FieldOpt<State, Result, Meta, Field>
    : State[Field] extends Record<string | number | symbol, Loading<any>>
    ? FieldSettings<State, Result, Meta, Field>
    : never;
};

export type MakeLoadingMatcherOpts<State, Result, Meta> = CommonOpts<
  State,
  Result,
  Meta
> &
  FieldOpts<State, Result, Meta>;

export const isCommonOption = <K>(key: K): boolean =>
  key &&
  typeof key === "string" &&
  /(on|after)(Pending|Rejected|Fulfilled)/g.test(key);

export const isTransformFunction = <
  State,
  Result,
  Meta,
  Field extends keyof State
>(
  fieldOpt: FieldOpt<State, Result, Meta, Field>
): fieldOpt is TransformFunction<State, Result, Field> =>
  typeof fieldOpt === "function";
