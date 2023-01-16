import { uniqBy } from "lodash-es";
import { makePending, makeFulfilled } from "../constructors";
import { Loading } from "../core";
import {
  isIdle,
  isAny,
  isRejected,
  isPending,
  isFulfilled,
} from "../identities";
import { internal } from "../internal";
import { mapLoading } from "./map";

type ArrayType<Parent> = Parent extends Array<infer R> ? R : never;

export interface JoinOptions<OriginalItems, NewItems> {
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
    return internal.makePendingWithData(
      original.data
    ) as unknown as Loading<OriginalItems>;

  // we have old and new data, now we merge
  if (
    isAny(original, isFulfilled, internal.isPendingWithData) &&
    isFulfilled(b2)
  ) {
    const originalData = original.data ?? ([] as unknown[] as OriginalItems);
    const data = performMerge(originalData, b2.data);

    return makeFulfilled(opts?.dedup ? performDedupe(data) : data);
  }

  return b2;
};
