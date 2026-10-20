"use client";

import { onAuthStateChanged, type User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { firebaseAuth } from "@/lib/db";

export function useRequireUser(): User | null {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(firebaseAuth.currentUser);
  useEffect(
    () =>
      onAuthStateChanged(firebaseAuth, (u) => {
        if (u) setUser(u);
        else router.replace("/login");
      }),
    [router]
  );
  return user;
}
