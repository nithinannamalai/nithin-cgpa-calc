import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Plus, Trash2 } from "lucide-react";
import { Shell, Stat } from "@/components/Shell";
import { calcCGPA, calcCreditWeightedCGPA, parseGPAList } from "@/lib/gpa";
import { uid, useLocal } from "@/lib/storage";

export const Route = createFileRoute("/cgpa")({
  head: () => ({
    meta: [
      { title: "CalCGPA — CGPA Calculator" },
      { name: "description", content: "Calculate an estimated CGPA from semester GPAs or an accurate credit-weighted CGPA." },
      { property: "og:title", content: "CalCGPA — CGPA Calculator" },
      { property: "og:description", content: "Calculate an estimated CGPA from semester GPAs or an accurate credit-weighted CGPA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CgpaPage,
});

type Mode = "gpa" | "credits";
type CreditEntry = { id: string; gpa: string; credits: string };

const emptyCreditEntry = (): CreditEntry => ({ id: uid(), gpa: "", credits: "" });

function CgpaPage() {
  const [mode, setMode] = useLocal<Mode>("cgpa-mode", "gpa");
  const [input, setInput] = useLocal<string>("cgpa-input", "");
  const [creditEntries, setCreditEntries] = useLocal<CreditEntry[]>("cgpa-credit-entries", [emptyCreditEntry()]);

  const sems = parseGPAList(input);
  const valid = sems.filter((s) => s.valid);
  const over = sems.filter((s) => s.reason === "over");
  const bad = sems.filter((s) => s.reason === "nan");
  const estimatedCGPA = calcCGPA(valid.map((s, i) => ({ id: String(i), gpa: s.gpa })));

  const parsedCreditEntries = creditEntries.map((entry, index) => {
    const gpa = Number(entry.gpa);
    const credits = Number(entry.credits);
    const hasInput = entry.gpa.trim() !== "" || entry.credits.trim() !== "";
    const gpaValid = entry.gpa.trim() !== "" && Number.isFinite(gpa) && gpa >= 0 && gpa <= 10;
    const creditsValid = entry.credits.trim() !== "" && Number.isFinite(credits) && credits > 0;
    return { ...entry, label: `Sem ${index + 1}`, gpa, credits, hasInput, valid: gpaValid && creditsValid, gpaValid, creditsValid };
  });
  const validCreditEntries = parsedCreditEntries.filter((entry) => entry.valid);
  const invalidCreditEntries = parsedCreditEntries.filter((entry) => entry.hasInput && !entry.valid);
  const weighted = calcCreditWeightedCGPA(validCreditEntries);

  const updateCreditEntry = (id: string, field: "gpa" | "credits", value: string) => {
    setCreditEntries((entries) => entries.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry)));
  };

  return (
    <Shell>
      <h1 className="font-display text-3xl font-bold sm:text-5xl">Overall CGPA</h1>
      <p className="mt-1 text-muted-foreground">Choose approx. or an accurate credit-weighted calculation</p>

      <div className="glass animate-rise mt-6 flex items-center gap-2 rounded-2xl p-2" role="group" aria-label="CGPA calculation mode">
        <button
          type="button"
          aria-pressed={mode === "gpa"}
          onClick={() => setMode("gpa")}
          className={`min-w-0 flex-1 rounded-xl px-2 py-2.5 text-sm font-semibold transition-all ${mode === "gpa" ? "bg-primary text-primary-foreground shadow-glow" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
        >
          GPA Only
        </button>
        <span className="or-badge shrink-0">or</span>
        <button
          type="button"
          aria-pressed={mode === "credits"}
          onClick={() => setMode("credits")}
          className={`min-w-0 flex-1 rounded-xl px-2 py-2.5 text-sm font-semibold transition-all ${mode === "credits" ? "bg-primary text-primary-foreground shadow-glow" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
        >
          Credit-Weighted
        </button>
      </div>

      {mode === "gpa" ? (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Stat label="Estimated CGPA" value={estimatedCGPA.toFixed(2)} big />
            <Stat label="Semesters" value={String(valid.length)} />
          </div>
          <p className="mt-3 text-xs italic text-muted-foreground">Assumes equal semester weighting. Actual credit-weighted CGPA differs.</p>

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
                <li key={s.label} className={`glass animate-rise rounded-2xl p-3 text-center ${s.valid ? "" : "!border-destructive/70"}`}>
                  <div className={`font-display text-sm font-semibold ${s.valid ? "text-primary" : "text-destructive"}`}>{s.label}</div>
                  <div className="font-display text-2xl font-bold">{s.valid ? s.gpa.toFixed(2) : s.raw}</div>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Stat label="Credit-Weighted CGPA" value={weighted.cgpa.toFixed(2)} big />
            <Stat label="Total Credits" value={String(weighted.totalCredits)} />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">*Incomplete or invalid rows aren't counted.</p>

          <div className="mt-6 space-y-3">
            {creditEntries.map((entry, index) => {
              const parsed = parsedCreditEntries[index];
              return (
                <div key={entry.id} className="glass animate-rise rounded-2xl p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-display text-sm font-semibold text-primary">Sem {index + 1}</span>
                    <button
                      type="button"
                      className="btn-ghost"
                      aria-label={`Remove semester ${index + 1}`}
                      onClick={() => setCreditEntries((entries) => entries.filter((item) => item.id !== entry.id))}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <label>
                      <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">GPA / 10</span>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.01"
                        inputMode="decimal"
                        className="field w-full"
                        placeholder="8.5"
                        value={entry.gpa}
                        aria-label={`Semester ${index + 1} GPA`}
                        aria-invalid={parsed?.hasInput && !parsed.gpaValid}
                        onChange={(e) => updateCreditEntry(entry.id, "gpa", e.target.value)}
                      />
                    </label>
                    <label>
                      <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">Credits</span>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        inputMode="decimal"
                        className="field w-full"
                        placeholder="20"
                        value={entry.credits}
                        aria-label={`Semester ${index + 1} credits`}
                        aria-invalid={parsed?.hasInput && !parsed.creditsValid}
                        onChange={(e) => updateCreditEntry(entry.id, "credits", e.target.value)}
                      />
                    </label>
                  </div>
                </div>
              );
            })}
          </div>

          {invalidCreditEntries.length > 0 && (
            <div role="alert" className="animate-rise mt-3 flex items-start gap-2 rounded-2xl border border-destructive/60 bg-destructive/15 p-3 text-sm text-foreground">
              <AlertTriangle size={18} className="mt-0.5 shrink-0 text-destructive" />
              <p>Enter a GPA from 0–10 and credits above 0 for {invalidCreditEntries.map((entry) => entry.label).join(", ")}.</p>
            </div>
          )}

          <button type="button" className="clay-pill mt-4" onClick={() => setCreditEntries((entries) => [...entries, emptyCreditEntry()])}>
            <Plus size={17} /> Add semester
          </button>
        </>
      )}
    </Shell>
  );
}
