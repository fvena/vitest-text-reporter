import { describe, expect, it } from "vitest";

describe("Utils", () => {
  it("add", async () => {
    // añadir un tiempo de espera
    await new Promise((resolve) => setTimeout(resolve, 1000));
    expect(true).toBe(true);
  });
  it("add2", async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    expect(true).toBe(true);
  });
});
