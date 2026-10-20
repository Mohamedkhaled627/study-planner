import type { FreeBlock, PlanItemDTO, PlanTask, UnfitDTO } from "./types";

export interface PlannerStrategy {
  generate(
    tasks: PlanTask[],
    blocks: FreeBlock[]
  ): { items: PlanItemDTO[]; unfit: UnfitDTO[] };
}
