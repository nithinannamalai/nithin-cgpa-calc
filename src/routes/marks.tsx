import { createFileRoute } from "@tanstack/react-router";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { Shell, Stat } from "@/components/Shell";
import { MARK_LIMITS, calcMarks, clampMark, type MarkField, type MarksSubject } from "@/lib/marks";
import { useLocal, uid } from "@/lib/storage";

export const Route = createFileRoute("/marks")({
  head: () => ({
    meta: [
      { title: "CalCGPA — End Sem Marks Calculator" },
      { name: "description", content: "Enter internal tests, term work and end semester marks to get your total out of 100 for each subject." },
      { property: "og:title", content: "CalCGPA — End Sem Marks Calculator" },
      { property: "og:description", content: "Enter internal tests, term work and end semester marks to get your total out of 100 for each subject." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MarksPage,
});

const blank = (n: number): MarksSubject => ({
  id: uid(), name: `Subject ${n}`, mode: "split", i1: "", i2: "", tw: "", internals: "", endSem: "",
});

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2));

function MarksPage() {
  const [subjects, setSubjects] = useLocal<MarksSubject[]>("marks-subjects", [blank(1)]);
  const update = (id: string, patch: Partial<MarksSubject>) =>
    setSubjects(subjects.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const totals = subjects.map((s) => calcMarks(s).total);
  const avg = totals.length ? totals.reduce((a, b) => a + b, 0) / totals.length : 0;

  return (
    <Shell>
      <h1 className="font-display text-3xl font-bold sm:text-5xl">End Sem Marks</h1>
      <p className="mt-1 text-muted-foreground">Total /100 = Test 1 × 0.3 + Test 2 × 0.3 + Term Work + End Sem × 0.6</p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Stat label="Average" value={fmt(avg)} big />
        <Stat label="Subjects" value={String(subjects.length)} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button className="btn-primary" onClick={() => setSubjects([...subjects, blank(subjects.length + 1)])}>
          <Plus size={18} /> Add subject
        </button>
        <button
          className="clay-pill [--pill-bg:var(--tertiary)] [--pill-fg:var(--tertiary-foreground)]"
          onClick={() => setSubjects([blank(1)])}
        >
          <RotateCcw size={14} /> Reset all
        </button>
      </div>

      <ul className="mt-4 space-y-4">
        {subjects.length === 0 && (
          <li className="glass rounded-2xl p-8 text-center text-muted-foreground">No subjects — tap Add subject.</li>
        )}
        {subjects.map((s) => {
          const r = calcMarks(s);
          const input = (k: MarkField, label: string) => (
            <label className="block">
              <span className="mb-1 block text-xs text-muted-foreground">
                {label} <span className="opacity-70">/{MARK_LIMITS[k]}</span>
              </span>
              <input
                className="field w-full"
                type="number"
                min="0"
                max={MARK_LIMITS[k]}
                step="0.5"
                inputMode="decimal"
                placeholder={`0–${MARK_LIMITS[k]}`}
                value={s[k]}
                onChange={(e) => update(s.id, { [k]: clampMark(e.target.value, MARK_LIMITS[k]) })}
              />
            </label>
          );
          const rows: [string, number, number][] =
            s.mode === "split"
              ? [["Test 1 × 0.3", r.i1, 15], ["Test 2 × 0.3", r.i2, 15], ["Term Work", r.tw, 10], ["End Sem × 0.6", r.endSem, 60]]
              : [["Internals", r.internals, 40], ["End Sem × 0.6", r.endSem, 60]];

          return (
            <li key={s.id} className="glass animate-rise rounded-2xl p-4">
              <div className="flex items-center gap-2">
                <input
                  className="field min-w-0 flex-1 font-semibold"
                  aria-label="Subject name"
                  value={s.name}
                  onChange={(e) => update(s.id, { name: e.target.value })}
                />
                <button
                  className="btn-ghost"
                  aria-label="Reset subject"
                  title="Reset marks"
                  onClick={() => update(s.id, { i1: "", i2: "", tw: "", internals: "", endSem: "" })}
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  className="btn-ghost hover:!text-destructive"
                  aria-label="Delete subject"
                  onClick={() => setSubjects(subjects.filter((x) => x.id !== s.id))}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-1 rounded-full p-1 [background:oklch(0.1_0.04_240/30%)]">
                {([["split", "Tests & Term Work"], ["total", "Total internals /40"]] as const).map(([m, label]) => (
                  <button
                    key={m}
                    onClick={() => update(s.id, { mode: m })}
                    data-active={s.mode === m}
                    className="rounded-full px-2 py-1.5 text-xs font-semibold text-muted-foreground transition-all duration-300 data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:shadow-glow sm:text-sm"
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="mt-3 grid gap-4 md:grid-cols-[1fr_auto]">
                <div className={`grid gap-2 ${s.mode === "split" ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2"}`}>
                  {s.mode === "split" ? (
                    <>
                      {input("i1", "Internal Test 1")}
                      {input("i2", "Internal Test 2")}
                      {input("tw", "Term Work")}
                      {input("endSem", "End Semester")}
                    </>
                  ) : (
                    <>
                      {input("internals", "Total Internals")}
                      {input("endSem", "End Semester")}
                    </>
                  )}
                </div>
                <div className="flex flex-col items-center justify-center rounded-2xl px-6 py-2 text-center">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">Total</div>
                  <div className="text-gradient font-display text-5xl font-bold">{fmt(r.total)}</div>
                  <div className="text-xs text-muted-foreground">out of 100</div>
                </div>
              </div>

              <div className={`mt-3 grid gap-2 ${rows.length === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2"}`}>
                {rows.map(([label, val, max]) => (
                  <div key={label} className="rounded-xl border p-2 text-center">
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
                    <div className="font-display text-lg font-bold">
                      <span className="text-primary">{fmt(val)}</span>
                      <span className="text-sm text-muted-foreground"> / {max}</span>
                    </div>
                  </div>
                ))}
              </div>
              {s.mode === "split" && (
                <p className="mt-2 text-xs text-muted-foreground">Internals: {fmt(r.internals)} / 40</p>
              )}
            </li>
          );
        })}
      </ul>
    </Shell>
  );
}
