import React, { ReactNode } from "react";
import { isFulfilled, isPending, isRejected, Loading } from "..";

export interface LoadingSwitchProps<T, E> {
  loader?: Loading<T, E>;
  pending?: React.ReactElement;
  fulfilled?: (data: T) => React.ReactElement;
  rejected?: (error: E) => React.ReactElement;
  fallback?: React.ReactElement;
}
export function LoadingSwitch<T, E>({
  loader,
  pending,
  fulfilled,
  rejected,
  fallback,
}: LoadingSwitchProps<T, E>) {
  if (isPending(loader)) return pending ?? null;
  if (isFulfilled(loader)) return fulfilled?.(loader.data) ?? null;
  if (isRejected(loader)) return rejected?.(loader.error) ?? null;
  return fallback ?? null;
}
