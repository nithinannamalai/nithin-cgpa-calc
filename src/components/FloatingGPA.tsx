import { GripVertical } from "lucide-react";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { createPortal } from "react-dom";

type Pos = { x: number; y: number };
const KEY = "gpa-float-pos";
const MARGIN = 8;

const clamp = (p: Pos, el: HTMLElement): Pos => ({
  x: Math.min(Math.max(p.x, MARGIN), window.innerWidth - el.offsetWidth - MARGIN),
  y: Math.min(Math.max(p.y, MARGIN), window.innerHeight - el.offsetHeight - MARGIN),
});

/** Small draggable live-GPA bubble. Starts bottom-right; remembers where it was dropped. */
export function FloatingGPA({ gpa, credits }: { gpa: number; credits: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  const [pos, setPos] = useState<Pos | null>(null);
  const [dragging, setDragging] = useState(false);
  const [typing, setTyping] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw && ref.current) setPos(clamp(JSON.parse(raw) as Pos, ref.current));
    } catch {}
    const onResize = () => setPos((p) => (p && ref.current ? clamp(p, ref.current) : p));
    const isField = (el: EventTarget | null) =>
      el instanceof HTMLElement && el.matches("input:not([type=checkbox]):not([type=radio]), textarea, select");
    const onIn = (e: FocusEvent) => isField(e.target) && setTyping(true);
    const onOut = () => window.setTimeout(() => setTyping(isField(document.activeElement)), 50);
    window.addEventListener("resize", onResize);
    document.addEventListener("focusin", onIn);
    document.addEventListener("focusout", onOut);
    return () => {
      window.removeEventListener("resize", onResize);
      document.removeEventListener("focusin", onIn);
      document.removeEventListener("focusout", onOut);
    };
  }, [mounted]);

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    drag.current = { dx: e.clientX - r.left, dy: e.clientY - r.top };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current || !ref.current) return;
    setPos(clamp({ x: e.clientX - drag.current.dx, y: e.clientY - drag.current.dy }, ref.current));
  };
  const onUp = () => {
    drag.current = null;
    setDragging(false);
    if (pos) localStorage.setItem(KEY, JSON.stringify(pos));
  };

  if (!mounted) return null;
  return createPortal(
    <div
      ref={ref}
      role="status"
      aria-label={`Live GPA ${gpa.toFixed(2)}`}
      title="Drag to move"
      data-dragging={dragging}
      data-typing={typing}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      style={pos ? { left: pos.x, top: pos.y } : undefined}
      className={`glass fixed z-40 flex whitespace-nowrap cursor-grab touch-none select-none items-center gap-1.5 !rounded-2xl py-2 pl-1.5 pr-3.5 transition-[opacity,transform,box-shadow] duration-300 data-[dragging=true]:scale-105 data-[dragging=true]:cursor-grabbing data-[dragging=true]:shadow-glow max-sm:data-[typing=true]:pointer-events-none max-sm:data-[typing=true]:opacity-0 ${
        pos ? "" : "bottom-28 right-4 sm:bottom-6 sm:right-6"
      }`}
    >
      <GripVertical size={16} className="shrink-0 text-muted-foreground" />
      <div className="leading-none">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">GPA</div>
        <div className="text-gradient font-display text-2xl font-bold tabular-nums sm:text-3xl">{gpa.toFixed(2)}</div>
        <div className="mt-0.5 text-[10px] text-muted-foreground">{credits} credits</div>
      </div>
    </div>,
    document.body,
  );
}
