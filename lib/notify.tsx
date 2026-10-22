"use client";

import { useSyncExternalStore } from "react";

// --- toast -----------------------------------------------------------------
type Toast = { id: number; msg: string };
let toasts: Toast[] = [];
let nextId = 1;
const subs = new Set<() => void>();

function subscribe(cb: () => void) {
  subs.add(cb);
  return () => {
    subs.delete(cb);
  };
}

export function toast(msg: string) {
  const id = nextId++;
  toasts = [...toasts, { id, msg }];
  subs.forEach((f) => f());
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    subs.forEach((f) => f());
  }, 3500);
}

export function ToastHost() {
  const list = useSyncExternalStore(subscribe, () => toasts, () => [] as Toast[]);
  return (
    <div className="sp-toasts" aria-live="polite">
      {list.map((t) => (
        <div key={t.id} className="sp-toast">{t.msg}</div>
      ))}
    </div>
  );
}

// --- confirmation chime (two short notes, no audio asset) -------------------
let audioCtx: AudioContext | null = null;

function ctx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    audioCtx = new Ctor();
  }
  return audioCtx;
}

export function beep() {
  try {
    const c = ctx();
    if (!c) return;
    if (c.state === "suspended") void c.resume();
    const t0 = c.currentTime;
    ([[880, 0, 0.1], [1174.66, 0.11, 0.14]] as const).forEach(([f, off, dur]) => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = "sine";
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t0 + off);
      g.gain.exponentialRampToValueAtTime(0.18, t0 + off + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + off + dur);
      o.connect(g);
      g.connect(c.destination);
      o.start(t0 + off);
      o.stop(t0 + off + dur + 0.05);
    });
  } catch { /* audio unavailable — silent fallback */ }
}
