import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { Shell } from "@/components/Shell";
import { calcGPA, requiredGPA, type Course } from "@/lib/gpa";
import { useLocal } from "@/lib/storage";

export const Route = createFileRoute("/target")({
  head: () => ({
    meta: [
      { title: "GradeFlow — GPA Required This Semester" },
      { name: "description", content: "Find the GPA you need this semester to reach your target CGPA." },
      { property: "og:title", content: "GradeFlow — GPA Required This Semester" },
      { property: "og:description", content: "Find the GPA you need this semester to reach your target CGPA." },
    ],
  }),
  component: TargetPage,
});

function TargetPage() {
  const [f, setF] = useLocal("target", { prev: "", prevCredits: "", target: "", cur: "" });
  const [courses] = useLocal<Course[]>("courses", []);
  const semCredits = calcGPA(courses).totalCredits;
  useEffect(() => {
    if (!f.cur && semCredits) setF((x) => ({ ...x, cur: String(semCredits) }));
  }, [semCredits]); // eslint-disable-line react-hooks/exhaustive-deps

  const filled = [f.prev, f.prevCredits, f.target, f.cur].every((v) => v !== "");
  const req = filled ? requiredGPA(Number(f.prev), Number(f.prevCredits), Number(f.target), Number(f.cur)) : NaN;

  let msg = "Fill in all fields to see your required GPA.";
  let tone = "text-muted-foreground";
  if (!isNaN(req)) {
    if (req > 10) { msg = "Not reachable this semester — even a perfect 10 falls short."; tone = "text-destructive"; }
    else if (req <= 0) { msg = "You're already there! Any passing GPA keeps you on target."; tone = "text-success"; }
    else if (req >= 9) { msg = "Tough but possible — aim for O and A+ grades."; tone = "text-primary"; }
    else { msg = "Very doable. Stay consistent!"; tone = "text-success"; }
  }

  const field = (k: keyof typeof f, label: string, ph: string) => (
    <label className="block">
      <span className="mb-1 block text-sm text-muted-foreground">{label}</span>
      <input className="field w-full" type="number" step="0.01" min="0" inputMode="decimal" placeholder={ph} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
    </label>
  );

  return (
    <Shell>
      <h1 className="font-display text-3xl font-bold sm:text-5xl">GPA required this sem</h1>
      <p className="mt-1 text-muted-foreground">Know exactly what you need to hit your target CGPA.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="glass space-y-4 rounded-2xl p-5">
          {field("prev", "Previous CGPA", "e.g. 8.2")}
          {field("prevCredits", "Credits completed so far", "e.g. 90")}
          {field("target", "Target CGPA", "e.g. 8.5")}
          {field("cur", "Credits this semester", "e.g. 22")}
        </div>
        <div className="glass flex flex-col items-center justify-center rounded-2xl p-8 text-center">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Required GPA</div>
          <div key={String(req)} className="text-gradient animate-rise font-display text-7xl font-bold">
            {isNaN(req) ? "—" : Math.max(0, req).toFixed(2)}
          </div>
          <p className={`mt-3 ${tone}`}>{msg}</p>
        </div>
      </div>
    </Shell>
  );
}
