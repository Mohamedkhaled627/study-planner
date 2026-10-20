import type { FreeBlock, PlanItemDTO } from "./types";

export function fromAllocation(
  taskId: string,
  block: FreeBlock,
  startMin: number,
  endMin: number
): PlanItemDTO {
  if (!(startMin < endMin)) throw new Error("start < end required");
  if (startMin < block.startMin || endMin > block.endMin)
    throw new Error("allocation outside block");
  return { taskId, weekday: block.weekday, startMin, endMin };
}
