import { describe, expect, it } from "vitest";
import { calcGPA, calcCGPA, requiredGPA, GRADE_POINTS, parseGPAList } from "@/lib/gpa";

describe("gpa rules", () => {
  it("maps grades to points", () => {
    expect(GRADE_POINTS).toEqual({ O: 10, "A+": 9, A: 8, "B+": 7, B: 6, C: 5, U: 0 });
  });
  it("GPA = sum(credits*points)/sum(credits)", () => {
    const r = calcGPA([
      { id: "1", name: "a", credits: 4, grade: "O" },
      { id: "2", name: "b", credits: 3, grade: "B" },
      { id: "3", name: "c", credits: 3, grade: "A" },
    ]);
    expect(r.totalPoints).toBe(82);
    expect(r.gpa).toBeCloseTo(8.2);
  });
  it("GPA is 0 when any course is graded U", () => {
    const r = calcGPA([
      { id: "1", name: "a", credits: 4, grade: "O" },
      { id: "2", name: "b", credits: 3, grade: "U" },
    ]);
    expect(r.gpa).toBe(0);
  });
  it("CGPA = simple average of semester GPAs", () => {
    expect(calcCGPA([{ id: "1", gpa: 8 }, { id: "2", gpa: 9 }])).toBeCloseTo(8.5);
  });
  it("parses comma-separated GPAs into Sem 1, Sem 2, ... and flags values above 10", () => {
    const r = parseGPAList("8.5, 9 ,11, abc");
    expect(r.map((s) => s.label)).toEqual(["Sem 1", "Sem 2", "Sem 3", "Sem 4"]);
    expect(r.map((s) => s.valid)).toEqual([true, true, false, false]);
    expect(r[2]?.reason).toBe("over");
    expect(r[3]?.reason).toBe("nan");
  });
  it("accepts exactly 10 as valid", () => {
    expect(parseGPAList("10")[0]?.valid).toBe(true);
  });
  it("required GPA = 2*target - previous CGPA", () => {
    expect(requiredGPA(8, 8.5)).toBeCloseTo(9);
  });
});
