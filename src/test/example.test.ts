import { describe, it, expect } from "vitest";

describe("Basic App Tests", () => {
  it("basic test passes", () => {
    expect(true).toBe(true);
  });

  it("math operations work", () => {
    expect(1 + 1).toBe(2);
  });

  it("string operations work", () => {
    expect("SiaFlow").toContain("Sia");
  });
});
