import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart3, Calculator, ClipboardList, Target } from "lucide-react";
import type { ReactNode } from "react";
import bg from "@/assets/lambo-bg.jpg";

const links = [
  { to: "/", label: "GPA", short: "GPA", icon: Calculator },
  { to: "/cgpa", label: "CGPA", short: "CGPA", icon: BarChart3 },
  { to: "/target", label: "Required GPA", short: "Req. GPA", icon: Target },
  { to: "/marks", label: "End Sem Marks", short: "Marks", icon: ClipboardList },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const active = links.findIndex((l) => l.to === pathname);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="fixed inset-0 -z-10">
        <img src={bg} alt="" width={1920} height={1088} className="h-full w-full scale-110 object-cover blur-xl" />
        <div className="absolute inset-0 bg-overlay" />
      </div>
      <header className="sticky top-0 z-20 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 sm:pt-5">
        <nav className="glass mx-auto flex max-w-4xl items-center justify-center gap-2 !rounded-full px-3 py-2.5 sm:justify-between sm:px-5 sm:py-2">
          <span className="font-display text-xl font-bold tracking-tight">
            Cal<span className="text-primary">CGPA</span>
          </span>
          <div className="hidden gap-1 sm:flex">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: true }}
                className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-all duration-300 hover:text-foreground"
                activeProps={{ className: "!text-primary-foreground bg-primary shadow-glow" }}
              >
                <span className="md:hidden">{l.short}</span>
                <span className="hidden md:inline">{l.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      </header>

      <main className="animate-rise mx-auto max-w-4xl px-3 pb-32 pt-6 sm:px-6 sm:py-10">{children}</main>

      {/* Phone: iOS-style glass tab bar with sliding thumb */}
      <nav
        aria-label="Sections"
        className="fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(0.9rem,env(safe-area-inset-bottom))] sm:hidden"
      >
        <div className="ios-tabbar relative mx-auto grid max-w-md grid-cols-4 p-1.5">
          {active >= 0 && (
            <span
              aria-hidden
              className="ios-tab-thumb absolute inset-y-1.5 left-1.5 w-[calc((100%-0.75rem)/4)]"
              style={{ transform: `translateX(${active * 100}%)` }}
            />
          )}
          {links.map((l) => {
            const Icon = l.icon;
            return (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: true }}
                className="relative z-10 flex flex-col items-center gap-0.5 rounded-full py-1.5 text-[11px] font-semibold text-muted-foreground transition-colors duration-300 active:scale-95"
                activeProps={{ className: "!text-primary" }}
              >
                <Icon size={20} strokeWidth={2.2} />
                {l.short}
              </Link>
            );
          })}
        </div>
      </nav>
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
