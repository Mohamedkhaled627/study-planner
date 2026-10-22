"use client";

import { onAuthStateChanged, sendEmailVerification, type User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { firebaseAuth } from "@/lib/db";

// Gate for every app page: must be signed in AND have a verified email.
// Unverified users are pushed to /verify where they confirm their identity.
export function useRequireUser(): User | null {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(firebaseAuth.currentUser);

  useEffect(() => {
    const u = firebaseAuth.currentUser;
    if (!u) {
      router.replace("/login");
      return;
    }
    if (!u.emailVerified) {
      router.replace("/verify");
      return;
    }
    return onAuthStateChanged(firebaseAuth, (uu) => {
      if (uu) {
        setUser(uu);
        if (!uu.emailVerified) router.replace("/verify");
      } else {
        setUser(null);
        router.replace("/login");
      }
    });
  }, [router]);

  return user;
}

// called right after account creation: sends the identity-confirmation email
export async function requireVerification(user: User) {
  const base =
    typeof window !== "undefined"
      ? window.location.origin + (process.env.NEXT_PUBLIC_BASE_PATH || "/study-planner")
      : "";
  await sendEmailVerification(user, { url: `${base}/` });
}
