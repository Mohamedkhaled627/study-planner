"use client";

import { addDoc, collection, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/db";
import { t, useLang } from "@/lib/i18n";

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
  useLang();
  return (
    <div style={{ border: "1px solid #ddd", padding: 8, marginBottom: 8 }}>
      <a href={url} target="_blank" rel="noreferrer">{title}</a>{" "}
      <button className="btn-outline" onClick={async () => {
        await deleteDoc(doc(db, "resources", id));
        onDone();
      }}>
        {t("resources.delete")}
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
  useLang();
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
          toastError(String(x));
        }
      }}
      style={{ display: "grid", gap: 8, maxWidth: 360 }}
    >
      <select name="subjectId" required>
        {subjects.map((x) => (
          <option key={x.id} value={x.id}>{x.name}</option>
        ))}
      </select>
      <input name="title" placeholder={t("resources.titlePh")} required />
      <input name="url" type="url" placeholder="https://…" required />
      <select name="type" defaultValue="OTHER">
        <option value="VIDEO">{t("cit.VIDEO")}</option>
        <option value="DOC">{t("cit.DOC")}</option>
        <option value="COURSE">{t("cit.COURSE")}</option>
        <option value="REPO">{t("cit.REPO")}</option>
        <option value="OTHER">{t("cit.OTHER")}</option>
      </select>
      <button type="submit">{t("resources.save")}</button>
    </form>
  );
}

function toastError(msg: string) {
  // alert was the per-form fallback; keep errors visible without a host toast import cycle
  alert(msg);
}
