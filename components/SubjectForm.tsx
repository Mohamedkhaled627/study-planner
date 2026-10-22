"use client";

import { addDoc, collection } from "firebase/firestore";
import { useState } from "react";
import { db } from "@/lib/db";
import { t, useLang } from "@/lib/i18n";

export default function SubjectForm({
  uid,
  onDone,
}: {
  uid: string;
  onDone: () => void;
}) {
  const [err, setErr] = useState("");
  useLang();
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        try {
          await addDoc(collection(db, "subjects"), {
            userId: uid,
            name: String(f.get("name")),
            color: String(f.get("color")),
            examDate: null,
            createdAt: Date.now(),
          });
          onDone();
        } catch (x: unknown) {
          setErr(String(x));
        }
      }}
      style={{ display: "grid", gap: 8, maxWidth: 300 }}
    >
      <input name="name" placeholder={t("subjects.namePh")} required />
      <input name="color" type="color" defaultValue="#3b82f6" />
      <button type="submit">{t("subjects.add")}</button>
      {err && <p style={{ color: "red" }}>{err}</p>}
    </form>
  );
}
