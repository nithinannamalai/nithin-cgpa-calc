import { describe, expect, it } from "vitest";
import { applyMarksPatch, calcMarks, clampMark, endSemForTotal } from "@/lib/marks";

const base = { mode: "split" as const, i1: "", i2: "", tw: "", internals: "", endSem: "" };

describe("end sem marks rules", () => {
  it("total = Test1×0.3 + Test2×0.3 + Term Work + End Sem×0.6", () => {
    const r = calcMarks({ ...base, i1: "40", i2: "30", tw: "8", endSem: "70" });
    expect(r.i1).toBeCloseTo(12);
    expect(r.i2).toBeCloseTo(9);
    expect(r.internals).toBeCloseTo(29);
    expect(r.endSem).toBeCloseTo(42);
    expect(r.total).toBeCloseTo(71);
  });
  it("full marks give 100", () => {
    expect(calcMarks({ ...base, i1: "50", i2: "50", tw: "10", endSem: "100" }).total).toBeCloseTo(100);
  });
  it("total internals (/40) replaces Test 1, Test 2 and Term Work", () => {
    const r = calcMarks({ ...base, mode: "total", i1: "50", internals: "32", endSem: "50" });
    expect(r.total).toBeCloseTo(62);
  });
  it("total internals (/50) + End Sem converted to /50", () => {
    const r = calcMarks({ ...base, mode: "total50", internals50: "40", endSem: "80" });
    expect(r.endSem).toBeCloseTo(40);
    expect(r.total).toBeCloseTo(80);
  });
  it("clamps values to 0..max", () => {
    expect(clampMark("55", 50)).toBe("50");
    expect(clampMark("-3", 10)).toBe("0");
    expect(clampMark("37.5", 40)).toBe("37.5");
  });
  it("works out End Sem needed for a target total", () => {
    // internals 12 + 9 + 8 = 29 → (80 − 29) / 0.6 = 85
    expect(endSemForTotal({ ...base, i1: "40", i2: "30", tw: "8" }, 80).endSem).toBeCloseTo(85);
    // /50 mode: (70 − 30) / 0.5 = 80
    expect(endSemForTotal({ ...base, mode: "total50", internals50: "30" }, 70).endSem).toBeCloseTo(80);
  });
  it("flags a target that needs more than 100 in End Sem", () => {
    const r = endSemForTotal({ ...base, i1: "10" }, 90);
    expect(r.reachable).toBe(false);
    expect(r.endSem).toBe(100);
  });
  it("target total changes only End Sem; typing End Sem clears the target", () => {
    const s = { ...base, id: "x", name: "S", i1: "40", i2: "30", tw: "8" };
    const withTarget = applyMarksPatch(s, { target: "80" });
    expect(withTarget.endSem).toBe("85");
    expect(withTarget.i1).toBe("40");
    expect(applyMarksPatch(withTarget, { tw: "10" }).endSem).toBe("81.67");
    expect(applyMarksPatch(withTarget, { endSem: "50" }).target).toBe("");
  });
});
