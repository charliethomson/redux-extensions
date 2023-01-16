import { Loading, LoadingFulfilled } from "./core";

export namespace internal {
  export interface LoadingPendingWithData<T> {
    status: "pending";
    data: T;
    error?: never;
  }
  export const isPendingWithData = <T>(
    loading?: Loading<T>
  ): loading is LoadingFulfilled<T> =>
    loading !== undefined && loading.status === "pending" && "data" in loading;

  export const makePendingWithData = <T>(
    data: T
  ): internal.LoadingPendingWithData<T> => ({
    status: "pending",
    data,
  });
}
