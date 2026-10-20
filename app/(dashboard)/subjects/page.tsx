"use client";

import { useEffect, useState } from "react";
import { useRequireUser } from "@/lib/useRequireUser";
import { availabilityRepo, subjectRepo, taskRepo, type SubjectDoc, type TaskDoc } from "@/lib/repos";
import { TaskForm } from "@/components/TaskForm";
import SubjectForm from "@/components/SubjectForm";
import Link from "next/link";

export default function SubjectsPage() {
  const user = useRequireUser();
  const [subjects, setSubjects] = useState<SubjectDoc[]>([]);
  const [tasks, setTasks] = useState<TaskDoc[]>([]);
  const [tick, setTick] = useState(0);
  const reload = () => setTick((t) => t + 1);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const ss = await subjectRepo.list(user.uid);
      setSubjects(ss);
      setTasks(await taskRepo.list(user.uid));
    })();
  }, [user, tick]);

  if (!user) return <p style={{ padding: 32 }}>Loading…</p>;
  const counts = new Map<string, number>();
  for (const t of tasks) counts.set(t.subjectId, (counts.get(t.subjectId) ?? 0) + 1);

  return (
    <main style={{ padding: 32 }}>
      <h1>Subjects</h1>
      <ul>
        {subjects.map((x) => (
          <li key={x.id}>
            {x.name} ({counts.get(x.id) ?? 0} tasks){x.examDate ? ` — exam ${x.examDate.slice(0, 10)}` : ""}
          </li>
        ))}
      </ul>
      <SubjectForm uid={user.uid} onDone={reload} />
      <h2>Tasks</h2>
      <TaskForm subjects={subjects} uid={user.uid} onDone={reload} />
      <h3>Your tasks</h3>
      <ul>
        {tasks.map((t) => (
          <li key={t.id}>
            {t.title} · {t.priority} · {t.status} · {t.estimatedMin}min
            {t.deadline ? ` · due ${t.deadline.slice(0, 10)}` : ""}
          </li>
        ))}
      </ul>
      <p><Link href="/planner">← Planner</Link></p>
    </main>
  );
}
