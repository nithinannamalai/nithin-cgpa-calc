export const GRADES = ["O", "A+", "A", "B+", "B", "C", "U"] as const;
export type Grade = (typeof GRADES)[number];
export const GRADE_POINTS: Record<Grade, number> = { O: 10, "A+": 9, A: 8, "B+": 7, B: 6, C: 5, U: 0 };

export type Course = { id: string; name: string; credits: number; grade: Grade };

export function calcGPA(courses: Course[]) {
  const totalCredits = courses.reduce((s, c) => s + (c.credits || 0), 0);
  const totalPoints = courses.reduce((s, c) => s + (c.credits || 0) * GRADE_POINTS[c.grade], 0);
  return { totalCredits, totalPoints, gpa: totalCredits ? totalPoints / totalCredits : 0 };
}

export type Semester = { id: string; gpa: number; credits: number };
export function calcCGPA(sems: Semester[]) {
  const cr = sems.reduce((s, x) => s + (x.credits || 0), 0);
  const pts = sems.reduce((s, x) => s + (x.credits || 0) * (x.gpa || 0), 0);
  return cr ? pts / cr : 0;
}

/** GPA needed this semester so the new CGPA hits the target. */
export function requiredGPA(prevCGPA: number, prevCredits: number, target: number, curCredits: number) {
  if (curCredits <= 0) return NaN;
  return (target * (prevCredits + curCredits) - prevCGPA * prevCredits) / curCredits;
}
