"use client";

import { addDoc, collection, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/db";

export default function ResourceCard({
  id,
  title,
  url,
  onDone,
}: {
  id: string;
  title: string;
  url: string;
  onDone: () => void;
}) {
  return (
    <div style={{ border: "1px solid #ddd", padding: 8, marginBottom: 8 }}>
      <a href={url} target="_blank" rel="noreferrer">{title}</a>{" "}
      <button
        onClick={async () => {
          await deleteDoc(doc(db, "resources", id));
          onDone();
        }}
      >
        Delete
      </button>
    </div>
  );
}

export function ResourceForm({
  subjects,
  uid,
  onDone,
}: {
  subjects: { id: string; name: string }[];
  uid: string;
  onDone: () => void;
}) {
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        try {
          await addDoc(collection(db, "resources"), {
            userId: uid,
            subjectId: String(f.get("subjectId")),
            title: String(f.get("title")),
            url: String(f.get("url")),
            type: String(f.get("type")),
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
        {subjects.map((x) => (
          <option key={x.id} value={x.id}>{x.name}</option>
        ))}
      </select>
      <input name="title" placeholder="title" required />
      <input name="url" type="url" placeholder="https://…" required />
      <select name="type" defaultValue="OTHER">
        <option>VIDEO</option>
        <option>DOC</option>
        <option>COURSE</option>
        <option>REPO</option>
        <option>OTHER</option>
      </select>
      <button type="submit">Save link</button>
    </form>
  );
}
