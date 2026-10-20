"use client";

import { useRouter } from "next/navigation";
import { mondayOf, weekKey } from "@/lib/week";

export default function GenerateButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        const res = await fetch("/api/plans/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ weekStart: weekKey(mondayOf(new Date())) }),
        });
        if (res.ok) router.refresh();
        else alert((await res.json()).error);
      }}
    >
      Generate week
    </button>
  );
}
