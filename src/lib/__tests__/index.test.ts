import { ActionReducerMapBuilder } from "@reduxjs/toolkit";
import { describe, expect, it, vi } from "vitest";
import { addExtensions, Loading } from "..";

interface MockState {
  name: Loading<string>;
}
const mockAddCase = vi.fn();
const mockAddDefaultCase = vi.fn();
const mockAddMatcher = vi.fn();
const mockActionReducer: ActionReducerMapBuilder<MockState> = {
  addCase: mockAddCase,
  addDefaultCase: mockAddDefaultCase,
  addMatcher: mockAddMatcher,
};

describe("Add extensions", () => {
  const setup = () => {
    vi.resetAllMocks();
    return addExtensions(mockActionReducer);
  };

  it("adds the expected extensions", () => {
    const builder = setup();
    expect(builder.addLoadingMatcher).toBeDefined();
    expect(builder.addThunkMatcher).toBeDefined();
  });

  it("keeps the original methods", () => {
    const builder = setup();
    expect(builder.addCase).toBeDefined();
    expect(builder.addDefaultCase).toBeDefined();
    expect(builder.addMatcher).toBeDefined();
  });

  it("retains the original behaviour", () => {
    const builder = setup();
    builder.addCase("", (_s, _a) => undefined);
    expect(mockAddCase).toHaveBeenCalledOnce();
    builder.addDefaultCase((_s, _a) => undefined);
    expect(mockAddDefaultCase).toHaveBeenCalledOnce();
    builder.addMatcher(
      (_a) => false,
      (_s, _a) => undefined
    );
    expect(mockAddMatcher).toHaveBeenCalledOnce();
  });
});
