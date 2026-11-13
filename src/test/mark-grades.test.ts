import { describe, expect, it } from "vitest";
import { gradeForTotal } from "@/lib/marks";

describe("grade for final total", () => {
  it("91–100 is O", () => { expect(gradeForTotal(100)).toBe("O"); expect(gradeForTotal(91)).toBe("O"); });
  it("81–90 is A+", () => { expect(gradeForTotal(90)).toBe("A+"); expect(gradeForTotal(81)).toBe("A+"); });
  it("71–80 is A", () => { expect(gradeForTotal(80)).toBe("A"); expect(gradeForTotal(71)).toBe("A"); });
  it("61–70 is B+", () => { expect(gradeForTotal(70)).toBe("B+"); expect(gradeForTotal(61)).toBe("B+"); });
  it("56–60 is B", () => { expect(gradeForTotal(60)).toBe("B"); expect(gradeForTotal(56)).toBe("B"); });
  it("50–55 is C", () => { expect(gradeForTotal(55)).toBe("C"); expect(gradeForTotal(50)).toBe("C"); });
  it("below 50 is U", () => { expect(gradeForTotal(49.5)).toBe("U"); expect(gradeForTotal(34)).toBe("U"); expect(gradeForTotal(0)).toBe("U"); });
});

import { applyMarksPatch, calcMarks } from "@/lib/marks";
describe("target total grade", () => {
  it("target 81 gives total 81 and grade A+", () => {
    const s = applyMarksPatch({ id: "x", name: "S", mode: "split", i1: "33", i2: "27", tw: "7", internals: "", endSem: "" }, { target: "81" });
    const t = calcMarks(s).total;
    expect(t).toBe(81);
    expect(gradeForTotal(t)).toBe("A+");
  });
});
