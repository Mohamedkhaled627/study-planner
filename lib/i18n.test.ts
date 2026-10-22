import { describe, expect, it } from "vitest";
import { DICT, t } from "./i18n";

describe("i18n dictionary", () => {
  it("has both languages for every key", () => {
    for (const [key, row] of Object.entries(DICT)) {
      expect(typeof row.en, `${key}.en`).toBe("string");
      expect(row.en.length, `${key}.en`).toBeGreaterThan(0);
      expect(typeof row.ar, `${key}.ar`).toBe("string");
      expect(row.ar.length, `${key}.ar`).toBeGreaterThan(0);
    }
  });

  it("falls back to the key itself when missing", () => {
    expect(t("no.such.key")).toBe("no.such.key");
  });

  it("interpolates variables", () => {
    expect(t("home.t2")).toBeTruthy(); // any known key renders
    expect(t("planner.todo", { n: 3 })).toMatch(/3/);
  });
});
