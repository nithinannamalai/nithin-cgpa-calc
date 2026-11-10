import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import bg from "@/assets/lambo-bg.jpg";

const links = [
  { to: "/", label: "GPA", short: "GPA" },
  { to: "/cgpa", label: "CGPA", short: "CGPA" },
  { to: "/target", label: "Required GPA", short: "Req." },
  { to: "/marks", label: "End Sem Marks", short: "Marks" },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="fixed inset-0 -z-10">
        <img src={bg} alt="" width={1920} height={1088} className="h-full w-full scale-110 object-cover blur-xl" />
        <div className="absolute inset-0 bg-overlay" />
      </div>
      <header className="sticky top-0 z-20 px-3 pt-3 sm:px-6 sm:pt-5">
        <nav className="glass mx-auto flex max-w-4xl items-center justify-between gap-2 !rounded-full px-3 py-2 sm:px-5">
          <span className="font-display text-lg font-bold tracking-tight sm:text-xl">
            Cal<span className="text-primary">CGPA</span>
          </span>
          <div className="flex gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: true }}
                className="whitespace-nowrap rounded-full px-2 py-1.5 text-xs font-medium text-muted-foreground transition-all duration-300 hover:text-foreground sm:px-3 sm:text-sm"
                activeProps={{ className: "!text-primary-foreground bg-primary shadow-glow" }}
              >
                <span className="md:hidden">{l.short}</span>
                <span className="hidden md:inline">{l.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      </header>
      <main className="animate-rise mx-auto max-w-4xl px-3 py-6 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}

export function Stat({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return (
    <div className="glass rounded-2xl px-2 py-4 text-center">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`font-display font-bold ${big ? "text-gradient text-3xl sm:text-5xl" : "text-2xl"}`}>{value}</div>
    </div>
  );
}
