import { PayloadAction } from "@reduxjs/toolkit";
import { describe, expect, it, vi } from "vitest";
import { isHandler, isField, isOptions } from "../identities";

describe("identities", () => {
  const mockReducer = vi.fn((_s: any, _a: PayloadAction<string>) => {});

  it("isHandler correctly categorizes MakeThunkMatcherOptsOrHandler", () => {
    expect(isHandler(mockReducer)).toBeTruthy();
  });
  it("isField correctly categorizes MakeThunkMatcherOptsOrHandler", () => {
    expect(isField<{ test: string }, any, any>("test")).toBeTruthy();
  });

  it("isOptions correctly categorizes MakeThunkMatcherOptsOrHandler", () => {
    isOptions({});
  });
});
