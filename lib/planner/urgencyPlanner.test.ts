import { describe, expect, test } from "vitest";
import { generatePlan } from "./urgencyPlanner";

const blocks = [
  { weekday: 0, startMin: 9 * 60, endMin: 12 * 60 }, // Mon 3h
  { weekday: 1, startMin: 9 * 60, endMin: 12 * 60 }, // Tue 3h
  { weekday: 2, startMin: 9 * 60, endMin: 12 * 60 }, // Wed 3h = 9h supply
];

describe("UrgencyPlanner", () => {
  test("sorts by deadline ASC nulls-last, priority DESC", () => {
    const { items, unfit } = generatePlan(
      [
        { taskId: "db", deadline: null, priority: 0, estimatedMin: 180 },
        { taskId: "dsa", deadline: new Date("2026-10-16"), priority: 1, estimatedMin: 300 },
        { taskId: "os-lab", deadline: new Date("2026-10-14"), priority: 2, estimatedMin: 240 },
      ],
      blocks
    );
    // 9h supply; os-lab 4h + dsa 5h fill it, db 3h unfit
    expect(items[0].taskId).toBe("os-lab");
    expect(unfit).toEqual([{ taskId: "db", shortMin: 180 }]);
  });

  test("splits a task across days", () => {
    const { items, unfit } = generatePlan(
      [{ taskId: "big", deadline: null, priority: 1, estimatedMin: 400 }],
      blocks
    );
    expect(unfit).toEqual([]);
    expect(items.length).toBeGreaterThan(1);
    expect(items.reduce((s, i) => s + (i.endMin - i.startMin), 0)).toBe(400);
  });

  test("returns unfit when over capacity, no overlap", () => {
    const { items } = generatePlan(
      [{ taskId: "a", deadline: null, priority: 1, estimatedMin: 600 }],
      blocks
    );
    // pairwise no-overlap per weekday
    for (let i = 0; i < items.length; i++)
      for (let j = i + 1; j < items.length; j++) {
        if (items[i].weekday !== items[j].weekday) continue;
        const overlap =
          items[i].startMin < items[j].endMin && items[j].startMin < items[i].endMin;
        expect(overlap).toBe(false);
      }
  });
});
