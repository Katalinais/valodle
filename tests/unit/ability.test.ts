import { describe, expect, it } from "vitest";
import { abilityStyle } from "@/lib/abilityDifficulty";

describe("abilityStyle", () => {
  it("empieza rotado y en gris, y se aclara con los fallos", () => {
    expect(abilityStyle(180, 0, { rotation: true, grayscale: true })).toEqual({
      rotation: 180,
      gray: 1,
    });
    expect(abilityStyle(180, 3, { rotation: true, grayscale: true })).toEqual({
      rotation: 0,
      gray: 0.4,
    });
    expect(abilityStyle(180, 5, { rotation: true, grayscale: true })).toEqual({
      rotation: 0,
      gray: 0,
    });
  });
  it("respeta los toggles", () => {
    expect(abilityStyle(270, 0, { rotation: false, grayscale: false })).toEqual({
      rotation: 0,
      gray: 0,
    });
  });
});
