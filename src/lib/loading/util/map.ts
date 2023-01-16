import { isFulfilled, isRejected } from "../identities";
import { makeFulfilled, makeRejected } from "../constructors";
import { Loading } from "../core";

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
