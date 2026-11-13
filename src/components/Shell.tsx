import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { BarChart3, Calculator, ClipboardList, FileText, Linkedin, Target } from "lucide-react";
import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import bg from "@/assets/lambo-bg.jpg";

const links = [
  { to: "/", label: "GPA", short: "GPA", icon: Calculator },
  { to: "/cgpa", label: "CGPA", short: "CGPA", icon: BarChart3 },
  { to: "/target", label: "Required GPA", short: "Req. GPA", icon: Target },
  { to: "/marks", label: "End Sem Marks", short: "Marks", icon: ClipboardList },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const active = links.findIndex((l) => l.to === pathname);
  const activeIndex = active >= 0 ? active : 0;

  // Fluid gliding & finger dragging state for the phone navigation bar
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [dragProgress, setDragProgress] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const navContainerRef = useRef<HTMLDivElement>(null);

  const getPositionFromClientX = (clientX: number) => {
    if (!navContainerRef.current) return { continuous: activeIndex, index: activeIndex };
    const rect = navContainerRef.current.getBoundingClientRect();
    const padding = 6; // p-1.5 = 6px
    const usableWidth = rect.width - padding * 2;
    const slotWidth = usableWidth / links.length;
    const relX = clientX - rect.left - padding;
    const continuous = Math.max(0, Math.min(links.length - 1, (relX - slotWidth / 2) / slotWidth));
    const index = Math.max(0, Math.min(links.length - 1, Math.floor(relX / slotWidth)));
    return { continuous, index };
  };

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    setIsDragging(true);
    const { continuous, index } = getPositionFromClientX(e.clientX);
    setDragProgress(continuous);
    setHoverIndex(index);
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const { continuous, index } = getPositionFromClientX(e.clientX);
    if (isDragging) {
      setDragProgress(continuous);
      setHoverIndex(Math.max(0, Math.min(links.length - 1, Math.round(continuous))));
    } else if (e.pointerType === "mouse") {
      // Hover glide across items
      setHoverIndex(index);
      setDragProgress(null);
    }
  };

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
      const targetIndex = hoverIndex ?? activeIndex;
      if (targetIndex !== activeIndex) {
        navigate({ to: links[targetIndex].to });
      }
    }
    setIsDragging(false);
    setDragProgress(null);
    setHoverIndex(null);
  };

  const handlePointerLeave = () => {
    if (!isDragging) {
      // Mouse left the nav bar -> snap back to active link
      setHoverIndex(null);
      setDragProgress(null);
    }
  };

  const handlePointerCancel = (e: PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    setIsDragging(false);
    setDragProgress(null);
    setHoverIndex(null);
  };

  // Hide the phone tab bar while typing so it never sits on top of the keyboard.
  const [typing, setTyping] = useState(false);
  useEffect(() => {
    const isField = (el: EventTarget | null) =>
      el instanceof HTMLElement && el.matches("input:not([type=checkbox]):not([type=radio]), textarea, select");
    const onIn = (e: FocusEvent) => {
      if (!isField(e.target)) return;
      setTyping(true);
      const el = e.target as HTMLElement;
      // After the keyboard opens, gently bring the field into view.
      window.setTimeout(() => el.scrollIntoView({ block: "center", behavior: "smooth" }), 300);
    };
    const onOut = () => window.setTimeout(() => setTyping(isField(document.activeElement)), 50);
    document.addEventListener("focusin", onIn);
    document.addEventListener("focusout", onOut);
    return () => {
      document.removeEventListener("focusin", onIn);
      document.removeEventListener("focusout", onOut);
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <img src={bg} alt="" width={1920} height={1088} className="h-full w-full scale-110 object-cover blur-xl transform-gpu will-change-transform" />
        <div className="absolute inset-0 bg-overlay" />
        {/* Soft ambient luminous mesh orbs */}
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-cyan-500/15 blur-3xl animate-[ambient-float_10s_ease-in-out_infinite]" />
        <div className="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-amber-500/15 blur-3xl animate-[ambient-float_12s_ease-in-out_infinite_reverse]" />
        <div className="absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-purple-500/15 blur-3xl animate-[ambient-float_14s_ease-in-out_infinite]" />
      </div>
      <header className="sticky top-0 z-20 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 sm:pt-5">
        <nav className="glass mx-auto flex max-w-4xl items-center justify-center sm:justify-between !rounded-full px-4 py-2.5 sm:px-5 sm:py-2">
          <Link to="/" className="group flex items-center gap-2 transition-transform duration-300 hover:scale-105 active:scale-95">
            <span className="font-display text-xl font-bold tracking-tight">
              Cal<span className="text-primary transition-all duration-300 group-hover:drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]">CGPA</span>
            </span>
          </Link>
          <div className="hidden sm:flex items-center gap-1 rounded-full bg-black/20 p-1 border border-white/10 backdrop-blur-md">
            {links.map((l) => {
              const Icon = l.icon;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  activeOptions={{ exact: true }}
                  className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-semibold text-muted-foreground transition-all duration-300 hover:text-foreground active:scale-95"
                  activeProps={{ className: "!text-primary-foreground bg-primary shadow-glow !shadow-amber-500/35" }}
                >
                  <Icon size={16} strokeWidth={2.2} />
                  <span className="md:hidden">{l.short}</span>
                  <span className="hidden md:inline">{l.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      <main className="animate-rise mx-auto max-w-4xl px-3 pb-32 pt-6 sm:px-6 sm:py-10">
        {children}
        <footer className="mt-10 flex justify-center">
          <a
            href="https://www.linkedin.com/in/nithin-annamalai-r-01b531381"
            target="_blank"
            rel="noopener noreferrer"
            className="glass inline-flex items-center gap-2 !rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition-all duration-300 hover:scale-105 hover:text-primary hover:border-primary/40 active:scale-95"
          >
            <Linkedin size={16} className="shrink-0 text-secondary" />
            Developer: <span className="text-primary underline decoration-primary/40 underline-offset-4">R.Nithin Annamalai</span>
          </a>
        </footer>
      </main>

      {/* Phone: HiOS sliding glass tab bar with liquid spring thumb & underglow */}
      <nav
        aria-label="Sections"
        data-hidden={typing}
        className="fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(0.9rem,env(safe-area-inset-bottom))] transition-all duration-300 ease-out data-[hidden=true]:pointer-events-none data-[hidden=true]:translate-y-[140%] data-[hidden=true]:opacity-0 sm:hidden"
      >
        <div
          ref={navContainerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          onPointerCancel={handlePointerCancel}
          className="ios-tabbar relative mx-auto grid max-w-md grid-cols-4 p-1.5 shadow-2xl touch-none select-none cursor-pointer"
        >
          {active >= 0 && (
            <span
              aria-hidden
              className="ios-tab-thumb pointer-events-none absolute inset-y-1.5 left-1.5 w-[calc((100%-0.75rem)/4)] overflow-visible will-change-transform"
              style={{
                transform: `translateX(${(dragProgress !== null ? dragProgress : (hoverIndex !== null ? hoverIndex : activeIndex)) * 100}%)`,
                transition: isDragging
                  ? "transform 0.04s ease-out"
                  : "transform 0.42s cubic-bezier(0.34, 1.35, 0.4, 1)",
              }}
            >
              {/* Warm HiOS amber light leak underglow matching reference photo */}
              <span className="absolute -bottom-1.5 left-1/2 h-3 w-4/5 -translate-x-1/2 rounded-full bg-amber-400/50 blur-sm pointer-events-none" />
            </span>
          )}
          {links.map((l, idx) => {
            const Icon = l.icon;
            const isTarget = idx === (hoverIndex !== null ? hoverIndex : activeIndex);
            return (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: true }}
                className={`group relative z-10 flex flex-col items-center justify-center gap-0.5 rounded-full py-1.5 text-[11px] font-semibold transition-all duration-300 active:scale-90 ${
                  isTarget
                    ? "!text-primary !font-bold drop-shadow-[0_2px_10px_rgba(245,158,11,0.55)] scale-105"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon size={20} strokeWidth={2.3} className="transition-transform duration-300 group-active:scale-90" />
                <span className="tracking-tight">{l.short}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export function Stat({
  label,
  value,
  big,
}: {
  label: string;
  value: string;
  big?: boolean;
}) {
  const isGpa = big || label.toLowerCase().includes("gpa");

  return (
    <div className="glass flex min-h-[96px] sm:min-h-[114px] flex-col items-center justify-center !rounded-[2rem] px-3 py-4 text-center transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:shadow-xl">
      <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-muted-foreground/90">{label}</div>
      <div
        className={`mt-0.5 font-display font-extrabold ${
          isGpa
            ? "text-3xl sm:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-green-400 drop-shadow-[0_2px_14px_rgba(52,211,153,0.35)]"
            : "text-2xl sm:text-4xl text-foreground"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

export function GuidanceLink() {
  return (
    <a
      href="/calculation-guidance.pdf"
      target="_blank"
      rel="noopener noreferrer"
      title="View Calculation Guidance PDF with formulas and rules"
      className="glass group inline-flex items-center gap-1.5 !rounded-full px-3.5 py-1.5 text-xs font-semibold text-muted-foreground transition-all duration-300 hover:scale-105 hover:text-primary hover:border-primary/40 active:scale-95"
    >
      <FileText size={14} className="text-primary shrink-0 transition-transform duration-300 group-hover:rotate-6" />
      <span>Calculation Guidance</span>
    </a>
  );
}
