import {
  Loading,
  LoadingPending,
  LoadingIdle,
  LoadingRejected,
  LoadingFulfilled,
} from "./core";

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
