import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { Shell, Stat } from "@/components/Shell";
import { calcCGPA, type Semester } from "@/lib/gpa";
import { useLocal, uid } from "@/lib/storage";

export const Route = createFileRoute("/cgpa")({
  head: () => ({
    meta: [
      { title: "CalCGPA — CGPA Calculator" },
      { name: "description", content: "Average your semester GPAs into an overall CGPA." },
      { property: "og:title", content: "CalCGPA — CGPA Calculator" },
      { property: "og:description", content: "Average your semester GPAs into an overall CGPA." },
    ],
  }),
  component: CgpaPage,
});

function CgpaPage() {
  const [sems, setSems] = useLocal<Semester[]>("semesters", [{ id: "s1", gpa: 0 }]);
  const set = (id: string, p: Partial<Semester>) => setSems(sems.map((s) => (s.id === id ? { ...s, ...p } : s)));

  return (
    <Shell>
      <h1 className="font-display text-3xl font-bold sm:text-5xl">Overall CGPA</h1>
      <p className="mt-1 text-muted-foreground">Enter each semester's GPA — we average them for you.</p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Stat label="CGPA" value={calcCGPA(sems).toFixed(2)} big />
        <Stat label="Semesters" value={String(sems.length)} />
      </div>
      <ul className="mt-6 space-y-3">
        {sems.map((s, i) => (
          <li key={s.id} className="glass animate-rise flex items-center gap-2 rounded-2xl p-3">
            <span className="w-14 shrink-0 font-display font-semibold text-primary">Sem {i + 1}</span>
            <input className="field min-w-0 flex-1" type="number" step="0.01" min="0" max="10" inputMode="decimal" placeholder="GPA" value={s.gpa || ""} onChange={(e) => set(s.id, { gpa: Number(e.target.value) })} />
            <button className="btn-ghost hover:!text-destructive" aria-label="Remove" onClick={() => setSems(sems.filter((x) => x.id !== s.id))}><Trash2 size={16} /></button>
          </li>
        ))}
      </ul>
      <button className="btn-primary mt-4 w-full" onClick={() => setSems([...sems, { id: uid(), gpa: 0 }])}><Plus size={18} /> Add semester</button>
    </Shell>
  );
}
