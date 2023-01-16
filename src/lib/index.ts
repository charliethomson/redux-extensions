export * from "./loading";
export * as loading from "./loading";
export * from "./thunk";
export * as thunk from "./thunk";

import {
  ActionReducerMapBuilder,
  AsyncThunk,
  CaseReducer,
  Action,
  AnyAction,
} from "@reduxjs/toolkit";
import { TypedActionCreator } from "@reduxjs/toolkit/dist/mapBuilders";
import { TypeGuard } from "@reduxjs/toolkit/dist/tsHelpers";
import { makeLoadingMatcher } from "./loading";
import { MakeLoadingMatcherOpts } from "./loading/options";
import { makeThunkMatcher } from "./thunk";
import { MakeThunkMatcherOptsOrHandler } from "./thunk/options";
interface ActionReducerMapBuilderWithExtensions<State> {
  _inner: ActionReducerMapBuilder<State>;
  addLoadingMatcher<Result = any, Arg = any, Meta = { arg: Arg }>(
    thunk: AsyncThunk<Result, Arg, any>,
    opts?: MakeLoadingMatcherOpts<State, Result, Meta>
  ): ActionReducerMapBuilderWithExtensions<State>;
  addThunkMatcher<Result = any, Arg = any, Meta = { arg: Arg }>(
    thunk: AsyncThunk<Result, Arg, any>,
    opts?: MakeThunkMatcherOptsOrHandler<State, Result, Meta>
  ): ActionReducerMapBuilderWithExtensions<State>;
  addCase<ActionCreator extends TypedActionCreator<string>>(
    actionCreator: ActionCreator,
    reducer: CaseReducer<State, ReturnType<ActionCreator>>
  ): ActionReducerMapBuilderWithExtensions<State>;
  addCase<Type extends string, A extends Action<Type>>(
    type: Type,
    reducer: CaseReducer<State, A>
  ): ActionReducerMapBuilderWithExtensions<State>;
  addMatcher<A>(
    matcher: TypeGuard<A> | ((action: any) => boolean),
    reducer: CaseReducer<State, A extends AnyAction ? A : A & AnyAction>
  ): Omit<ActionReducerMapBuilderWithExtensions<State>, "addCase">;
  addDefaultCase(reducer: CaseReducer<State, AnyAction>): {};
}
// This is used to retrofit the addLoadingMatcher onto the ActionReducerMapBuilder
export const addExtensions = <State>(
  builder: ActionReducerMapBuilder<State>
): ActionReducerMapBuilderWithExtensions<State> => {
  const b = {} as any;
  b._inner = builder;
  b.addLoadingMatcher = function <Result = any, Arg = any, Meta = { arg: Arg }>(
    thunk: AsyncThunk<Result, Arg, any>,
    opts?: MakeLoadingMatcherOpts<State, Result, Meta>
  ): ActionReducerMapBuilder<State> {
    this._inner.addMatcher(
      ...makeLoadingMatcher<State, Result, Arg, Meta>(thunk, opts)
    );
    return this;
  };
  b.addThunkMatcher = function <Result = any, Arg = any, Meta = { arg: Arg }>(
    thunk: AsyncThunk<Result, Arg, any>,
    opts?: MakeThunkMatcherOptsOrHandler<State, Result, Meta>
  ): ActionReducerMapBuilder<State> {
    this._inner.addMatcher(
      ...makeThunkMatcher<State, Result, Arg, Meta>(thunk, opts)
    );
    return this;
  };
  //#region ActionReducerMapBuilder pass-through
  b.addCase = function <ActionCreator extends TypedActionCreator<string>>(
    actionCreatorOrType: ActionCreator,
    reducer: CaseReducer<State, ReturnType<ActionCreator>>
  ): ActionReducerMapBuilderWithExtensions<State> {
    this._inner.addCase(actionCreatorOrType, reducer);
    return this;
  };
  b.addCase = function <Type extends string, A extends Action<Type>>(
    type: Type,
    reducer: CaseReducer<State, A>
  ): ActionReducerMapBuilderWithExtensions<State> {
    this._inner.addCase(type, reducer);
    return this;
  };
  b.addMatcher = function <A>(
    matcher: TypeGuard<A> | ((action: any) => boolean),
    reducer: CaseReducer<State, A extends AnyAction ? A : A & AnyAction>
  ): Omit<ActionReducerMapBuilderWithExtensions<State>, "addCase"> {
    this._inner.addMatcher(matcher, reducer);
    return this;
  };
  b.addDefaultCase = function (reducer: CaseReducer<State, AnyAction>): {} {
    this._inner.addDefaultCase(reducer);
    return {};
  };
  //#endregion
  return b as ActionReducerMapBuilderWithExtensions<State>;
};
