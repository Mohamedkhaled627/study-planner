"use client";

import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/db";
import type { SubjectDoc } from "@/lib/repos";

const iso = (localDate: string) =>
  localDate ? new Date(`${localDate}T12:00:00`).toISOString() : null;

export function TaskForm({
  subjects,
  uid,
  onDone,
}: {
  subjects: SubjectDoc[];
  uid: string;
  onDone: () => void;
}) {
  if (!subjects.length) return <p>Create a subject first.</p>;
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const priority = String(f.get("priority")) as "LOW" | "MED" | "HIGH";
        try {
          await addDoc(collection(db, "tasks"), {
            userId: uid,
            subjectId: String(f.get("subjectId")),
            title: String(f.get("title")),
            deadline: iso(String(f.get("deadline") ?? "")),
            priority,
            estimatedMin: Number(f.get("estimatedMin")),
            status: "TODO",
            createdAt: Date.now(),
          });
          onDone();
        } catch (x) {
          alert(String(x));
        }
      }}
      style={{ display: "grid", gap: 8, maxWidth: 360 }}
    >
      <select name="subjectId" required>
        {subjects.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
      <input name="title" placeholder="Task title" required />
      <input name="deadline" type="date" />
      <select name="priority" defaultValue="MED">
        <option value="LOW">LOW</option>
        <option value="MED">MED</option>
        <option value="HIGH">HIGH</option>
      </select>
      <input name="estimatedMin" type="number" min={15} max={480} defaultValue={60} required />
      <button type="submit">Add task</button>
    </form>
  );
}

export function TaskStatusButtons({
  taskId,
  status,
  onDone,
}: {
  taskId: string;
  status: string;
  onDone: () => void;
}) {
  async function set(next: string) {
    await updateDoc(doc(db, "tasks", taskId), { status: next });
    onDone();
  }
  return (
    <span>
      {status === "DONE" ? (
        <button onClick={() => set("TODO")}>Undo</button>
      ) : (
        <button onClick={() => set("DONE")}>Done</button>
      )}
      {status === "SKIPPED" ? (
        <button onClick={() => set("TODO")}>Unskip</button>
      ) : (
        <button onClick={() => set("SKIPPED")}>Skip</button>
      )}
    </span>
  );
}
