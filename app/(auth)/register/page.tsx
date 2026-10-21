"use client";

import { createUserWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Register() {
  const router = useRouter();
  const [err, setErr] = useState("");
  return (
    <main style={{ padding: 32, maxWidth: 320 }}>
      <h1><span className="sp-marked">🚀 Register</span></h1>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          try {
            const { firebaseAuth } = await import("@/lib/db");
            await createUserWithEmailAndPassword(
              firebaseAuth,
              String(f.get("email")),
              String(f.get("password"))
            );
            router.push("/planner");
          } catch (x) {
            const code = (x as { code?: string }).code ?? "unknown";
            setErr(code.includes("email-already") ? "Email already in use" : String(code));
          }
        }}
        style={{ display: "grid", gap: 8 }}
      >
        <input name="email" type="email" placeholder="email" required />
        <input name="password" type="password" placeholder="password (min 6 chars)" minLength={6} required />
        <button type="submit">Create account</button>
        {err && <p style={{ color: "red" }}>{err}</p>}
        <Link href="/login">Have an account? Login</Link>
      </form>
    </main>
  );
}
