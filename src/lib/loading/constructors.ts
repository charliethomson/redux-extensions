import {
  LoadingPending,
  LoadingIdle,
  LoadingRejected,
  LoadingFulfilled,
} from "./core";
import { internal } from "./internal";

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
