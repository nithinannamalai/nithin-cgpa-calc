/** Max marks for each input on the End Sem Marks page. */
export const MARK_LIMITS = { i1: 50, i2: 50, tw: 10, internals: 40, endSem: 100 } as const;
export type MarkField = keyof typeof MARK_LIMITS;

export type MarksSubject = {
  id: string;
  name: string;
  /** "split" = enter Test 1, Test 2 and Term Work; "total" = enter total internals (/40) directly. */
  mode: "split" | "total";
  i1: string;
  i2: string;
  tw: string;
  internals: string;
  endSem: string;
};

const num = (v: string) => {
  const n = Number(v);
  return v.trim() === "" || !Number.isFinite(n) ? 0 : n;
};

/** Keep a typed value inside 0..max. Empty stays empty. */
export function clampMark(value: string, max: number): string {
  if (value.trim() === "") return "";
  const n = Number(value);
  if (!Number.isFinite(n)) return "";
  if (n < 0) return "0";
  if (n > max) return String(max);
  return value;
}

/** Total /100 = Test1×0.3 + Test2×0.3 + Term Work + End Sem×0.6 (or Total Internals + End Sem×0.6). */
export function calcMarks(s: Pick<MarksSubject, "mode" | "i1" | "i2" | "tw" | "internals" | "endSem">) {
  const i1 = Math.min(num(s.i1), MARK_LIMITS.i1) * 0.3;
  const i2 = Math.min(num(s.i2), MARK_LIMITS.i2) * 0.3;
  const tw = Math.min(num(s.tw), MARK_LIMITS.tw);
  const internals = s.mode === "total" ? Math.min(num(s.internals), MARK_LIMITS.internals) : i1 + i2 + tw;
  const endSem = Math.min(num(s.endSem), MARK_LIMITS.endSem) * 0.6;
  return { i1, i2, tw, internals, endSem, total: internals + endSem };
}
