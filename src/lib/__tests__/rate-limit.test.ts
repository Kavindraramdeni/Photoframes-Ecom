import { describe, it, expect } from "vitest";
import { rateLimit } from "@/lib/rate-limit";

describe("rateLimit", () => {
  it("allows requests under the limit", () => {
    const key = `test-${Math.random()}`;
    const first = rateLimit(key, 3, 60_000);
    const second = rateLimit(key, 3, 60_000);
    expect(first.success).toBe(true);
    expect(second.success).toBe(true);
    expect(second.remaining).toBe(1);
  });

  it("blocks requests once the limit is hit", () => {
    const key = `test-${Math.random()}`;
    rateLimit(key, 2, 60_000);
    rateLimit(key, 2, 60_000);
    const third = rateLimit(key, 2, 60_000);
    expect(third.success).toBe(false);
    expect(third.remaining).toBe(0);
  });

  it("tracks separate keys independently", () => {
    const keyA = `test-a-${Math.random()}`;
    const keyB = `test-b-${Math.random()}`;
    rateLimit(keyA, 1, 60_000);
    const blockedA = rateLimit(keyA, 1, 60_000);
    const allowedB = rateLimit(keyB, 1, 60_000);
    expect(blockedA.success).toBe(false);
    expect(allowedB.success).toBe(true);
  });

  it("resets after the window expires", async () => {
    const key = `test-${Math.random()}`;
    rateLimit(key, 1, 10); // 10ms window
    const blocked = rateLimit(key, 1, 10);
    expect(blocked.success).toBe(false);
    await new Promise((resolve) => setTimeout(resolve, 20));
    const afterReset = rateLimit(key, 1, 10);
    expect(afterReset.success).toBe(true);
  });
});
