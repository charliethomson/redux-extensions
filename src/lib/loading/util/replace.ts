import { makeFulfilled } from "../constructors";
import { Loading } from "../core";
import { isFulfilled } from "../identities";

export const replaceLoading = <T extends any>(loading: Loading<T>, data: T) => {
  if (isFulfilled(loading)) return makeFulfilled(data);
  return loading;
};
