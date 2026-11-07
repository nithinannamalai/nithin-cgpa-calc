export const GRADES = ["O", "A+", "A", "B+", "B", "C", "U"] as const;
export type Grade = (typeof GRADES)[number];
export const GRADE_POINTS: Record<Grade, number> = { O: 10, "A+": 9, A: 8, "B+": 7, B: 6, C: 5, U: 0 };

export type Course = { id: string; name: string; credits: number; grade: Grade };

export function calcGPA(courses: Course[]) {
  const totalCredits = courses.reduce((s, c) => s + (c.credits || 0), 0);
  const totalPoints = courses.reduce((s, c) => s + (c.credits || 0) * GRADE_POINTS[c.grade], 0);
  return { totalCredits, totalPoints, gpa: totalCredits ? totalPoints / totalCredits : 0 };
}

export type Semester = { id: string; gpa: number };
/** Simple average of semester GPAs (all semesters weighted equally). */
export function calcCGPA(sems: Semester[]) {
  if (!sems.length) return 0;
  return sems.reduce((s, x) => s + (x.gpa || 0), 0) / sems.length;
}

/** GPA needed this semester so the new CGPA hits the target (equal semester weighting). */
export function requiredGPA(prevCGPA: number, target: number) {
  return 2 * target - prevCGPA;
}
