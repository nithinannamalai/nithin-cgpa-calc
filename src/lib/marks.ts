/** Max marks for each input on the End Sem Marks page. */
export const MARK_LIMITS = { i1: 50, i2: 50, tw: 10, internals: 40, internals50: 50, endSem: 100 } as const;
export type MarkField = keyof typeof MARK_LIMITS;

/**
 * "split"   = Test 1, Test 2 and Term Work + End Sem × 0.6
 * "total"   = Total internals (/40) + End Sem × 0.6
 * "total50" = Total internals (/50) + End Sem converted to /50 (× 0.5)
 */
export type MarksMode = "split" | "total" | "total50";

export type MarksSubject = {
  id: string;
  name: string;
  mode: MarksMode;
  i1: string;
  i2: string;
  tw: string;
  internals: string;
  internals50?: string;
  endSem: string;
};

const num = (v: string | undefined) => {
  const s = (v ?? "").trim();
  const n = Number(s);
  return s === "" || !Number.isFinite(n) ? 0 : n;
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

export function calcMarks(s: Pick<MarksSubject, "mode" | "i1" | "i2" | "tw" | "internals" | "internals50" | "endSem">) {
  const i1 = Math.min(num(s.i1), MARK_LIMITS.i1) * 0.3;
  const i2 = Math.min(num(s.i2), MARK_LIMITS.i2) * 0.3;
  const tw = Math.min(num(s.tw), MARK_LIMITS.tw);
  const end = Math.min(num(s.endSem), MARK_LIMITS.endSem);
  if (s.mode === "total50") {
    const internals = Math.min(num(s.internals50), MARK_LIMITS.internals50);
    const endSem = end * 0.5;
    return { i1, i2, tw, internals, endSem, total: internals + endSem };
  }
  const internals = s.mode === "total" ? Math.min(num(s.internals), MARK_LIMITS.internals) : i1 + i2 + tw;
  const endSem = end * 0.6;
  return { i1, i2, tw, internals, endSem, total: internals + endSem };
}
