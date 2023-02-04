/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from "@reduxjs/toolkit";
import { Chance } from "chance";
import { uniq } from "lodash-es";
import { vi, expect, describe, it } from "vitest";
import {
  isFulfilled,
  isPending,
  isRejected,
  Loading,
  LoadingFulfilled,
  makeIdle,
  makeLoadingMatcher,
} from "..";
import { Matcher, Reducer } from "../../common";
import { MakeLoadingMatcherOpts } from "../options";

interface MockState {
  name: Loading<string>;
  items: Loading<number[]>;
  objects: Loading<{ id: number }[]>;
  details: Record<string, Loading<string>>;
}
const defaultState = (): MockState => ({
  details: {},
  items: makeIdle(),
  name: makeIdle(),
  objects: makeIdle(),
});

const chance = new Chance();

describe("makeThunkReducer", () => {
  const mockName = chance.name();
  const mockThunk = createAsyncThunk(
    "test/example",
    async (): Promise<string> => {
      return Promise.resolve(mockName);
    }
  );
  const setup = (
    initialState: MockState = defaultState(),
    opts: MakeLoadingMatcherOpts<MockState, string, any> = {}
  ): [MockState, Matcher, Reducer<MockState, string, any>] => {
    vi.resetAllMocks();
    const state = vi.mocked<MockState>(
      { ...defaultState(), ...initialState },
      true
    );
    const [matcher, reducer] = makeLoadingMatcher<MockState, string>(
      mockThunk,
      opts
    );
    return [state, matcher, reducer];
  };

  const makeMockAction = (
    type: string,
    payload?: any,
    arg: any = undefined
  ) => {
    return {
      type,
      payload: payload ?? mockName,
      meta: { arg: arg },
      error: undefined,
    };
  };

  it("creates a matcher that is valid for the given thunk", () => {
    const [_s, matcher, _r] = setup();
    expect(matcher(mockThunk.pending as any)).toBeTruthy();
    expect(matcher(mockThunk.rejected as any)).toBeTruthy();
    expect(matcher(mockThunk.fulfilled as any)).toBeTruthy();
  });

  it("creates a reducer that updates the status for the correct action", () => {
    const [state, _, reducer] = setup(undefined, {
      name: true,
    });
    reducer(state, makeMockAction(mockThunk.pending.toString()));
    expect(isPending(state.name)).toBeTruthy();
    reducer(state, makeMockAction(mockThunk.rejected.toString()));
    expect(isRejected(state.name)).toBeTruthy();
    reducer(state, makeMockAction(mockThunk.fulfilled.toString()));
    expect(isFulfilled(state.name)).toBeTruthy();
    expect((state.name as LoadingFulfilled<string>).data).toBe(mockName);
  });

  it("creates a reducer that respects the boolean field", () => {
    const [state, _, reducer] = setup(undefined, {
      name: true,
    });
    reducer(state, makeMockAction(mockThunk.fulfilled.toString()));
    expect(isFulfilled(state.name)).toBeTruthy();
    expect((state.name as LoadingFulfilled<string>).data).toBe(mockName);
  });

  it("creates a reducer that respects the transform variant", () => {
    const [state, _, reducer] = setup(undefined, {
      name: (name) => name.slice(0, 3),
    });
    reducer(state, makeMockAction(mockThunk.fulfilled.toString()));
    expect(isFulfilled(state.name)).toBeTruthy();
    expect((state.name as LoadingFulfilled<string>).data).toBe(
      mockName.slice(0, 3)
    );
  });
  it("creates a reducer that respects the transform variant, with previous value", () => {
    const [state, _, reducer] = setup(undefined, {
      name: (name, prev) => prev?.slice(0, 3) ?? name,
    });
    reducer(state, makeMockAction(mockThunk.fulfilled.toString()));
    expect(isFulfilled(state.name)).toBeTruthy();
    expect((state.name as LoadingFulfilled<string>).data).toBe(mockName);
    reducer(state, makeMockAction(mockThunk.fulfilled.toString()));
    expect((state.name as LoadingFulfilled<string>).data).toBe(
      mockName.slice(0, 3)
    );
  });

  it("creates a reducer that respects the transform option", () => {
    const [state, _, reducer] = setup(undefined, {
      name: { transform: (name) => name.slice(0, 3) },
    });
    reducer(state, makeMockAction(mockThunk.fulfilled.toString()));
    expect(isFulfilled(state.name)).toBeTruthy();
    expect((state.name as LoadingFulfilled<string>).data).toBe(
      mockName.slice(0, 3)
    );
  });

  it("creates a reducer that respects the transform option, with previous value", () => {
    const [state, _, reducer] = setup(undefined, {
      name: { transform: (name, prev) => prev?.slice(0, 3) ?? name },
    });
    reducer(state, makeMockAction(mockThunk.fulfilled.toString()));
    expect(isFulfilled(state.name)).toBeTruthy();
    expect((state.name as LoadingFulfilled<string>).data).toBe(mockName);
    reducer(state, makeMockAction(mockThunk.fulfilled.toString()));
    expect((state.name as LoadingFulfilled<string>).data).toBe(
      mockName.slice(0, 3)
    );
  });
  it("correctly merges items using the join option", () => {
    const [state, _, reducer] = setup(undefined, {
      items: { join: true },
    });
    reducer(state, makeMockAction(mockThunk.fulfilled.toString(), [1, 2, 3]));
    expect(isFulfilled(state.items)).toBeTruthy();
    expect((state.items as LoadingFulfilled<number[]>).data).toStrictEqual([
      1, 2, 3,
    ]);
    reducer(state, makeMockAction(mockThunk.fulfilled.toString(), [1, 2, 3]));
    expect((state.items as LoadingFulfilled<number[]>).data).toStrictEqual([
      1, 2, 3, 1, 2, 3,
    ]);
  });
  it("correctly merges items using the join option, with deduplication", () => {
    const [state, _, reducer] = setup(undefined, {
      items: {
        join: { dedup: true },
      },
    });
    reducer(state, makeMockAction(mockThunk.fulfilled.toString(), [1, 2, 3]));
    expect(isFulfilled(state.items)).toBeTruthy();
    expect((state.items as LoadingFulfilled<number[]>).data).toStrictEqual([
      1, 2, 3,
    ]);
    reducer(state, makeMockAction(mockThunk.fulfilled.toString(), [1, 2, 3]));
    expect((state.items as LoadingFulfilled<number[]>).data).toStrictEqual([
      1, 2, 3,
    ]);
  });
  it("correctly merges items using the join option, with manual deduplication", () => {
    const [state, _, reducer] = setup(undefined, {
      items: {
        join: {
          dedup: uniq,
        },
      },
    });
    reducer(state, makeMockAction(mockThunk.fulfilled.toString(), [1, 2, 3]));
    expect(isFulfilled(state.items)).toBeTruthy();
    expect((state.items as LoadingFulfilled<number[]>).data).toStrictEqual([
      1, 2, 3,
    ]);
    reducer(state, makeMockAction(mockThunk.fulfilled.toString(), [1, 2, 3]));
    expect((state.items as LoadingFulfilled<number[]>).data).toStrictEqual([
      1, 2, 3,
    ]);
  });
  it("correctly merges items using the join option, with deduplication (on objects, using the key variant)", () => {
    const [state, _, reducer] = setup(undefined, {
      objects: {
        join: { dedup: "id" },
      },
    });
    reducer(
      state,
      makeMockAction(mockThunk.fulfilled.toString(), [
        { id: 1 },
        { id: 2 },
        { id: 3 },
      ])
    );
    expect(isFulfilled(state.objects)).toBeTruthy();
    expect(
      (state.objects as LoadingFulfilled<{ id: number }[]>).data
    ).toStrictEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
    reducer(
      state,
      makeMockAction(mockThunk.fulfilled.toString(), [
        { id: 1 },
        { id: 2 },
        { id: 3 },
      ])
    );
    expect(
      (state.objects as LoadingFulfilled<{ id: number }[]>).data
    ).toStrictEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
  });

  it("correctly uses a custom joiner", () => {
    const [state, _, reducer] = setup(undefined, {
      items: {
        join: {
          joiner(a: number[], b: number[]): number[] {
            return [...a, ...b.reverse()];
          },
        },
      },
    });
    reducer(state, makeMockAction(mockThunk.fulfilled.toString(), [1, 2, 3]));
    expect(isFulfilled(state.items)).toBeTruthy();
    expect((state.items as LoadingFulfilled<number[]>).data).toStrictEqual([
      1, 2, 3,
    ]);
    reducer(state, makeMockAction(mockThunk.fulfilled.toString(), [1, 2, 3]));
    expect((state.items as LoadingFulfilled<number[]>).data).toStrictEqual([
      1, 2, 3, 3, 2, 1,
    ]);
  });
  it("correctly uses a custom mapper", () => {
    const [state, _, reducer] = setup(undefined, {
      items: {
        join: {
          mapper(t?: number[]): number[] {
            return t?.map((i) => i * i) ?? [];
          },
        },
      },
    });
    reducer(state, makeMockAction(mockThunk.fulfilled.toString(), [1, 2, 3]));
    expect(isFulfilled(state.items)).toBeTruthy();
    expect((state.items as LoadingFulfilled<number[]>).data).toStrictEqual([
      1, 4, 9,
    ]);
  });

  it("correctly handles independent states using byId", () => {
    const ID = 3;
    const [state, _, reducer] = setup(undefined, {
      details: {
        byId: (action) => action.meta.arg,
      },
    });
    reducer(
      state,
      makeMockAction(mockThunk.fulfilled.toString(), mockName, ID)
    );
    expect(isFulfilled(state.details[ID])).toBeTruthy();
    expect((state.details[ID] as LoadingFulfilled<string>).data).toStrictEqual(
      mockName
    );
    reducer(
      state,
      makeMockAction(mockThunk.fulfilled.toString(), mockName, ID - 1)
    );
    expect(isFulfilled(state.details[ID - 1])).toBeTruthy();
    expect(
      (state.details[ID - 1] as LoadingFulfilled<string>).data
    ).toStrictEqual(mockName);
  });

  it("utilizes life-cycle callbacks", () => {
    const mockOnPending = vi.fn();
    const mockOnRejected = vi.fn();
    const mockOnFulfilled = vi.fn();
    const mockAfterPending = vi.fn();
    const mockAfterRejected = vi.fn();
    const mockAfterFulfilled = vi.fn();
    const [state, _, reducer] = setup(undefined, {
      name: true,
      onPending: mockOnPending,
      onRejected: mockOnRejected,
      onFulfilled: mockOnFulfilled,
      afterPending: mockAfterPending,
      afterRejected: mockAfterRejected,
      afterFulfilled: mockAfterFulfilled,
    });
    reducer(state, makeMockAction(mockThunk.pending.toString()));
    expect(isPending(state.name)).toBeTruthy();
    expect(mockOnFulfilled).not.toHaveBeenCalled();
    expect(mockOnRejected).not.toHaveBeenCalled();
    expect(mockOnPending).toHaveBeenCalledOnce();
    expect(mockAfterFulfilled).not.toHaveBeenCalled();
    expect(mockAfterRejected).not.toHaveBeenCalled();
    expect(mockAfterPending).toHaveBeenCalledOnce();

    reducer(state, makeMockAction(mockThunk.rejected.toString()));
    expect(isRejected(state.name)).toBeTruthy();
    expect(mockOnFulfilled).not.toHaveBeenCalled();
    expect(mockOnPending).toHaveBeenCalledOnce();
    expect(mockOnRejected).toHaveBeenCalledOnce();
    expect(mockAfterFulfilled).not.toHaveBeenCalled();
    expect(mockAfterPending).toHaveBeenCalledOnce();
    expect(mockAfterRejected).toHaveBeenCalledOnce();

    reducer(state, makeMockAction(mockThunk.fulfilled.toString()));
    expect(isFulfilled(state.name)).toBeTruthy();
    expect(mockOnPending).toHaveBeenCalledOnce();
    expect(mockOnRejected).toHaveBeenCalledOnce();
    expect(mockOnFulfilled).toHaveBeenCalledOnce();
    expect(mockAfterPending).toHaveBeenCalledOnce();
    expect(mockAfterRejected).toHaveBeenCalledOnce();
    expect(mockAfterFulfilled).toHaveBeenCalledOnce();
  });
});
