import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./db";
import { generatePlan } from "./planner/urgencyPlanner";
import type { PlanItemDTO, UnfitDTO } from "./planner/types";
import { availabilityRepo, taskRepo } from "./repos";

const prio = { LOW: 0, MED: 1, HIGH: 2 } as const;

// idempotent: doc id userId_weekStart is overwritten entirely on regenerate
export async function generateWeek(userId: string, weekStart: string) {
  const tasks = await taskRepo.list(userId, "TODO");
  const avail = await availabilityRepo.list(userId);
  const { items, unfit } = generatePlan(
    tasks.map((t) => ({
      taskId: t.id,
      deadline: t.deadline ? new Date(t.deadline) : null,
      priority: prio[t.priority],
      estimatedMin: t.estimatedMin,
    })),
    avail
  );
  const planId = `${userId}_${weekStart}`;
  await setDoc(doc(db, "weeklyPlans", planId), { userId, weekStart, items });
  return { plan: { id: planId, weekStart }, items, unfit };
}

export async function getCurrentWeek(userId: string, weekStart: string) {
  const planId = `${userId}_${weekStart}`;
  const snap = await getDoc(doc(db, "weeklyPlans", planId));
  if (!snap.exists()) return null;
  return {
    plan: { id: planId, weekStart },
    items: snap.data().items as PlanItemDTO[],
    unfit: [] as UnfitDTO[],
  };
}

export type { PlanItemDTO, UnfitDTO };
