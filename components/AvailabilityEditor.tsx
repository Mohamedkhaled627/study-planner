"use client";

import { useState } from "react";
import { DAYS } from "@/lib/week";
import { availabilityRepo } from "@/lib/repos";
import { t, useLang } from "@/lib/i18n";

type Seed = { weekday: number; startMin: number; endMin: number };

export default function AvailabilityEditor({
  uid,
  slots,
  onDone,
}: {
  uid: string;
  slots: Seed[];
  onDone: () => void;
}) {
  const byDay = new Map<number, Seed>(slots.map((s) => [s.weekday, s]));
  const [state, setState] = useState<Seed[]>(
    DAYS.map((_, w) => byDay.get(w) ?? { weekday: w, startMin: 0, endMin: 0 })
  );
  const [err, setErr] = useState("");
  useLang();

  const fmt = (m: number) =>
    m ? `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}` : "";
  const parse = (v: string) => {
    if (!v) return 0;
    const [h, m] = v.split(":").map(Number);
    return h * 60 + m;
  };

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          await availabilityRepo.replaceAll(
            uid,
            state.filter((s) => s.endMin > s.startMin || (s.startMin > 0 && s.endMin >= s.startMin))
          );
          onDone();
        } catch (x: unknown) {
          setErr(String(x));
        }
      }}
      style={{ display: "grid", gap: 6, maxWidth: 300 }}
    >
      {DAYS.map((d, w) => (
        <label key={d}>
          {t(`day.${d}`)}{" "}
          <input
            type="time"
            value={fmt(state[w].startMin)}
            onChange={(e) =>
              setState((s) =>
                s.map((x, i) => (i === w ? { ...x, startMin: parse(e.target.value) } : x))
              )
            }
          />
          {" – "}
          <input
            type="time"
            value={fmt(state[w].endMin)}
            onChange={(e) =>
              setState((s) =>
                s.map((x, i) => (i === w ? { ...x, endMin: parse(e.target.value) } : x))
              )
            }
          />
        </label>
      ))}
      <button type="submit">{t("avail.save")}</button>
      {err && <p style={{ color: "red" }}>{err}</p>}
    </form>
  );
}
