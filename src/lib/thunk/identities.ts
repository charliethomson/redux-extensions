import { Draft } from "@reduxjs/toolkit";
import { Reducer } from "../common";
import { MakeThunkMatcherOpts, MakeThunkMatcherOptsOrHandler } from "./options";

export const isHandler = <State, Result, Meta>(
  opts?: MakeThunkMatcherOptsOrHandler<State, Result, Meta>
): opts is Reducer<State, Result, Meta> =>
  opts !== undefined && typeof opts === "function";
export const isField = <State, Result, Meta>(
  opts?: MakeThunkMatcherOptsOrHandler<State, Result, Meta>
): opts is keyof Draft<State> & keyof State =>
  opts !== undefined && typeof opts === "string";

export const isOptions = <State, Result, Meta>(
  opts?: MakeThunkMatcherOptsOrHandler<State, Result, Meta>
): opts is MakeThunkMatcherOpts<State, Result, Meta> =>
  opts !== undefined && typeof opts === "object";
