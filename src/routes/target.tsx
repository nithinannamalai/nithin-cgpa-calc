import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { requiredGPACreditWeighted, requiredGPAForSemesters } from "@/lib/gpa";
import { useLocal } from "@/lib/storage";

export const Route = createFileRoute("/target")({
  head: () => ({
    meta: [
      { title: "CalCGPA — GPA Required This Semester" },
      { name: "description", content: "Find the GPA you need this semester to reach your target CGPA — estimated by semester count or accurate by credits." },
      { property: "og:title", content: "CalCGPA — GPA Required This Semester" },
      { property: "og:description", content: "Find the GPA you need this semester to reach your target CGPA — estimated by semester count or accurate by credits." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TargetPage,
});

type Mode = "gpa" | "credits";
type Fields = { prev: string; target: string; sems: string };
type CreditFields = { prev: string; target: string; prevCredits: string; upcomingCredits: string };

const isNum = (v: string) => v.trim() !== "" && Number.isFinite(Number(v));
const gpaOk = (v: string) => isNum(v) && Number(v) >= 0 && Number(v) <= 10;

function Field({
  label,
  value,
  onChange,
  placeholder,
  min = "0",
  max = "10",
  step = "0.01",
  invalid = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  min?: string;
  max?: string;
  step?: string;
  invalid?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-muted-foreground">{label}</span>
      <input
        className="field w-full"
        type="number"
        min={min}
        max={max}
        step={step}
        inputMode="decimal"
        placeholder={placeholder}
        value={value}
        aria-label={label}
        aria-invalid={invalid || undefined}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function Result({ label, req, ready, problem, note }: { label: string; req: number; ready: boolean; problem: string | undefined; note: string }) {
  let msg = "Fill in every field to see your required GPA.";
  let tone = "text-muted-foreground";
  if (problem) {
    msg = problem;
    tone = "text-destructive";
  } else if (ready && Number.isFinite(req)) {
    if (req > 10) { msg = "Not reachable this semester — even a perfect 10 falls short."; tone = "text-destructive"; }
    else if (req <= 0) { msg = "You're already there! Any passing GPA keeps you on target."; tone = "text-success"; }
    else if (req >= 9) { msg = "Tough but possible — aim for O and A+ grades."; tone = "text-primary"; }
    else { msg = "Very doable. Stay consistent!"; tone = "text-success"; }
  }

  return (
    <div className="glass flex flex-col items-center justify-center rounded-2xl p-6 text-center sm:p-8">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div key={String(req)} className="text-gradient animate-rise font-display text-6xl font-bold sm:text-7xl">
        {ready && Number.isFinite(req) ? Math.max(0, req).toFixed(2) : "—"}
      </div>
      <p className={`mt-3 ${tone}`}>{msg}</p>
      <p className="mt-4 text-xs italic text-muted-foreground">{note}</p>
    </div>
  );
}

function TargetPage() {
  const [mode, setMode] = useLocal<Mode>("target-mode", "gpa");
  const [f, setF] = useLocal<Fields>("target-gpa-fields", { prev: "", target: "", sems: "" });
  const [cf, setCF] = useLocal<CreditFields>("target-credit-fields", { prev: "", target: "", prevCredits: "", upcomingCredits: "" });

  // Mode 1 — GPA only: target × (N + 1) − current × N
  const prevOk = gpaOk(f.prev);
  const targetOk = gpaOk(f.target);
  const semsOk = isNum(f.sems) && Number(f.sems) >= 0 && Number.isInteger(Number(f.sems));
  const gpaReady = prevOk && targetOk && semsOk;
  const gpaReq = gpaReady ? requiredGPAForSemesters(Number(f.prev), Number(f.target), Number(f.sems)) : NaN;
  const gpaProblem =
    (f.prev.trim() !== "" && !prevOk) || (f.target.trim() !== "" && !targetOk)
      ? "GPAs must be between 0 and 10."
      : f.sems.trim() !== "" && !semsOk
        ? "Semesters completed must be a whole number (0 or more)."
        : undefined;

  // Mode 2 — GPA + credits: [target × (prev + upcoming) − current × prev] / upcoming
  const cPrevOk = gpaOk(cf.prev);
  const cTargetOk = gpaOk(cf.target);
  const prevCreditsOk = isNum(cf.prevCredits) && Number(cf.prevCredits) >= 0;
  const upcomingCreditsOk = isNum(cf.upcomingCredits) && Number(cf.upcomingCredits) > 0;
  const creditReady = cPrevOk && cTargetOk && prevCreditsOk && upcomingCreditsOk;
  const creditReq = creditReady
    ? requiredGPACreditWeighted(Number(cf.prev), Number(cf.target), Number(cf.prevCredits), Number(cf.upcomingCredits))
    : NaN;
  const creditProblem =
    (cf.prev.trim() !== "" && !cPrevOk) || (cf.target.trim() !== "" && !cTargetOk)
      ? "GPAs must be between 0 and 10."
      : (cf.prevCredits.trim() !== "" && !prevCreditsOk) || (cf.upcomingCredits.trim() !== "" && !upcomingCreditsOk)
        ? "Credits completed must be 0 or more, and upcoming credits above 0."
        : undefined;

  const modeButton = (m: Mode, label: string) => (
    <button
      type="button"
      aria-pressed={mode === m}
      onClick={() => setMode(m)}
      className={`min-w-0 flex-1 rounded-xl px-2 py-2.5 text-sm font-semibold transition-all ${mode === m ? "bg-primary text-primary-foreground shadow-glow" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
    >
      {label}
    </button>
  );

  return (
    <Shell>
      <h1 className="font-display text-3xl font-bold sm:text-5xl">GPA required this sem</h1>
      <p className="mt-1 text-muted-foreground">Choose approx. calculation or an accurate credit-weighted calculation</p>

      <div className="glass animate-rise mt-6 flex items-center gap-2 rounded-2xl p-2" role="group" aria-label="Required GPA calculation mode">
        {modeButton("gpa", "GPA Only")}
        <span className="or-badge shrink-0">or</span>
        {modeButton("credits", "GPA + Credits")}
      </div>

      {mode === "gpa" ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="glass space-y-4 rounded-2xl p-5">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Current CGPA" value={f.prev} onChange={(v) => setF({ ...f, prev: v })} placeholder="e.g. 8.2" invalid={f.prev.trim() !== "" && !prevOk} />
              <Field label="Target CGPA" value={f.target} onChange={(v) => setF({ ...f, target: v })} placeholder="e.g. 8.5" invalid={f.target.trim() !== "" && !targetOk} />
            </div>
            <Field
              label="Semesters Completed (N)"
              value={f.sems}
              onChange={(v) => setF({ ...f, sems: v })}
              placeholder="e.g. 3"
              step="1"
              max="12"
              invalid={f.sems.trim() !== "" && !semsOk}
            />
            <p className="text-xs text-muted-foreground">{"\n"}</p>
          </div>
          <Result
            label="Estimated Required GPA"
            req={gpaReq}
            ready={gpaReady}
            problem={gpaProblem}
            note="Assumes equal semester weighting. Actual credit-weighted required GPA differs."
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="glass space-y-4 rounded-2xl p-5">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Current CGPA" value={cf.prev} onChange={(v) => setCF({ ...cf, prev: v })} placeholder="e.g. 8.2" invalid={cf.prev.trim() !== "" && !cPrevOk} />
              <Field label="Target CGPA" value={cf.target} onChange={(v) => setCF({ ...cf, target: v })} placeholder="e.g. 8.5" invalid={cf.target.trim() !== "" && !cTargetOk} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Total Credits Completed"
                value={cf.prevCredits}
                onChange={(v) => setCF({ ...cf, prevCredits: v })}
                placeholder="e.g. 60"
                max="500"
                step="1"
                invalid={cf.prevCredits.trim() !== "" && !prevCreditsOk}
              />
              <Field
                label="Upcoming Sem Credits"
                value={cf.upcomingCredits}
                onChange={(v) => setCF({ ...cf, upcomingCredits: v })}
                placeholder="e.g. 20"
                max="500"
                step="1"
                invalid={cf.upcomingCredits.trim() !== "" && !upcomingCreditsOk}
              />
            </div>
            <p className="text-xs text-muted-foreground">{"\"Upcoming Sem Credits are the credit points for the next semester you want to calculate.\""}</p>
          </div>
          <Result
            label="Accurate Credit-Weighted Required GPA"
            req={creditReq}
            ready={creditReady}
            problem={creditProblem}
            note="\n"
          />
        </div>
      )}
    </Shell>
  );
}
