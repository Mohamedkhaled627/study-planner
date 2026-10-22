"use client";

import { TaskStatusButtons } from "./TaskForm";
import { DAYS } from "@/lib/week";
import { t, useLang } from "@/lib/i18n";

interface Item {
  taskId: string;
  weekday: number;
  startMin: number;
  endMin: number;
}

export function PlannerGrid({
  items,
  taskTitles,
  onDone,
}: {
  items: Item[];
  taskTitles: Record<string, string>;
  onDone?: () => void;
}) {
  useLang();
  const fmt = (m: number) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 8 }}>
      {DAYS.map((d, w) => (
        <div key={d} style={{ border: "1px solid #ddd", padding: 8, background: "#fff", borderRadius: 10 }}>
          <b>{t(`day.${d}`)}</b>
          {items
            .filter((i) => i.weekday === w)
            .map((i) => (
              <div key={`${i.taskId}-${i.startMin}`} style={{ background: "#eef2fb", marginTop: 4, padding: 4, borderRadius: 8 }}>
                {taskTitles[i.taskId] ?? i.taskId} <br />
                {fmt(i.startMin)}-{fmt(i.endMin)}{" "}
                <TaskStatusButtons taskId={i.taskId} status="TODO" onDone={onDone ?? (() => {})} />
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}
