import { describe, expect, it } from "vitest";
import { excludeReason, pickSkinImage, type RawSkin } from "../../scripts/lib/skins-filter";

const base: RawSkin = {
  uuid: "s1",
  displayName: "Reaver Vandal",
  contentTierUuid: "tier",
  displayIcon: "https://x/icon.png",
  chromas: [{ fullRender: "https://x/chroma.png" }],
  levels: [{ uuid: "l1", displayIcon: "https://x/level.png" }],
};
const none = new Set<string>();

describe("filtro de skins de pago", () => {
  it("acepta una skin de tienda", () => {
    expect(excludeReason(base, none, new Set())).toBeNull();
  });
  it("descarta skins sin tier", () => {
    expect(excludeReason({ ...base, contentTierUuid: null }, none, new Set())).toBe("noTier");
  });
  it("descarta Standard / Estándar / Random Favorite", () => {
    expect(excludeReason({ ...base, displayName: "Standard Vandal" }, none, new Set())).toBe(
      "standardOrRandom",
    );
    expect(excludeReason(base, none, new Set(), ["Estándar Vandal"])).toBe("standardOrRandom");
    expect(excludeReason({ ...base, displayName: "Random Favorite Skin" }, none, new Set())).toBe(
      "standardOrRandom",
    );
  });
  it("descarta recompensas de contratos (pase de batalla / agente / evento)", () => {
    expect(excludeReason(base, new Set(["l1"]), new Set())).toBe("contractReward");
  });
  it("descarta duplicados por uuid", () => {
    const seen = new Set<string>();
    expect(excludeReason(base, none, seen)).toBeNull();
    expect(excludeReason(base, none, seen)).toBe("duplicate");
  });
  it("elige imagen con fallback y descarta si no hay ninguna", () => {
    expect(pickSkinImage({ ...base, displayIcon: null })).toBe("https://x/chroma.png");
    expect(pickSkinImage({ ...base, displayIcon: null, chromas: [] })).toBe("https://x/level.png");
    const noImg = {
      ...base,
      displayIcon: null,
      chromas: [],
      levels: [{ uuid: "l", displayIcon: null }],
    };
    expect(excludeReason(noImg, none, new Set())).toBe("noImage");
  });
});
