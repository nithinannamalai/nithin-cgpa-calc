import { describe, expect, it } from "vitest";
import { calcGPA, requiredGPA, GRADE_POINTS } from "@/lib/gpa";

describe("gpa rules", () => {
  it("maps grades to points", () => {
    expect(GRADE_POINTS).toEqual({ O: 10, "A+": 9, A: 8, "B+": 7, B: 6, C: 5, U: 0 });
  });
  it("GPA = sum(credits*points)/sum(credits)", () => {
    const r = calcGPA([
      { id: "1", name: "a", credits: 4, grade: "O" },
      { id: "2", name: "b", credits: 3, grade: "B" },
      { id: "3", name: "c", credits: 3, grade: "U" },
    ]);
    expect(r.totalPoints).toBe(58);
    expect(r.gpa).toBeCloseTo(5.8);
  });
  it("required GPA", () => {
    expect(requiredGPA(8, 60, 8.5, 20)).toBeCloseTo(10);
  });
});
