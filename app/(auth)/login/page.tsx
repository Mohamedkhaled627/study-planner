"use client";

import { signInWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const router = useRouter();
  const [err, setErr] = useState("");
  return (
    <main style={{ padding: 32, maxWidth: 320 }}>
      <h1>Login</h1>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          try {
            const { firebaseAuth } = await import("@/lib/db");
            await signInWithEmailAndPassword(
              firebaseAuth,
              String(f.get("email")),
              String(f.get("password"))
            );
            router.push("/planner");
          } catch {
            setErr("Bad credentials");
          }
        }}
        style={{ display: "grid", gap: 8 }}
      >
        <input name="email" type="email" placeholder="email" required />
        <input name="password" type="password" placeholder="password" required />
        <button type="submit">Sign in</button>
        {err && <p style={{ color: "red" }}>{err}</p>}
        <Link href="/register">Need an account? Register</Link>
      </form>
    </main>
  );
}
