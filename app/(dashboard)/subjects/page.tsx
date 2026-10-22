"use client";

import { useEffect, useState } from "react";
import { useRequireUser } from "@/lib/useRequireUser";
import { useLang, t } from "@/lib/i18n";
import { availabilityRepo, subjectRepo, taskRepo, type SubjectDoc, type TaskDoc } from "@/lib/repos";
import { TaskForm } from "@/components/TaskForm";
import SubjectForm from "@/components/SubjectForm";
import Link from "next/link";

export default function SubjectsPage() {
  const user = useRequireUser();
  useLang();
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

  if (!user) return <p style={{ padding: 32 }}>{t("loading")}</p>;
  const counts = new Map<string, number>();
  for (const tk of tasks) counts.set(tk.subjectId, (counts.get(tk.subjectId) ?? 0) + 1);

  return (
    <main style={{ padding: 32 }}>
      <h1>{t("subjects.h1")}</h1>
      <ul>
        {subjects.map((x) => (
          <li key={x.id}>
            {x.name} ({t("subjects.tasksCount", { n: counts.get(x.id) ?? 0 })})
            {x.examDate ? t("subjects.exam", { d: x.examDate.slice(0, 10) }) : ""}
          </li>
        ))}
      </ul>
      <SubjectForm uid={user.uid} onDone={reload} />
      <h2>{t("subjects.tasksH")}</h2>
      <TaskForm subjects={subjects} uid={user.uid} onDone={reload} />
      <h3>{t("subjects.yourTasks")}</h3>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            {task.title} · {t(`pr.${task.priority}`)} · {t(`st.${task.status}`)} ·{" "}
            {task.estimatedMin}
            {t("task.min")}
            {task.deadline ? t("task.due", { d: task.deadline.slice(0, 10) }) : ""}
          </li>
        ))}
      </ul>
      <p><Link href="/planner">← {t("nav.planner")}</Link></p>
    </main>
  );
}
