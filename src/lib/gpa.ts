export const GRADES = ["O", "A+", "A", "B+", "B", "C", "U"] as const;
export type Grade = (typeof GRADES)[number];
export const GRADE_POINTS: Record<Grade, number> = { O: 10, "A+": 9, A: 8, "B+": 7, B: 6, C: 5, U: 0 };

export type Course = { id: string; name: string; credits: number; grade: Grade };

export function calcGPA(courses: Course[]) {
  const totalCredits = courses.reduce((s, c) => s + (c.credits || 0), 0);
  const totalPoints = courses.reduce((s, c) => s + (c.credits || 0) * GRADE_POINTS[c.grade], 0);
  // Any "U" grade (fail) makes the semester GPA 0.
  const hasU = courses.some((c) => c.grade === "U");
  return { totalCredits, totalPoints, gpa: totalCredits && !hasU ? totalPoints / totalCredits : 0 };
}

export type Semester = { id: string; gpa: number };
/** Simple average of semester GPAs (all semesters weighted equally). */
export function calcCGPA(sems: Semester[]) {
  if (!sems.length) return 0;
  return sems.reduce((s, x) => s + (x.gpa || 0), 0) / sems.length;
}

export type ParsedSem = { label: string; raw: string; gpa: number; valid: boolean; reason?: "over" | "nan" };
/** Parse "8.5, 9, 7.2" into Sem 1, Sem 2, ... Entries above 10 or non-numbers are flagged invalid. */
export function parseGPAList(input: string): ParsedSem[] {
  return input
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((raw, i) => {
      const gpa = Number(raw);
      const label = `Sem ${i + 1}`;
      if (!Number.isFinite(gpa) || gpa < 0) return { label, raw, gpa: 0, valid: false, reason: "nan" as const };
      if (gpa > 10) return { label, raw, gpa, valid: false, reason: "over" as const };
      return { label, raw, gpa, valid: true };
    });
}

/** GPA needed this semester so the new CGPA hits the target (equal semester weighting). */
export function requiredGPA(prevCGPA: number, target: number) {
  return 2 * target - prevCGPA;
}
