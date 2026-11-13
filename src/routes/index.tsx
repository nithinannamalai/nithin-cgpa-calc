import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type KeyboardEvent, type RefObject } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Check, X, Share2, GraduationCap } from "lucide-react";
import { Shell, Stat } from "@/components/Shell";
import { FloatingGPA } from "@/components/FloatingGPA";
import { GRADES, GRADE_POINTS, calcGPA, type Course, type Grade } from "@/lib/gpa";
import { useLocal, uid } from "@/lib/storage";

const SEM3: [string, number][] = [
  ["DSA", 3], ["DCMT LAB", 1], ["DCMT Theory", 3], ["AI Tools", 2], ["PCB Design", 2],
  ["Finance", 2], ["Maths", 2], ["EMFT", 3], ["DLC", 3], ["German/Japanese", 2],
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CalCGPA — GPA Calculator" },
      { name: "description", content: "Add your courses, credits and grades to calculate your semester GPA instantly." },
      { property: "og:title", content: "CalCGPA — GPA Calculator" },
      { property: "og:description", content: "Add your courses, credits and grades to calculate your semester GPA instantly." },
    ],
  }),
  component: GpaPage,
});

function GpaPage() {
  const [courses, setCourses] = useLocal<Course[]>("courses", []);
  const [name, setName] = useState("");
  const [credits, setCredits] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState({ name: "", credits: "" });
  const nameRef = useRef<HTMLInputElement>(null);
  const creditsRef = useRef<HTMLInputElement>(null);
  const draftCreditsRef = useRef<HTMLInputElement>(null);
  // Phone keyboard "next" arrow sends Enter: move focus to the next box instead of submitting.
  const nextOnEnter = (next: RefObject<HTMLInputElement | null>) => (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    next.current?.focus();
  };
  useEffect(() => {
    const m = window.location.hash.match(/c=([^&]+)/);
    if (!m) return;
    try {
      const list = JSON.parse(decodeURIComponent(escape(atob(decodeURIComponent(m[1] ?? ""))))) as [string, number][];
      setCourses(list.map(([n, cr]) => ({ id: uid(), name: n, credits: cr, grade: "O" as Grade })));
    } catch {}
  }, []);
  const share = async () => {
    const data = btoa(unescape(encodeURIComponent(JSON.stringify(courses.map((c) => [c.name, c.credits])))));
    const url = `${window.location.origin}/#c=${encodeURIComponent(data)}`;
    try { await navigator.clipboard.writeText(url); toast.success("Share link copied!"); } catch { window.prompt("Copy this link:", url); }
  };
  const { gpa, totalCredits, totalPoints } = calcGPA(courses);

  const add = () => {
    const c = Number(credits);
    if (!name.trim() || !(c > 0)) return;
    setCourses([...courses, { id: uid(), name: name.trim(), credits: c, grade: "O" }]);
    setName("");
    setCredits("");
    nameRef.current?.focus();
  };
  const update = (id: string, patch: Partial<Course>) =>
    setCourses(courses.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  return (
    <Shell>
      <h1 className="font-display text-3xl font-bold sm:text-5xl">Semester GPA</h1>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="GPA" value={gpa.toFixed(2)} big />
        <Stat label="Courses" value={String(courses.length)} />
        <Stat label="Credits" value={String(totalCredits)} />
        <Stat label="Points" value={String(totalPoints)} />
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); add(); }}
        className="glass mt-6 grid grid-cols-[minmax(0,1fr)_5rem_auto] gap-2 rounded-2xl p-3 sm:flex sm:flex-row"
      >
        <input ref={nameRef} className="field min-w-0 sm:flex-1" placeholder="Course name" enterKeyHint="next" autoComplete="off" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={nextOnEnter(creditsRef)} />
        <input ref={creditsRef} className="field min-w-0 max-sm:!px-2.5 sm:w-32" placeholder="Credits" type="number" min="0" step="0.5" inputMode="decimal" enterKeyHint="done" value={credits} onChange={(e) => setCredits(e.target.value)} />
        <button className="btn-primary max-sm:!px-3" type="submit" aria-label="Save course"><Plus size={18} /> <span className="sm:hidden">Save</span><span className="hidden sm:inline">Save course</span></button>
      </form>

      <button
        className="clay-pill mt-3"
        onClick={() => {
          setCourses(SEM3.map(([n, cr]) => ({ id: uid(), name: n, credits: cr, grade: "O" as Grade })));
          toast.success("Sem 3 courses loaded!");
        }}
      >
        <GraduationCap size={14} className="inline" /> Sem 3
      </button>

      {courses.length > 0 && (
        <div className="mt-4 flex flex-nowrap items-center gap-1.5 sm:gap-2">
          <span className="shrink-0 text-xs text-muted-foreground sm:text-sm">Quick set:</span>
          {(["O", "A+", "A"] as Grade[]).map((g) => (
            <button key={g} className="clay-pill shrink-0 whitespace-nowrap max-sm:!px-2.5 max-sm:!text-xs" onClick={() => setCourses(courses.map((c) => ({ ...c, grade: g })))}>
              All {g}
            </button>
          ))}
          <select
            className="clay-pill min-w-0 cursor-pointer outline-none max-sm:!px-2.5 max-sm:!text-xs [--pill-bg:var(--tertiary)] [--pill-fg:var(--tertiary-foreground)]"
            aria-label="Sort by"
            defaultValue=""
            onChange={(e) => {
              const v = e.target.value;
              if (v === "high") setCourses([...courses].sort((a, b) => b.credits - a.credits));
              if (v === "low") setCourses([...courses].sort((a, b) => a.credits - b.credits));
              e.target.value = "";
            }}
          >
            <option value="" disabled className="bg-popover text-popover-foreground">Sort by…</option>
            <option value="high" className="bg-popover text-popover-foreground">Highest credit course</option>
            <option value="low" className="bg-popover text-popover-foreground">Lowest credit course</option>
          </select>
        </div>
      )}

      <ul className="mt-4 space-y-3">
        {courses.length === 0 && (
          <li className="glass rounded-2xl p-8 text-center text-muted-foreground">No courses yet — add your first one above.</li>
        )}
        {courses.map((c) => (
          <li key={c.id} className="glass animate-rise rounded-2xl p-4">
            {editing === c.id ? (
              <div className="grid grid-cols-[minmax(0,1fr)_5.5rem] gap-2 sm:flex sm:flex-row">
                <input className="field min-w-0 sm:flex-1" aria-label="Course name" enterKeyHint="next" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} onKeyDown={nextOnEnter(draftCreditsRef)} />
                <input ref={draftCreditsRef} className="field min-w-0 sm:w-28" aria-label="Credits" enterKeyHint="done" type="number" min="0" step="0.5" inputMode="decimal" value={draft.credits} onChange={(e) => setDraft({ ...draft, credits: e.target.value })} />
                <div className="col-span-2 flex gap-2">
                  <button className="btn-primary flex-1" onClick={() => {
                    const cr = Number(draft.credits);
                    if (draft.name.trim() && cr > 0) update(c.id, { name: draft.name.trim(), credits: cr });
                    setEditing(null);
                  }}><Check size={18} /> Save</button>
                  <button className="btn-ghost" onClick={() => setEditing(null)} aria-label="Cancel"><X size={18} /></button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{c.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {c.credits} credits × {GRADE_POINTS[c.grade]} = <span className="text-primary">{c.credits * GRADE_POINTS[c.grade]}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button className="btn-ghost" aria-label="Edit" onClick={() => { setEditing(c.id); setDraft({ name: c.name, credits: String(c.credits) }); }}><Pencil size={16} /></button>
                    <button className="btn-ghost hover:!text-destructive" aria-label="Remove" onClick={() => setCourses(courses.filter((x) => x.id !== c.id))}><Trash2 size={16} /></button>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-7 gap-1">
                  {GRADES.map((g: Grade) => (
                    <button key={g} onClick={() => update(c.id, { grade: g })} data-active={c.grade === g} className="grade-chip">{g}</button>
                  ))}
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
      <FloatingGPA gpa={gpa} credits={totalCredits} />
    </Shell>
  );
}
