"use client";

import { sendEmailVerification } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { firebaseAuth } from "@/lib/db";
import { t, useLang } from "@/lib/i18n";

export default function VerifyPage() {
  const router = useRouter();
  useLang();
  const [note, setNote] = useState("");

  useEffect(() => {
    const u = firebaseAuth.currentUser;
    if (!u) {
      router.replace("/login");
      return;
    }
    if (u.emailVerified) router.replace("/planner");
  }, [router]);

  const email = firebaseAuth.currentUser?.email ?? "";
  const continueUrl = `${typeof window === "undefined" ? "" : window.location.origin}${process.env.NEXT_PUBLIC_BASE_PATH ?? "/study-planner"}/`;

  async function check() {
    const u = firebaseAuth.currentUser;
    if (!u) return;
    await u.reload();
    if (firebaseAuth.currentUser?.emailVerified) {
      router.replace("/planner");
    }
  }

  async function resend() {
    const u = firebaseAuth.currentUser;
    if (!u) return;
    try {
      await sendEmailVerification(u, { url: continueUrl });
      setNote(t("verify.resent"));
    } catch {
      setNote("⚠️ " + t("verify.wait"));
    }
  }

  return (
    <main style={{ padding: 32, maxWidth: 440 }}>
      <h1><span className="sp-marked">{t("verify.title")}</span></h1>
      <p className="sp-muted">{t("verify.body", { email })}</p>
      <div className="sp-cta">
        <button type="button" onClick={check}>{t("verify.check")}</button>
        <button type="button" className="btn-outline" onClick={resend}>{t("verify.resend")}</button>
      </div>
      {note && <p className="sp-muted">{note}</p>}
      <p><Link href="/login">{t("register.haveAccount")}</Link></p>
    </main>
  );
}
