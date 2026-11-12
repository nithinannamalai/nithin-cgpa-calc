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
  /** Final total (/100) the student wants; when set, End Sem is worked out from it. */
  target?: string;
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

/** End Sem mark (/100) needed to reach a final total, keeping the subject's internals as they are. */
export function endSemForTotal(s: Pick<MarksSubject, "mode" | "i1" | "i2" | "tw" | "internals" | "internals50">, total: number) {
  const { internals } = calcMarks({ ...s, endSem: "" });
  const factor = s.mode === "total50" ? 0.5 : 0.6;
  const needed = (total - internals) / factor;
  const endSem = Math.round(Math.min(Math.max(needed, 0), MARK_LIMITS.endSem) * 100) / 100;
  return { needed, endSem, reachable: needed >= 0 && needed <= MARK_LIMITS.endSem };
}

/**
 * Apply an edit to a subject. Typing End Sem directly clears the target total;
 * while a target total is set, only End Sem is recalculated from it.
 */
export function applyMarksPatch(s: MarksSubject, patch: Partial<MarksSubject>): MarksSubject {
  const next = { ...s, ...patch };
  if ("endSem" in patch && !("target" in patch)) return { ...next, target: "" };
  const t = (next.target ?? "").trim();
  if (t !== "" && Number.isFinite(Number(t))) next.endSem = String(endSemForTotal(next, Number(t)).endSem);
  return next;
}

/** Grade bands for a final total /100: O 91–100, A+ 81–90, A 71–80, B+ 61–70, B 56–60, C 50–55, U below 50. */
export const MARK_GRADE_BANDS = [
  { grade: "O", min: 91 },
  { grade: "A+", min: 81 },
  { grade: "A", min: 71 },
  { grade: "B+", min: 61 },
  { grade: "B", min: 56 },
  { grade: "C", min: 50 },
  { grade: "U", min: 0 },
] as const;

export function gradeForTotal(total: number) {
  return (MARK_GRADE_BANDS.find((b) => total >= b.min) ?? MARK_GRADE_BANDS[MARK_GRADE_BANDS.length - 1]!).grade;
}
