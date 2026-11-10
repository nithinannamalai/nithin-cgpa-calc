import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { Shell, Stat } from "@/components/Shell";
import { calcCGPA, parseGPAList } from "@/lib/gpa";
import { useLocal } from "@/lib/storage";

export const Route = createFileRoute("/cgpa")({
  head: () => ({
    meta: [
      { title: "CalCGPA — CGPA Calculator" },
      { name: "description", content: "Type your semester GPAs separated by commas and get your overall CGPA instantly." },
      { property: "og:title", content: "CalCGPA — CGPA Calculator" },
      { property: "og:description", content: "Type your semester GPAs separated by commas and get your overall CGPA instantly." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CgpaPage,
});

function CgpaPage() {
  const [input, setInput] = useLocal<string>("cgpa-input", "");
  const sems = parseGPAList(input);
  const valid = sems.filter((s) => s.valid);
  const over = sems.filter((s) => s.reason === "over");
  const bad = sems.filter((s) => s.reason === "nan");
  const cgpa = calcCGPA(valid.map((s, i) => ({ id: String(i), gpa: s.gpa })));

  return (
    <Shell>
      <h1 className="font-display text-3xl font-bold sm:text-5xl">Overall CGPA</h1>
      <p className="mt-1 text-muted-foreground">Type your semester GPAs separated by commas to auto-categorise &amp; calculate CGPA</p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Stat label="CGPA" value={cgpa.toFixed(2)} big />
        <Stat label="Semesters" value={String(valid.length)} />
      </div>

      <label className="glass animate-rise mt-6 block rounded-2xl p-3">
        <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">Semester GPAs</span>
        <textarea
          className="field min-h-24 w-full resize-y"
          inputMode="decimal"
          placeholder="e.g. 8.5, 9.1, 7.8"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-invalid={over.length + bad.length > 0}
        />
      </label>

      {(over.length > 0 || bad.length > 0) && (
        <div role="alert" className="animate-rise mt-3 flex items-start gap-2 rounded-2xl border border-destructive/60 bg-destructive/15 p-3 text-sm text-foreground">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-destructive" />
          <div>
            {over.length > 0 && <p>GPA can't be above 10 — check {over.map((s) => `${s.label} (${s.raw})`).join(", ")}.</p>}
            {bad.length > 0 && <p>Not a valid GPA: {bad.map((s) => `${s.label} (${s.raw})`).join(", ")}.</p>}
            <p className="text-muted-foreground">These aren't counted in your CGPA.</p>
          </div>
        </div>
      )}

      {sems.length > 0 && (
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {sems.map((s) => (
            <li
              key={s.label}
              className={`glass animate-rise rounded-2xl p-3 text-center ${s.valid ? "" : "!border-destructive/70"}`}
            >
              <div className={`font-display text-sm font-semibold ${s.valid ? "text-primary" : "text-destructive"}`}>{s.label}</div>
              <div className="font-display text-2xl font-bold">{s.valid ? s.gpa.toFixed(2) : s.raw}</div>
            </li>
          ))}
        </ul>
      )}
    </Shell>
  );
}
