"use client";

import { useEffect, useState } from "react";
import { useRequireUser } from "@/lib/useRequireUser";
import { useLang, t } from "@/lib/i18n";
import { subjectRepo, resourceRepo, type ResourceDoc, type SubjectDoc } from "@/lib/repos";
import ResourceCard, { ResourceForm } from "@/components/ResourceForm";
import Link from "next/link";

export default function ResourcesPage() {
  const user = useRequireUser();
  useLang();
  const [subjects, setSubjects] = useState<SubjectDoc[]>([]);
  const [resources, setResources] = useState<ResourceDoc[]>([]);
  const [tick, setTick] = useState(0);
  const reload = () => setTick((t) => t + 1);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setSubjects(await subjectRepo.list(user.uid));
      setResources(await resourceRepo.list(user.uid));
    })();
  }, [user, tick]);

  if (!user) return <p style={{ padding: 32 }}>{t("loading")}</p>;

  return (
    <main style={{ padding: 32 }}>
      <h1>{t("resources.h1")}</h1>
      {resources.map((r) => (
        <ResourceCard key={r.id} id={r.id} title={r.title} url={r.url} onDone={reload} />
      ))}
      {resources.length === 0 && <p className="sp-muted">{t("resources.none")}</p>}
      <h2>{t("resources.addH")}</h2>
      <ResourceForm subjects={subjects} uid={user.uid} onDone={reload} />
      <p><Link href="/planner">← {t("nav.planner")}</Link></p>
    </main>
  );
}
