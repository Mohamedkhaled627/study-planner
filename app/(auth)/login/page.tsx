"use client";

import { signInWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { firebaseAuth } from "@/lib/db";
import { t, useLang } from "@/lib/i18n";

export default function Login() {
  const router = useRouter();
  useLang();
  const [err, setErr] = useState("");
  return (
    <main style={{ padding: 32, maxWidth: 320 }}>
      <h1>{t("login.title")}</h1>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          try {
            await signInWithEmailAndPassword(
              firebaseAuth,
              String(f.get("email")),
              String(f.get("password"))
            );
            router.push("/planner");
          } catch {
            setErr(t("login.err"));
          }
        }}
        style={{ display: "grid", gap: 8 }}
      >
        <input name="email" type="email" placeholder={t("ph.email")} required />
        <input name="password" type="password" placeholder={t("ph.password")} required />
        <button type="submit">{t("login.submit")}</button>
        {err && <p style={{ color: "red" }}>{err}</p>}
        <Link href="/register">{t("login.needAccount")}</Link>
      </form>
    </main>
  );
}
