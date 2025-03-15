import { describe, expect, it } from "vitest";
import { add } from "../src/utils";

describe("Utils", () => {
  it("add", () => {
    expect(add(1, 2)).toBe(3);
  });
});
