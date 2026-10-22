"use client";

import { createUserWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { firebaseAuth } from "@/lib/db";
import { t, useLang } from "@/lib/i18n";
import { requireVerification } from "@/lib/useRequireUser";

export default function Register() {
  const router = useRouter();
  useLang();
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  return (
    <main style={{ padding: 32, maxWidth: 320 }}>
      <h1>{t("register.title")}</h1>
      {sent ? (
        <p className="sp-muted">{t("verify.resent")}</p>
      ) : (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            try {
              const cred = await createUserWithEmailAndPassword(
                firebaseAuth,
                String(f.get("email")),
                String(f.get("password"))
              );
              // identity confirmation: email must be verified before the app opens
              await requireVerification(cred.user);
              setSent(true);
              router.replace("/verify");
            } catch (x) {
              const code = (x as { code?: string }).code ?? "unknown";
              setErr(code.includes("email-already") ? t("register.emailUsed") : String(code));
            }
          }}
          style={{ display: "grid", gap: 8 }}
        >
          <input name="email" type="email" placeholder={t("ph.email")} required />
          <input name="password" type="password" placeholder={t("register.passPh")} minLength={6} required />
          <button type="submit">{t("register.submit")}</button>
          {err && <p style={{ color: "red" }}>{err}</p>}
          <Link href="/login">{t("register.haveAccount")}</Link>
        </form>
      )}
    </main>
  );
}
