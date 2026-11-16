import { describe, expect, it } from "vitest";
import { parseGiverToken, signGiverToken, verifyGiverToken } from "@/lib/tokens";

const id = "3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90";

describe("giver tokens", () => {
  it("round-trips and revokes on version bump", () => {
    const t = signGiverToken(id, 1, "secret");
    expect(parseGiverToken(t)?.giverId).toBe(id);
    expect(verifyGiverToken(t, 1, "secret")).toBe(true);
    expect(verifyGiverToken(t, 2, "secret")).toBe(false);
    expect(verifyGiverToken(t, 1, "other")).toBe(false);
  });
  it("rejects malformed tokens", () => {
    expect(parseGiverToken("nope")).toBeNull();
    expect(verifyGiverToken(`${id}.short`, 1, "secret")).toBe(false);
  });
});
