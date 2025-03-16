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
  it("add3", async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    expect(true).toBe(true);
  });
  it("add4", async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    expect(true).toBe(true);
  });
  it("add5", async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    expect(true).toBe(true);
  });
});
