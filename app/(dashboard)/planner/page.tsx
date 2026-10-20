"use client";

import { useEffect, useState } from "react";
import { useRequireUser } from "@/lib/useRequireUser";
import { getCurrentWeek, generateWeek } from "@/lib/services";
import { availabilityRepo, taskRepo, type TaskDoc } from "@/lib/repos";
import { mondayOf, weekKey } from "@/lib/week";
import { PlannerGrid } from "@/components/PlannerGrid";
import { TaskStatusButtons } from "@/components/TaskForm";
import Link from "next/link";

type Item = { taskId: string; weekday: number; startMin: number; endMin: number };

export default function PlannerPage() {
  const user = useRequireUser();
  const [tasks, setTasks] = useState<TaskDoc[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [warn, setWarn] = useState("");
  const [tick, setTick] = useState(0);
  const reload = () => setTick((t) => t + 1);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const key = weekKey(mondayOf(new Date()));
      const [ts, plan, avail] = await Promise.all([
        taskRepo.list(user.uid),
        getCurrentWeek(user.uid, key),
        availabilityRepo.list(user.uid),
      ]);
      setTasks(ts);
      setItems(plan?.items ?? []);

      const todo = ts.filter((t) => t.status === "TODO");
      const scheduled = (id: string) =>
        (plan?.items ?? [])
          .filter((i) => i.taskId === id)
          .reduce((s, i) => s + (i.endMin - i.startMin), 0);
      const supply = avail.reduce((h, a) => h + (a.endMin - a.startMin), 0) / 60;
      const demand = todo.reduce((h, t) => h + t.estimatedMin, 0) / 60;
      const short = todo
        .map((t) => ({ title: t.title, short: t.estimatedMin - scheduled(t.id) }))
        .filter((x) => x.short > 0);
      setWarn(
        demand > supply && short.length > 0
          ? `${supply.toFixed(1)}h available, ${demand.toFixed(1)}h demanded — ${short
              .map((x) => `${x.title} (${(x.short / 60).toFixed(1)}h unscheduled)`)
              .join(", ")}`
          : ""
      );
    })();
  }, [user, tick]);

  if (!user) return <p style={{ padding: 32 }}>Loading…</p>;
  const todoTasks = tasks.filter((t) => t.status !== "SKIPPED");

  return (
    <main style={{ padding: 32 }}>
      <h1>Planner</h1>
      <button
        onClick={async () => {
          await generateWeek(user.uid, weekKey(mondayOf(new Date())));
          reload();
        }}
      >
        Generate week
      </button>
      {warn && <p style={{ color: "orange" }}>{warn}</p>}
      <h2>TODO ({todoTasks.length})</h2>
      <ul>
        {todoTasks.map((t) => (
          <li key={t.id}>
            {t.title} · {t.status} <TaskStatusButtons taskId={t.id} status={t.status} onDone={reload} />
          </li>
        ))}
      </ul>
      <h2>Week of {weekKey(mondayOf(new Date()))}</h2>
      {items.length === 0 ? (
        <p>No plan yet — click Generate.</p>
      ) : (
        <PlannerGrid
          items={items}
          taskTitles={Object.fromEntries(tasks.map((t) => [t.id, t.title]))}
          onDone={reload}
        />
      )}
      <p>
        <Link href="/subjects">Subjects</Link> ·
<Link href="/resources">Resources</Link> ·
<Link href="/availability">Availability</Link>
      </p>
    </main>
  );
}
