import {
  Action,
  ActionCreator,
  ActionReducerMapBuilder,
  AnyAction,
  AsyncThunk,
  CaseReducer,
  Draft,
  PayloadAction,
} from "@reduxjs/toolkit";
import { TypedActionCreator } from "@reduxjs/toolkit/dist/mapBuilders";
import { TypeGuard } from "@reduxjs/toolkit/dist/tsHelpers";
import { uniqBy } from "lodash-es";

//#region loading types
interface LoadingPending {
  status: "pending";
  data?: never;
  error?: never;
}
interface LoadingIdle {
  status: "idle";
  data?: never;
  error?: never;
}
interface LoadingRejected<E> {
  status: "rejected";
  error: E;
}
interface LoadingFulfilled<T> {
  status: "fulfilled";
  data: T;
}
//#region internal loading types
interface LoadingPendingWithData<T> {
  status: "pending";
  data: T;
  error?: never;
}

export type Loading<T = unknown, E = any> =
  | LoadingPending
  | LoadingIdle
  | LoadingRejected<E>
  | LoadingFulfilled<T>;

export type LoadingStatus = Loading<never, never>["status"];
//#endregion
//#endregion
//#region constructors
export const makePending = (): LoadingPending => ({ status: "pending" });
export const makeIdle = (): LoadingIdle => ({ status: "idle" });
export const makeRejected = <E>(error: E): LoadingRejected<E> => ({
  status: "rejected",
  error,
});
export const makeFulfilled = <T>(data: T): LoadingFulfilled<T> => ({
  status: "fulfilled",
  data,
});
//#region internal constructors
const makePendingWithData = <T>(data: T): LoadingPendingWithData<T> => ({
  status: "pending",
  data,
});
//#endregion
//#endregion
//#region identities
export const isAny = (
  loader: Loading<unknown, unknown>,
  ...matchers: ((loading?: Loading<unknown, unknown>) => boolean)[]
): boolean => matchers.some((m) => m(loader));
export const isPending = (loading?: Loading): loading is LoadingPending =>
  loading !== undefined && loading.status === "pending" && !("data" in loading);
export const isIdle = (loading?: Loading): loading is LoadingIdle =>
  loading !== undefined && loading.status === "idle";
export const isRejected = <E>(
  loading?: Loading<unknown, E>
): loading is LoadingRejected<E> =>
  loading !== undefined && loading.status === "rejected";
export const isFulfilled = <T>(
  loading?: Loading<T>
): loading is LoadingFulfilled<T> =>
  loading !== undefined && loading.status === "fulfilled";

//#region internal identities
const isPendingWithData = <T>(
  loading?: Loading<T>
): loading is LoadingFulfilled<T> =>
  loading !== undefined && loading.status === "pending" && "data" in loading;
//#endregion
//#endregion
//#region utilities

type Mapper<I, O> = (item?: I) => O;
export const mapLoading = <T = any, R = any>(
  loading: Loading<T>,
  mapper: Mapper<T, R>
) => {
  return isFulfilled(loading) ? makeFulfilled(mapper(loading.data)) : loading;
};
export const mapLoadingErr = <E = any, R = any>(
  loading: Loading<never, E>,
  mapper: Mapper<E, R>
) => {
  return isRejected(loading) ? makeRejected(mapper(loading.error)) : loading;
};

type ArrayType<Parent> = Parent extends Array<infer R> ? R : never;

interface JoinOptions<OriginalItems, NewItems> {
  /// NOTE: If mapper is not provided it's assumed NewItems === OriginalItems
  mapper?: (t?: NewItems) => OriginalItems;
  joiner?: (a: OriginalItems, b: OriginalItems) => OriginalItems;
  dedup?:
    | keyof ArrayType<OriginalItems>
    | ((items: OriginalItems) => OriginalItems);
}
export const joinLoading = <
  OriginalItems extends Array<any>,
  NewItems extends Array<any>
>(
  original: Loading<OriginalItems>,
  additional: Loading<NewItems>,
  opts?: JoinOptions<OriginalItems, NewItems>
): Loading<OriginalItems> => {
  const performDedupe = (items: OriginalItems): OriginalItems => {
    // shouldn't be possible, correct behaviour escape hatch
    if (!opts?.dedup) return items;

    // manual dedupe
    if (typeof opts.dedup === "function") return opts.dedup(items);

    // keyof
    if (typeof opts.dedup === "string")
      return uniqBy(items, (item) => item[opts.dedup]) as OriginalItems;

    return items;
  };
  const performMerge = (
    original: OriginalItems,
    additional: OriginalItems
  ): OriginalItems =>
    (opts?.joiner
      ? // If passed a joiner, use it, otherwise just stack them
        opts.joiner(original, additional)
      : [...original, ...additional]) as OriginalItems;

  const map =
    opts?.mapper ??
    // MAPPER NOT PASSED - ASSUMING NewItems IS THE SAME TYPE AS OriginalItems
    ((t?: NewItems): OriginalItems => t as unknown as OriginalItems);

  const b2: Loading<OriginalItems> = mapLoading(additional, map);

  if (isIdle(original)) return b2;
  // overwrite error - retrying
  if (isRejected(original)) return b2;
  if (isPending(original) && isPending(b2)) return makePending();
  // we're getting new data, need to keep the old, set to pending
  if (isFulfilled(original) && isPending(b2))
    // WARNING: This relies on the LoadingPendingWithData type being in line with the other Loading types
    // This is working outside of typescript-land, please be careful with changing it
    return makePendingWithData(
      original.data
    ) as unknown as Loading<OriginalItems>;

  // we have old and new data, now we merge
  if (isAny(original, isFulfilled, isPendingWithData) && isFulfilled(b2)) {
    const originalData = original.data ?? ([] as unknown[] as OriginalItems);
    const data = performMerge(originalData, b2.data);

    return makeFulfilled(opts?.dedup ? performDedupe(data) : data);
  }

  return b2;
};

