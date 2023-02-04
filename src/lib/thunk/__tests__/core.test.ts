/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Chance } from "chance";
import { vi, expect, describe, it } from "vitest";
import { Matcher, Reducer } from "../../common";
import { makeThunkMatcher } from "../core";
import { MakeThunkMatcherOptsOrHandler } from "../options";

interface MockState {
  name?: string;
}

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
    opts?: MakeThunkMatcherOptsOrHandler<MockState, string, any>
  ): [MockState, Matcher, Reducer<MockState, string, any>] => {
    vi.resetAllMocks();
    const state = vi.mocked<MockState>({}, true);
    const [matcher, reducer] = makeThunkMatcher<MockState, string>(
      mockThunk,
      opts
    );
    return [state, matcher, reducer];
  };

  const makeMockAction = (type: string, payload: string = mockName) => {
    return {
      type,
      payload,
      meta: { arg: undefined },
      error: undefined,
    };
  };

  it("creates a matcher that is valid for the given thunk", () => {
    const [_s, matcher, _r] = setup();
    expect(matcher(mockThunk.pending as any)).toBeTruthy();
    expect(matcher(mockThunk.rejected as any)).toBeTruthy();
    expect(matcher(mockThunk.fulfilled as any)).toBeTruthy();
  });

  it("creates a reducer that respects the key option variant", () => {
    const [state, _, reducer] = setup("name");
    expect(state.name).toBeUndefined();
    reducer(state, makeMockAction(mockThunk.pending.toString()));
    expect(state.name).toBeUndefined();
    reducer(state, makeMockAction(mockThunk.rejected.toString()));
    expect(state.name).toBeUndefined();
    reducer(state, makeMockAction(mockThunk.fulfilled.toString()));
    expect(state.name).toBe(mockName);
  });

  it("creates a matcher that respects the reducer option variant", () => {
    const mockReducer = vi.fn(
      (_s: MockState, _a: PayloadAction<string>) => undefined
    );
    const [state, _, reducer] = setup(mockReducer);
    expect(state.name).toBeUndefined();
    reducer(state, makeMockAction(mockThunk.pending.toString()));
    expect(state.name).toBeUndefined();
    reducer(state, makeMockAction(mockThunk.rejected.toString()));
    expect(state.name).toBeUndefined();
    reducer(state, makeMockAction(mockThunk.fulfilled.toString()));
    expect(mockReducer).toHaveBeenCalledOnce();
  });

  it("creates a matcher that respects the field option", () => {
    const [state, _, reducer] = setup({ name: true });
    expect(state.name).toBeUndefined();
    reducer(state, makeMockAction(mockThunk.pending.toString()));
    expect(state.name).toBeUndefined();
    reducer(state, makeMockAction(mockThunk.rejected.toString()));
    expect(state.name).toBeUndefined();
    reducer(state, makeMockAction(mockThunk.fulfilled.toString()));
    expect(state.name).toBe(mockName);
  });
  it("creates a matcher that respects the field option with the transform option", () => {
    const expectedName = mockName.slice(0, 5);
    const [state, _, reducer] = setup({
      name: (name) => name.slice(0, 5),
    });
    expect(state.name).toBeUndefined();
    reducer(state, makeMockAction(mockThunk.pending.toString()));
    expect(state.name).toBeUndefined();
    reducer(state, makeMockAction(mockThunk.rejected.toString()));
    expect(state.name).toBeUndefined();
    reducer(state, makeMockAction(mockThunk.fulfilled.toString()));
    expect(state.name).toBe(expectedName);
  });
  it("creates a matcher that respects the field option with the transform option, with previous value", () => {
    const expectedName = mockName.slice(0, 5);
    const [state, _, reducer] = setup({
      name: (name, prev) => prev?.slice(0, 5) ?? name,
    });
    expect(state.name).toBeUndefined();
    reducer(state, makeMockAction(mockThunk.pending.toString()));
    expect(state.name).toBeUndefined();
    reducer(state, makeMockAction(mockThunk.rejected.toString()));
    expect(state.name).toBeUndefined();
    reducer(state, makeMockAction(mockThunk.fulfilled.toString()));
    expect(state.name).toBe(mockName);
    reducer(state, makeMockAction(mockThunk.fulfilled.toString()));
    expect(state.name).toBe(expectedName);
  });
  it("creates a matcher that respects the status callbacks passed", () => {
    const mockOnPending = vi.fn();
    const mockOnRejected = vi.fn();
    const mockOnFulfilled = vi.fn();

    const [state, _, reducer] = setup({
      onPending: mockOnPending,
      onRejected: mockOnRejected,
      onFulfilled: mockOnFulfilled,
    });
    expect(state.name).toBeUndefined();

    reducer(state, makeMockAction(mockThunk.pending.toString()));
    expect(state.name).toBeUndefined();
    expect(mockOnFulfilled).not.toHaveBeenCalled();
    expect(mockOnRejected).not.toHaveBeenCalled();
    expect(mockOnPending).toHaveBeenCalledOnce();

    reducer(state, makeMockAction(mockThunk.rejected.toString()));
    expect(state.name).toBeUndefined();
    expect(mockOnFulfilled).not.toHaveBeenCalled();
    expect(mockOnPending).toHaveBeenCalledOnce();
    expect(mockOnRejected).toHaveBeenCalledOnce();

    reducer(state, makeMockAction(mockThunk.fulfilled.toString()));
    expect(state.name).toBeUndefined();
    expect(mockOnPending).toHaveBeenCalledOnce();
    expect(mockOnRejected).toHaveBeenCalledOnce();
    expect(mockOnFulfilled).toHaveBeenCalledOnce();
  });
  it("creates reducers that support the field level life-cycle options", () => {
    const [state, _, reducer] = setup({
      name: {
        onPending: () => "mockOnPending",
        onRejected: () => "mockOnRejected",
        onFulfilled: () => "mockOnFulfilled",
      },
    });
    expect(state.name).toBeUndefined();

    reducer(state, makeMockAction(mockThunk.pending.toString()));
    expect(state.name).toBe("mockOnPending");

    reducer(state, makeMockAction(mockThunk.rejected.toString()));
    expect(state.name).toBe("mockOnRejected");

    reducer(state, makeMockAction(mockThunk.fulfilled.toString()));
    expect(state.name).toBe("mockOnFulfilled");
  });
});
