"use client";

import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { db, firebaseAuth } from "@/lib/db";
import { t, useLang } from "@/lib/i18n";
import { beep, toast } from "@/lib/notify";
import type { SubjectDoc } from "@/lib/repos";

const iso = (localDate: string) =>
  localDate ? new Date(`${localDate}T12:00:00`).toISOString() : null;

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));

export function TaskForm({
  subjects,
  uid,
  onDone,
}: {
  subjects: SubjectDoc[];
  uid: string;
  onDone: () => void;
}) {
  useLang();
  if (!subjects.length) return <p className="sp-muted">{t("subjects.createFirst")}</p>;
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const priority = String(f.get("priority")) as "LOW" | "MED" | "HIGH";
        const title = String(f.get("title"));
        const deadline = iso(String(f.get("deadline") ?? ""));
        try {
          await addDoc(collection(db, "tasks"), {
            userId: uid,
            subjectId: String(f.get("subjectId")),
            title,
            deadline,
            priority,
            estimatedMin: Number(f.get("estimatedMin")),
            status: "TODO",
            createdAt: Date.now(),
          });
          // queue the email reminder for the task's due date (sent by a scheduled Cloud Function)
          try {
            if (deadline && firebaseAuth.currentUser?.email) {
              await addDoc(collection(db, "mailQueue"), {
                userId: uid,
                to: firebaseAuth.currentUser.email,
                sendAt: new Date(deadline).getTime(),
                subject: t("mail.subject"),
                html: `<p>${esc(t("mail.body", { title: esc(title), d: new Date(deadline).toLocaleDateString() }))}</p>`,
                sent: false,
                createdAt: Date.now(),
              });
            }
          } catch { /* reminder queuing is best-effort; the task itself was already saved */ }
          beep();
          toast(t("notify.taskAdded"));
          onDone();
        } catch (x) {
          toast(String(x));
        }
      }}
      style={{ display: "grid", gap: 8, maxWidth: 360 }}
    >
      <select name="subjectId" required>
        {subjects.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
      <input name="title" placeholder={t("task.titlePh")} required />
      <input name="deadline" type="date" />
      <select name="priority" defaultValue="MED">
        <option value="LOW">{t("pr.LOW")}</option>
        <option value="MED">{t("pr.MED")}</option>
        <option value="HIGH">{t("pr.HIGH")}</option>
      </select>
      <input name="estimatedMin" type="number" min={15} max={480} defaultValue={60} required />
      <button type="submit">{t("task.add")}</button>
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
  useLang();
  async function set(next: string) {
    await updateDoc(doc(db, "tasks", taskId), { status: next });
    onDone();
  }
  return (
    <span>
      {status === "DONE" ? (
        <button className="btn-outline" onClick={() => set("TODO")}>{t("task.undo")}</button>
      ) : (
        <button className="btn-outline" onClick={() => set("DONE")}>{t("task.done")}</button>
      )}
      {status === "SKIPPED" ? (
        <button className="btn-outline" onClick={() => set("TODO")}>{t("task.unskip")}</button>
      ) : (
        <button className="btn-outline" onClick={() => set("SKIPPED")}>{t("task.skip")}</button>
      )}
    </span>
  );
}
