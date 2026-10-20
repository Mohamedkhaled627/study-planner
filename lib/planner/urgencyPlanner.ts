import { fromAllocation } from "./factory";
import type { PlannerStrategy } from "./strategy";
import type { FreeBlock, PlanTask } from "./types";

export const UrgencyPlanner: PlannerStrategy = {
  generate(tasks, blocks) {
    const todos = tasks.filter((t) => t.estimatedMin > 0);
    todos.sort((a, b) => {
      if (a.deadline && !b.deadline) return -1;
      if (!a.deadline && b.deadline) return 1;
      if (a.deadline && b.deadline && +a.deadline !== +b.deadline)
        return +a.deadline - +b.deadline;
      return b.priority - a.priority;
    });
    const free = blocks
      .map((b) => ({ ...b }))
      .sort((a, b) => a.weekday - b.weekday || a.startMin - b.startMin);
    const cursor = new Map(free.map((b, i) => [i, b.startMin]));
    const items: ReturnType<typeof fromAllocation>[] = [];
    const unfit: { taskId: string; shortMin: number }[] = [];

    for (const t of todos) {
      let remaining = t.estimatedMin;
      for (let i = 0; i < free.length && remaining > 0; i++) {
        const b = free[i];
        const cur = cursor.get(i)!;
        const avail = b.endMin - cur;
        if (avail <= 0) continue;
        const take = Math.min(avail, remaining);
        items.push(fromAllocation(t.taskId, b, cur, cur + take));
        cursor.set(i, cur + take);
        remaining -= take;
      }
      if (remaining > 0) unfit.push({ taskId: t.taskId, shortMin: remaining });
    }
    return { items, unfit };
  },
};

export function generatePlan(
  tasks: PlanTask[],
  blocks: FreeBlock[],
  strategy: PlannerStrategy = UrgencyPlanner
) {
  return strategy.generate(tasks, blocks);
}