export const replaceLoading = <T extends any>(loading: Loading<T>, data: T) => {
  if (isFulfilled(loading)) return makeFulfilled(data);
  return loading;
};
//#endregion
//#region types
type LoadingMatcher = (action: PayloadAction<any, string>) => boolean;
type LoadingReducer<State, Result, Meta = unknown> = CaseReducer<
  State,
  PayloadAction<Result, string, Meta, any>
>;
type FieldSetter<State, Result, Meta> = (
  state: Draft<State>,
  action: PayloadAction<Result, string, Meta, any>,
  status: Loading<any, any>
) => void;

// TODO: Figure out how to have a ts error when field is non-string to disable join
interface MakeLoadingMatcherOpts<
  State,
  Result,
  Meta,
  K extends keyof Draft<State> = keyof Draft<State>
> {
  field?: K | FieldSetter<State, Result, Meta>;
  join?: K extends string
    ? boolean | JoinOptions<Draft<State>[K], Draft<State>[K]>
    : never;
  byId?: (action: PayloadAction<Result, string, Meta, any>) => string | number;
  transform?: (result: Result) => Draft<State>[K];
  onPending?: LoadingReducer<State, Result, Meta>;
  onRejected?: LoadingReducer<State, Result, Meta>;
  onFulfilled?: LoadingReducer<State, Result, Meta>;
  afterPending?: LoadingReducer<State, Result, Meta>;
  afterRejected?: LoadingReducer<State, Result, Meta>;
  afterFulfilled?: LoadingReducer<State, Result, Meta>;
}
//#endregion
//#region meat and potatoes
export const makeLoadingMatcher = <
  State = any,
  Result = any,
  Arg = any,
  Meta = { arg: Arg }
>(
  thunk: AsyncThunk<Result, Arg, any>,
  opts?: MakeLoadingMatcherOpts<State, Result, Meta>
): [LoadingMatcher, LoadingReducer<State, Result, Meta>] => {
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
//#region ActionReducerMapBuilderWithLoading
interface ActionReducerMapBuilderWithLoading<State> {
  _inner: ActionReducerMapBuilder<State>;
  addLoadingMatcher<Result = any, Arg = any, Meta = { arg: Arg }>(
    thunk: AsyncThunk<Result, Arg, any>,
    opts?: MakeLoadingMatcherOpts<State, Result, Meta>
  ): ActionReducerMapBuilderWithLoading<State>;
  addCase<ActionCreator extends TypedActionCreator<string>>(
    actionCreator: ActionCreator,
    reducer: CaseReducer<State, ReturnType<ActionCreator>>
  ): ActionReducerMapBuilderWithLoading<State>;
  addCase<Type extends string, A extends Action<Type>>(
    type: Type,
    reducer: CaseReducer<State, A>
  ): ActionReducerMapBuilderWithLoading<State>;
  addMatcher<A>(
    matcher: TypeGuard<A> | ((action: any) => boolean),
    reducer: CaseReducer<State, A extends AnyAction ? A : A & AnyAction>
  ): Omit<ActionReducerMapBuilderWithLoading<State>, "addCase">;
  addDefaultCase(reducer: CaseReducer<State, AnyAction>): {};
}
// This is used to retrofit the addLoadingMatcher onto the ActionReducerMapBuilder
export const supportLoading = <State>(
  builder: ActionReducerMapBuilder<State>
): ActionReducerMapBuilderWithLoading<State> => {
  const b = {} as any;
  b._inner = builder;
  b.addLoadingMatcher = function <Result = any, Arg = any, Meta = { arg: Arg }>(
    thunk: AsyncThunk<Result, Arg, any>,
    opts?: MakeLoadingMatcherOpts<State, Result, Meta>
  ): ActionReducerMapBuilder<any> {
    this._inner.addMatcher(
      ...makeLoadingMatcher<State, Result, Arg, Meta>(thunk, opts)
    );
    return this;
  };
  b.addCase = function <ActionCreator extends TypedActionCreator<string>>(
    actionCreatorOrType: ActionCreator,
    reducer: CaseReducer<State, ReturnType<ActionCreator>>
  ): ActionReducerMapBuilderWithLoading<State> {
    this._inner.addCase(actionCreatorOrType, reducer);
    return this;
  };
  b.addCase = function <Type extends string, A extends Action<Type>>(
    type: Type,
    reducer: CaseReducer<State, A>
  ): ActionReducerMapBuilderWithLoading<State> {
    this._inner.addCase(type, reducer);
    return this;
  };
  b.addMatcher = function <A>(
    matcher: TypeGuard<A> | ((action: any) => boolean),
    reducer: CaseReducer<State, A extends AnyAction ? A : A & AnyAction>
  ): Omit<ActionReducerMapBuilderWithLoading<State>, "addCase"> {
    this._inner.addMatcher(matcher, reducer);
    return this;
  };
  b.addDefaultCase = function (reducer: CaseReducer<State, AnyAction>): {} {
    this._inner.addDefaultCase(reducer);
    return {};
  };
  return b as ActionReducerMapBuilderWithLoading<State>;
};
//#endregion
//#endregion
