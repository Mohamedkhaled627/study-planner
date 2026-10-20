import { TaskStatusButtons } from "./TaskForm";
import { DAYS } from "@/lib/week";

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
  const fmt = (m: number) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 8 }}>
      {DAYS.map((d, w) => (
        <div key={d} style={{ border: "1px solid #ddd", padding: 8 }}>
          <b>{d}</b>
          {items
            .filter((i) => i.weekday === w)
            .map((i) => (
              <div key={`${i.taskId}-${i.startMin}`} style={{ background: "#eef", marginTop: 4, padding: 4 }}>
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
