import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Check, X, Share2 } from "lucide-react";
import { Shell, Stat } from "@/components/Shell";
import { GRADES, GRADE_POINTS, calcGPA, type Course, type Grade } from "@/lib/gpa";
import { useLocal, uid } from "@/lib/storage";

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
  useEffect(() => {
    const m = window.location.hash.match(/c=([^&]+)/);
    if (!m) return;
    try {
      const list = JSON.parse(decodeURIComponent(escape(atob(decodeURIComponent(m[1]))))) as [string, number][];
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
  };
  const update = (id: string, patch: Partial<Course>) =>
    setCourses(courses.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  return (
    <Shell>
      <h1 className="font-display text-3xl font-bold sm:text-5xl">Semester GPA</h1>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <Stat label="GPA" value={gpa.toFixed(2)} big />
        <Stat label="Credits" value={String(totalCredits)} />
        <Stat label="Points" value={String(totalPoints)} />
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); add(); }}
        className="glass mt-6 flex flex-col gap-2 rounded-2xl p-3 sm:flex-row"
      >
        <input className="field flex-1" placeholder="Course name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="field sm:w-32" placeholder="Credits" type="number" min="0" step="0.5" inputMode="decimal" value={credits} onChange={(e) => setCredits(e.target.value)} />
        <button className="btn-primary" type="submit"><Plus size={18} /> Save course</button>
      </form>

      {courses.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button className="clay-pill" onClick={share}><Share2 size={14} className="inline" /> Share courses</button>
          <span className="text-sm text-muted-foreground">Quick set:</span>
          {(["O", "A+", "A"] as Grade[]).map((g) => (
            <button key={g} className="clay-pill" onClick={() => setCourses(courses.map((c) => ({ ...c, grade: g })))}>
              All {g}
            </button>
          ))}
        </div>
      )}

      <ul className="mt-4 space-y-3">
        {courses.length === 0 && (
          <li className="glass rounded-2xl p-8 text-center text-muted-foreground">No courses yet — add your first one above.</li>
        )}
        {courses.map((c) => (
          <li key={c.id} className="glass animate-rise rounded-2xl p-4">
            {editing === c.id ? (
              <div className="flex flex-col gap-2 sm:flex-row">
                <input className="field flex-1" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                <input className="field sm:w-28" type="number" min="0" step="0.5" value={draft.credits} onChange={(e) => setDraft({ ...draft, credits: e.target.value })} />
                <div className="flex gap-2">
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
    </Shell>
  );
}
