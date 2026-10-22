"use client";

import { useEffect, useState } from "react";
import { useRequireUser } from "@/lib/useRequireUser";
import { useLang, t } from "@/lib/i18n";
import { availabilityRepo } from "@/lib/repos";
import AvailabilityEditor from "@/components/AvailabilityEditor";
import Link from "next/link";

export default function AvailabilityPage() {
  const user = useRequireUser();
  useLang();
  const [slots, setSlots] = useState<{ weekday: number; startMin: number; endMin: number }[]>([]);
  const [tick, setTick] = useState(0);
  const reload = () => setTick((t) => t + 1);

  useEffect(() => {
    if (!user) return;
    availabilityRepo.list(user.uid).then(setSlots);
  }, [user, tick]);

  if (!user) return <p style={{ padding: 32 }}>{t("loading")}</p>;

  return (
    <main style={{ padding: 32 }}>
      <h1>{t("avail.h1")}</h1>
      <AvailabilityEditor uid={user.uid} slots={slots} onDone={reload} />
      <p><Link href="/planner">← {t("nav.planner")}</Link></p>
    </main>
  );
}
